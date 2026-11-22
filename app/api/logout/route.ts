import { getAuthEnvironment } from '@/lib/auth/cloudflare'
import { badOriginResponse, deleteSession, jsonOk, sameOriginRequest } from '@/lib/auth/session'

export async function POST(request: Request) {
  if (!sameOriginRequest(request)) return badOriginResponse()
  const cookie = await deleteSession(request, await getAuthEnvironment())
  const response = jsonOk()
  response.headers.set('set-cookie', cookie)
  return response
}
