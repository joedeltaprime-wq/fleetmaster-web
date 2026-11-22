import { getAuthEnvironment } from '@/lib/auth/cloudflare'
import { addUser } from '@/lib/auth/admin'
import { readJsonObject, isValidEmail } from '@/lib/auth/http'
import {
  badOriginResponse,
  jsonError,
  jsonOk,
  normalizeEmail,
  requireOwnerApi,
  sameOriginRequest,
} from '@/lib/auth/session'

export async function GET(request: Request) {
  const env = await getAuthEnvironment()
  const authorization = await requireOwnerApi(request, env)
  if (authorization.response) return authorization.response
  const result = await env.DB.prepare(`
    SELECT email, name, picture, role, status, added_by, added_at, last_login_at
    FROM users ORDER BY CASE role WHEN 'owner' THEN 0 ELSE 1 END, email
  `).all()
  return jsonOk({ users: result.results ?? [] })
}

export async function POST(request: Request) {
  if (!sameOriginRequest(request)) return badOriginResponse()
  const env = await getAuthEnvironment()
  const authorization = await requireOwnerApi(request, env)
  if (authorization.response) return authorization.response
  const body = await readJsonObject(request)
  const email = normalizeEmail(typeof body?.email === 'string' ? body.email : '')
  if (!isValidEmail(email)) return jsonError('VALID_EMAIL_REQUIRED', 400)
  const role = await addUser(env, authorization.auth.user!, email)
  return jsonOk({ ok: true, email, role })
}
