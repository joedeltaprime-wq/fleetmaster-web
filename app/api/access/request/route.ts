import { getAuthEnvironment } from '@/lib/auth/cloudflare'
import { requestAccess } from '@/lib/auth/admin'
import { authenticateRequest, badOriginResponse, jsonError, jsonOk, sameOriginRequest } from '@/lib/auth/session'

export async function POST(request: Request) {
  if (!sameOriginRequest(request)) return badOriginResponse()
  const env = await getAuthEnvironment()
  const auth = await authenticateRequest(request, env)
  if (!auth.authenticated || !auth.session) return jsonError('UNAUTHENTICATED', 401)
  if (auth.authorized) return jsonOk({ ok: true, status: 'already_authorized' })
  const status = await requestAccess(env, auth.session)
  return jsonOk({ ok: true, status })
}
