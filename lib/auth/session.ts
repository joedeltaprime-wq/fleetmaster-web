export const SESSION_COOKIE = 'kk_session'

export type AuthRole = 'owner' | 'user'

export interface AuthStatement {
  bind(...values: (string | number | null)[]): AuthStatement
  first<T = Record<string, unknown>>(): Promise<T | null>
  all<T = Record<string, unknown>>(): Promise<{ results?: T[] }>
  run(): Promise<unknown>
}

export interface AuthDatabase {
  prepare(query: string): AuthStatement
  batch(statements: AuthStatement[]): Promise<unknown>
}

export interface AuthEnvironment {
  DB: AuthDatabase
  GOOGLE_CLIENT_ID?: string
  OWNER_EMAIL?: string
  SESSION_TTL_HOURS?: string
}

export interface GoogleIdentity {
  sub: string
  email: string
  name: string | null
  picture: string | null
}

export interface SessionRow {
  id: string
  email: string
  google_sub: string
  name: string | null
  picture: string | null
  created_at: string
  expires_at: number
}

export interface AuthUser {
  email: string
  googleSub: string
  name: string | null
  picture: string | null
  role: AuthRole
}

export interface AuthContext {
  authenticated: boolean
  authorized: boolean
  role: AuthRole | null
  session: SessionRow | null
  user: AuthUser | null
}

interface UserRow {
  email: string
  google_sub: string | null
  name: string | null
  picture: string | null
  role: AuthRole
  status: 'active' | 'revoked'
}

const ANONYMOUS: AuthContext = {
  authenticated: false,
  authorized: false,
  role: null,
  session: null,
  user: null,
}

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase()
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')
}

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return bytesToBase64Url(new Uint8Array(digest))
}

function cookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null
  const entry = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))
  return entry ? entry.slice(name.length + 1) || null : null
}

export function getSessionCookie(request: Request): string | null {
  return cookieValue(request.headers.get('cookie'), SESSION_COOKIE)
}

function sessionTtlSeconds(env: AuthEnvironment): number {
  const hours = Number(env.SESSION_TTL_HOURS ?? 12)
  return (Number.isFinite(hours) && hours > 0 ? Math.max(1, hours) : 12) * 60 * 60
}

export function serializeSessionCookie(request: Request, token: string, maxAge: number): string {
  const secure = new URL(request.url).protocol === 'https:'
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`
}

export function clearSessionCookie(request: Request): string {
  const secure = new URL(request.url).protocol === 'https:'
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`
}

export async function createSession(
  request: Request,
  env: AuthEnvironment,
  identity: GoogleIdentity,
): Promise<{ cookie: string; expiresAt: number }> {
  const rawToken = crypto.getRandomValues(new Uint8Array(32))
  const token = bytesToBase64Url(rawToken)
  const expiresAt = Date.now() + sessionTtlSeconds(env) * 1000
  await env.DB.prepare(`
    INSERT INTO sessions (id, email, google_sub, name, picture, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    await hashToken(token),
    normalizeEmail(identity.email),
    identity.sub,
    identity.name,
    identity.picture,
    expiresAt,
  ).run()
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(Date.now()).run()
  return { cookie: serializeSessionCookie(request, token, Math.floor((expiresAt - Date.now()) / 1000)), expiresAt }
}

export async function deleteSession(request: Request, env: AuthEnvironment): Promise<string> {
  const token = getSessionCookie(request)
  if (token) {
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(await hashToken(token)).run()
  }
  return clearSessionCookie(request)
}

export async function ensureOwnerAccount(env: AuthEnvironment, identity?: GoogleIdentity): Promise<void> {
  const ownerEmail = normalizeEmail(env.OWNER_EMAIL)
  if (!ownerEmail) throw new Error('OWNER_EMAIL is not configured')
  const now = identity ? new Date().toISOString() : null
  await env.DB.prepare(`
    INSERT INTO users (email, google_sub, name, picture, role, status, added_by, last_login_at)
    VALUES (?, ?, ?, ?, 'owner', 'active', ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      role='owner',
      status='active',
      google_sub=COALESCE(excluded.google_sub, users.google_sub),
      name=COALESCE(excluded.name, users.name),
      picture=COALESCE(excluded.picture, users.picture),
      last_login_at=COALESCE(excluded.last_login_at, users.last_login_at)
  `).bind(ownerEmail, identity?.sub ?? null, identity?.name ?? null, identity?.picture ?? null, ownerEmail, now).run()
}

export async function authenticateRequest(request: Request, env: AuthEnvironment): Promise<AuthContext> {
  const token = getSessionCookie(request)
  if (!token) return ANONYMOUS

  const sessionId = await hashToken(token)
  const session = await env.DB.prepare('SELECT * FROM sessions WHERE id = ?').bind(sessionId).first<SessionRow>()
  if (!session) return ANONYMOUS
  if (!Number.isFinite(Number(session.expires_at)) || Number(session.expires_at) <= Date.now()) {
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run()
    return ANONYMOUS
  }

  const normalizedEmail = normalizeEmail(session.email)
  if (normalizedEmail === normalizeEmail(env.OWNER_EMAIL)) await ensureOwnerAccount(env)

  const account = await env.DB.prepare('SELECT email, google_sub, name, picture, role, status FROM users WHERE email = ? COLLATE NOCASE')
    .bind(normalizedEmail)
    .first<UserRow>()
  if (!account || account.status !== 'active') {
    return { authenticated: true, authorized: false, role: null, session, user: null }
  }

  return {
    authenticated: true,
    authorized: true,
    role: account.role,
    session,
    user: {
      email: account.email,
      googleSub: account.google_sub ?? session.google_sub,
      name: account.name ?? session.name,
      picture: account.picture ?? session.picture,
      role: account.role,
    },
  }
}

export async function pendingRequest(env: AuthEnvironment, email: string): Promise<Record<string, unknown> | null> {
  return env.DB.prepare(`
    SELECT id, status, requested_at, resolved_at
    FROM access_requests
    WHERE email = ? COLLATE NOCASE
    ORDER BY id DESC LIMIT 1
  `).bind(normalizeEmail(email)).first()
}

export type ApiAuthorization = { auth: AuthContext; response: null } | { auth: null; response: Response }

function jsonResponse(body: unknown, status: number): Response {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store' } })
}

export async function requireActiveApi(request: Request, env: AuthEnvironment): Promise<ApiAuthorization> {
  const auth = await authenticateRequest(request, env)
  if (!auth.authenticated) return { auth: null, response: jsonResponse({ error: 'UNAUTHENTICATED' }, 401) }
  if (!auth.authorized) return { auth: null, response: jsonResponse({ error: 'ACCESS_REQUIRED' }, 403) }
  return { auth, response: null }
}

export async function requireOwnerApi(request: Request, env: AuthEnvironment): Promise<ApiAuthorization> {
  const result = await requireActiveApi(request, env)
  if (result.response) return result
  if (result.auth.role !== 'owner') return { auth: null, response: jsonResponse({ error: 'OWNER_ONLY' }, 403) }
  return result
}

export function sameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}

export function badOriginResponse(): Response {
  return jsonResponse({ error: 'INVALID_ORIGIN' }, 403)
}

export function jsonError(error: string, status: number): Response {
  return jsonResponse({ error }, status)
}

export function jsonOk(body: unknown = { ok: true }, status = 200): Response {
  return jsonResponse(body, status)
}
