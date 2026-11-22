import { getAuthEnvironment } from '@/lib/auth/cloudflare'
import { authenticateRequest, jsonOk, pendingRequest } from '@/lib/auth/session'

export async function GET(request: Request) {
  const env = await getAuthEnvironment()
  const auth = await authenticateRequest(request, env)
  if (!auth.authenticated) return jsonOk({ authenticated: false, authorized: false })
  const requestStatus = auth.authorized || !auth.session
    ? null
    : await pendingRequest(env, auth.session.email)
  return jsonOk({
    authenticated: true,
    authorized: auth.authorized,
    role: auth.role,
    email: auth.session?.email ?? null,
    name: auth.session?.name ?? null,
    picture: auth.session?.picture ?? null,
    requestStatus: requestStatus && typeof requestStatus.status === 'string' ? requestStatus.status : null,
  })
}
