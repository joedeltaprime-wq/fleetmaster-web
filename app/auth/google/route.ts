import { getAuthEnvironment } from '@/lib/auth/cloudflare'
import { matchesGoogleCsrf } from '@/lib/auth/csrf'
import { GoogleCredentialError, verifyGoogleCredential } from '@/lib/auth/google'
import { updateGoogleLoginUser } from '@/lib/auth/admin'
import { createSession, normalizeEmail, jsonError } from '@/lib/auth/session'

export async function POST(request: Request) {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return new Response('Invalid sign-in form', { status: 400, headers: { 'cache-control': 'no-store' } })
  }

  const csrfBody = form.get('g_csrf_token')
  const csrfCookie = request.headers.get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('g_csrf_token='))
    ?.slice('g_csrf_token='.length) ?? null
  if (typeof csrfBody !== 'string' || !matchesGoogleCsrf(csrfBody, csrfCookie)) {
    return new Response('Invalid CSRF token', { status: 400, headers: { 'cache-control': 'no-store' } })
  }

  const credential = form.get('credential')
  if (typeof credential !== 'string' || !credential) return jsonError('GOOGLE_SIGN_IN_FAILED', 401)

  const env = await getAuthEnvironment()
  if (!normalizeEmail(env.OWNER_EMAIL)) return jsonError('AUTH_NOT_CONFIGURED', 503)

  let identity
  try {
    identity = await verifyGoogleCredential(credential, env.GOOGLE_CLIENT_ID ?? '')
  } catch (error) {
    if (error instanceof GoogleCredentialError) return jsonError('GOOGLE_SIGN_IN_FAILED', error.status)
    throw error
  }

  await updateGoogleLoginUser(env, identity)
  const session = await createSession(request, env, identity)
  const account = await env.DB.prepare('SELECT status FROM users WHERE email = ? COLLATE NOCASE')
    .bind(normalizeEmail(identity.email))
    .first<{ status: string }>()
  const target = account?.status === 'active' ? '/overview' : '/login'
  const response = Response.redirect(new URL(target, request.url), 302)
  response.headers.set('set-cookie', session.cookie)
  response.headers.set('cache-control', 'no-store')
  return response
}
