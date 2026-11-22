import { getAuthEnvironment } from '@/lib/auth/cloudflare'
import { revokeUser } from '@/lib/auth/admin'
import { readJsonObject, isValidEmail } from '@/lib/auth/http'
import {
  badOriginResponse,
  jsonError,
  jsonOk,
  normalizeEmail,
  requireOwnerApi,
  sameOriginRequest,
} from '@/lib/auth/session'

export async function POST(request: Request) {
  if (!sameOriginRequest(request)) return badOriginResponse()
  const env = await getAuthEnvironment()
  const authorization = await requireOwnerApi(request, env)
  if (authorization.response) return authorization.response
  const body = await readJsonObject(request)
  const email = normalizeEmail(typeof body?.email === 'string' ? body.email : '')
  if (!isValidEmail(email)) return jsonError('VALID_EMAIL_REQUIRED', 400)
  if (email === normalizeEmail(env.OWNER_EMAIL)) return jsonError('OWNER_CANNOT_BE_REMOVED', 400)
  await revokeUser(env, authorization.auth.user!, email)
  return jsonOk()
}
