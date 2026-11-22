import { ensureOwnerAccount, normalizeEmail, type AuthEnvironment, type AuthRole, type AuthUser, type SessionRow } from './session'

export async function writeAudit(
  env: AuthEnvironment,
  actorEmail: string,
  action: string,
  targetEmail: string | null = null,
  details: Record<string, unknown> | null = null,
): Promise<void> {
  await env.DB.prepare(`
    INSERT INTO audit_log (actor_email, action, target_email, details)
    VALUES (?, ?, ?, ?)
  `).bind(actorEmail, action, targetEmail, details ? JSON.stringify(details) : null).run()
}

export async function requestAccess(env: AuthEnvironment, session: SessionRow): Promise<'pending' | 'already_authorized'> {
  const currentUser = await env.DB.prepare('SELECT status FROM users WHERE email = ? COLLATE NOCASE')
    .bind(session.email)
    .first<{ status: string }>()
  if (currentUser?.status === 'active') return 'already_authorized'

  const existing = await env.DB.prepare(`
    SELECT id FROM access_requests
    WHERE email = ? COLLATE NOCASE AND status='pending'
    ORDER BY id DESC LIMIT 1
  `).bind(session.email).first()
  if (!existing) {
    await env.DB.prepare(`
      INSERT INTO access_requests (email, google_sub, name, picture, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).bind(session.email, session.google_sub, session.name, session.picture).run()
    await writeAudit(env, session.email, 'REQUEST_ACCESS', session.email)
  }
  return 'pending'
}

export async function updateGoogleLoginUser(
  env: AuthEnvironment,
  identity: { sub: string; email: string; name: string | null; picture: string | null },
): Promise<void> {
  const ownerEmail = normalizeEmail(env.OWNER_EMAIL)
  if (normalizeEmail(identity.email) === ownerEmail) {
    await ensureOwnerAccount(env, identity)
  }

  const existing = await env.DB.prepare('SELECT role, status FROM users WHERE email = ? COLLATE NOCASE')
    .bind(normalizeEmail(identity.email))
    .first<{ role: AuthRole; status: 'active' | 'revoked' }>()
  if (!existing) return

  const role = normalizeEmail(identity.email) === ownerEmail ? 'owner' : existing.role
  const status = normalizeEmail(identity.email) === ownerEmail ? 'active' : existing.status
  await env.DB.prepare(`
    UPDATE users SET google_sub=?, name=?, picture=?, role=?, status=?, last_login_at=?
    WHERE email=? COLLATE NOCASE
  `).bind(identity.sub, identity.name, identity.picture, role, status, new Date().toISOString(), normalizeEmail(identity.email)).run()
}

export async function addUser(
  env: AuthEnvironment,
  actor: AuthUser,
  email: string,
): Promise<AuthRole> {
  const role: AuthRole = normalizeEmail(email) === normalizeEmail(env.OWNER_EMAIL) ? 'owner' : 'user'
  await env.DB.prepare(`
    INSERT INTO users (email, role, status, added_by)
    VALUES (?, ?, 'active', ?)
    ON CONFLICT(email) DO UPDATE SET role=excluded.role, status='active', added_by=excluded.added_by
  `).bind(normalizeEmail(email), role, actor.email).run()
  await env.DB.prepare(`
    UPDATE access_requests SET status='approved', resolved_at=?, resolved_by=?
    WHERE email=? COLLATE NOCASE AND status='pending'
  `).bind(new Date().toISOString(), actor.email, normalizeEmail(email)).run()
  await writeAudit(env, actor.email, 'ADD_USER', normalizeEmail(email))
  return role
}

export async function revokeUser(env: AuthEnvironment, actor: AuthUser, email: string): Promise<void> {
  await env.DB.batch([
    env.DB.prepare("UPDATE users SET status='revoked' WHERE email=? COLLATE NOCASE").bind(normalizeEmail(email)),
    env.DB.prepare('DELETE FROM sessions WHERE email=? COLLATE NOCASE').bind(normalizeEmail(email)),
  ])
  await writeAudit(env, actor.email, 'REVOKE_USER', normalizeEmail(email))
}

export async function resolveAccessRequest(
  env: AuthEnvironment,
  actor: AuthUser,
  requestId: number,
  action: 'approve' | 'decline',
): Promise<'not_found' | 'ok'> {
  const accessRequest = await env.DB.prepare('SELECT * FROM access_requests WHERE id = ?')
    .bind(requestId)
    .first<{
      id: number
      email: string
      google_sub: string | null
      name: string | null
      picture: string | null
    }>()
  if (!accessRequest) return 'not_found'

  const now = new Date().toISOString()
  if (action === 'approve') {
    const role: AuthRole = normalizeEmail(accessRequest.email) === normalizeEmail(env.OWNER_EMAIL) ? 'owner' : 'user'
    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO users (email, google_sub, name, picture, role, status, added_by)
        VALUES (?, ?, ?, ?, ?, 'active', ?)
        ON CONFLICT(email) DO UPDATE SET
          google_sub=COALESCE(excluded.google_sub, users.google_sub),
          name=COALESCE(excluded.name, users.name),
          picture=COALESCE(excluded.picture, users.picture),
          role=excluded.role,
          status='active',
          added_by=excluded.added_by
      `).bind(accessRequest.email, accessRequest.google_sub, accessRequest.name, accessRequest.picture, role, actor.email),
      env.DB.prepare(`
        UPDATE access_requests SET status='approved', resolved_at=?, resolved_by=? WHERE id=?
      `).bind(now, actor.email, requestId),
    ])
    await writeAudit(env, actor.email, 'APPROVE_REQUEST', accessRequest.email, { requestId })
  } else {
    await env.DB.prepare(`
      UPDATE access_requests SET status='declined', resolved_at=?, resolved_by=? WHERE id=?
    `).bind(now, actor.email, requestId).run()
    await writeAudit(env, actor.email, 'DECLINE_REQUEST', accessRequest.email, { requestId })
  }
  return 'ok'
}
