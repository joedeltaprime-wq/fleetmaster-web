import { getAuthEnvironment } from '@/lib/auth/cloudflare'
import { resolveAccessRequest } from '@/lib/auth/admin'
import { readJsonObject } from '@/lib/auth/http'
import {
  badOriginResponse,
  jsonError,
  jsonOk,
  requireOwnerApi,
  sameOriginRequest,
} from '@/lib/auth/session'

export async function POST(request: Request) {
  if (!sameOriginRequest(request)) return badOriginResponse()
  const env = await getAuthEnvironment()
  const authorization = await requireOwnerApi(request, env)
  if (authorization.response) return authorization.response
  const body = await readJsonObject(request)
  const id = Number(body?.id)
  if (!Number.isInteger(id) || id <= 0) return jsonError('VALID_REQUEST_ID_REQUIRED', 400)
  const result = await resolveAccessRequest(env, authorization.auth.user!, id, 'decline')
  if (result === 'not_found') return jsonError('REQUEST_NOT_FOUND', 404)
  return jsonOk()
}
