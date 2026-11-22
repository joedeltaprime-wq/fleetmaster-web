import { getAuthEnvironment } from '@/lib/auth/cloudflare'
import { jsonOk, requireOwnerApi } from '@/lib/auth/session'

export async function GET(request: Request) {
  const env = await getAuthEnvironment()
  const authorization = await requireOwnerApi(request, env)
  if (authorization.response) return authorization.response
  const result = await env.DB.prepare(`
    SELECT id, email, name, picture, status, requested_at, resolved_at, resolved_by
    FROM access_requests
    ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, id DESC
    LIMIT 100
  `).all()
  return jsonOk({ requests: result.results ?? [] })
}
