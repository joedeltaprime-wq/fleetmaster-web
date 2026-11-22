import assert from 'node:assert/strict'
import { generateKeyPairSync, sign } from 'node:crypto'
import test from 'node:test'
import { matchesGoogleCsrf } from '../lib/auth/csrf.ts'
import { verifyGoogleCredential } from '../lib/auth/google.ts'
import { authenticateRequest, createSession, deleteSession, requireActiveApi, requireOwnerApi, sameOriginRequest } from '../lib/auth/session.ts'

class MemoryDatabase {
  sessions = new Map()
  users = new Map()

  prepare(query) {
    const sql = query.replace(/\s+/gu, ' ').trim().toLowerCase()
    let values = []
    const statement = {
      bind: (...bound) => {
        values = bound
        return statement
      },
      first: async () => {
        if (sql.startsWith('select * from sessions where id')) return this.sessions.get(values[0]) ?? null
        if (sql.startsWith('select email, google_sub, name, picture, role, status from users')) return this.users.get(values[0]) ?? null
        if (sql.startsWith('select status from users')) return this.users.has(values[0]) ? { status: this.users.get(values[0]).status } : null
        return null
      },
      all: async () => ({ results: [] }),
      run: async () => {
        if (sql.startsWith('insert into sessions')) {
          this.sessions.set(values[0], {
            id: values[0],
            email: values[1],
            google_sub: values[2],
            name: values[3],
            picture: values[4],
            expires_at: values[5],
          })
        } else if (sql.startsWith('delete from sessions where id')) {
          this.sessions.delete(values[0])
        } else if (sql.startsWith('delete from sessions where expires_at')) {
          for (const [id, session] of this.sessions) if (session.expires_at <= values[0]) this.sessions.delete(id)
        } else if (sql.startsWith('insert into users')) {
          const previous = this.users.get(values[0]) ?? {}
          this.users.set(values[0], {
            email: values[0],
            google_sub: values[1] ?? previous.google_sub ?? null,
            name: values[2] ?? previous.name ?? null,
            picture: values[3] ?? previous.picture ?? null,
            role: 'owner',
            status: 'active',
          })
        }
        return { success: true }
      },
    }
    return statement
  }

  async batch(statements) {
    for (const statement of statements) await statement.run()
    return []
  }
}

function authEnvironment(database, overrides = {}) {
  return { DB: database, OWNER_EMAIL: 'owner@example.com', ...overrides }
}

function sessionRequest(token) {
  return new Request('https://ops.example.test/api/me', {
    headers: token ? { cookie: `kk_session=${token}` } : undefined,
  })
}

function tokenFromCookie(cookie) {
  return cookie.match(/^kk_session=([^;]+)/u)?.[1]
}

test('unauthorized requests are denied and authenticated but unapproved users remain request-capable', async () => {
  const db = new MemoryDatabase()
  const env = authEnvironment(db)
  const anonymous = await requireActiveApi(sessionRequest(null), env)
  assert.equal(anonymous.response.status, 401)

  const session = await createSession(sessionRequest(null), env, {
    sub: 'google-sub',
    email: 'waiting@example.com',
    name: 'Waiting User',
    picture: null,
  })
  const token = tokenFromCookie(session.cookie)
  assert.ok(token)
  assert.notEqual([...db.sessions.keys()][0], token)

  const auth = await authenticateRequest(sessionRequest(token), env)
  assert.equal(auth.authenticated, true)
  assert.equal(auth.authorized, false)
  assert.equal((await requireActiveApi(sessionRequest(token), env)).response.status, 403)
})

test('session lookup enforces active status and owner-only authorization', async () => {
  const db = new MemoryDatabase()
  db.users.set('owner@example.com', { email: 'owner@example.com', role: 'owner', status: 'active' })
  db.users.set('user@example.com', { email: 'user@example.com', role: 'user', status: 'active' })
  const env = authEnvironment(db)
  const ownerSession = await createSession(sessionRequest(null), env, {
    sub: 'owner-sub',
    email: 'owner@example.com',
    name: 'Owner',
    picture: null,
  })
  const userSession = await createSession(sessionRequest(null), env, {
    sub: 'user-sub',
    email: 'user@example.com',
    name: 'User',
    picture: null,
  })
  const ownerRequest = sessionRequest(tokenFromCookie(ownerSession.cookie))
  const userRequest = sessionRequest(tokenFromCookie(userSession.cookie))

  assert.equal((await requireOwnerApi(ownerRequest, env)).auth.role, 'owner')
  assert.equal((await requireOwnerApi(userRequest, env)).response.status, 403)

  db.users.set('user@example.com', { ...db.users.get('user@example.com'), status: 'revoked' })
  const revoked = await authenticateRequest(userRequest, env)
  assert.equal(revoked.authenticated, true)
  assert.equal(revoked.authorized, false)
})

test('session cookies are secure and logout removes the stored session', async () => {
  const db = new MemoryDatabase()
  const env = authEnvironment(db)
  const request = sessionRequest(null)
  const session = await createSession(request, env, {
    sub: 'user-sub',
    email: 'user@example.com',
    name: null,
    picture: null,
  })
  assert.match(session.cookie, /; HttpOnly; SameSite=Lax;/u)
  assert.match(session.cookie, /; Secure/u)
  const token = tokenFromCookie(session.cookie)
  const logoutCookie = await deleteSession(sessionRequest(token), env)
  assert.match(logoutCookie, /Max-Age=0/u)
  assert.equal(db.sessions.size, 0)
})

test('expired sessions are deleted and treated as anonymous', async () => {
  const db = new MemoryDatabase()
  const env = authEnvironment(db)
  const session = await createSession(sessionRequest(null), env, {
    sub: 'user-sub',
    email: 'user@example.com',
    name: null,
    picture: null,
  })
  const token = tokenFromCookie(session.cookie)
  const stored = [...db.sessions.values()][0]
  stored.expires_at = Date.now() - 1
  const auth = await authenticateRequest(sessionRequest(token), env)
  assert.equal(auth.authenticated, false)
  assert.equal(db.sessions.size, 0)
})

function base64url(value) {
  return Buffer.from(value).toString('base64url')
}

function createGoogleCredential(privateKey, claims, kid = 'test-key') {
  const header = base64url(JSON.stringify({ alg: 'RS256', kid }))
  const payload = base64url(JSON.stringify(claims))
  const signed = `${header}.${payload}`
  return `${signed}.${sign('RSA-SHA256', Buffer.from(signed), privateKey).toString('base64url')}`
}

test('Google credential validation verifies the signature and OIDC identity claims', async () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', alg: 'RS256', use: 'sig' }
  const now = Math.floor(Date.now() / 1000)
  const claims = {
    iss: 'https://accounts.google.com',
    aud: 'client-id',
    exp: now + 300,
    iat: now,
    sub: 'google-sub',
    email: ' User@Example.com ',
    email_verified: true,
    name: 'Example User',
  }
  const getKeys = async () => [jwk]
  const identity = await verifyGoogleCredential(createGoogleCredential(privateKey, claims), 'client-id', getKeys)
  assert.deepEqual(identity, {
    sub: 'google-sub',
    email: 'user@example.com',
    name: 'Example User',
    picture: null,
  })

  await assert.rejects(() => verifyGoogleCredential(createGoogleCredential(privateKey, claims), 'other-client', getKeys))
  await assert.rejects(() => verifyGoogleCredential(createGoogleCredential(privateKey, { ...claims, email_verified: false }), 'client-id', getKeys))
  const validCredential = createGoogleCredential(privateKey, claims)
  const segments = validCredential.split('.')
  segments[2] = `${segments[2][0] === 'A' ? 'B' : 'A'}${segments[2].slice(1)}`
  const invalidSignature = segments.join('.')
  await assert.rejects(() => verifyGoogleCredential(invalidSignature, 'client-id', getKeys))
})

test('Google OAuth CSRF uses a constant-time double-submit comparison', () => {
  assert.equal(matchesGoogleCsrf('same-token', 'same-token'), true)
  assert.equal(matchesGoogleCsrf('different', 'same-token'), false)
  assert.equal(matchesGoogleCsrf(null, 'same-token'), false)
})

test('mutating API origin checks reject missing and cross-site origins', () => {
  assert.equal(sameOriginRequest(new Request('https://ops.example.test/api/logout', {
    method: 'POST',
    headers: { origin: 'https://ops.example.test' },
  })), true)
  assert.equal(sameOriginRequest(new Request('https://ops.example.test/api/logout', {
    method: 'POST',
    headers: { origin: 'https://attacker.example' },
  })), false)
  assert.equal(sameOriginRequest(new Request('https://ops.example.test/api/logout', { method: 'POST' })), false)
})
