import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthEnvironment } from './cloudflare'
import { authenticateRequest, SESSION_COOKIE, type AuthContext, type AuthUser } from './session'

export async function getCurrentAuth(): Promise<AuthContext> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const request = new Request('https://ops.local/', {
    headers: token ? { cookie: `${SESSION_COOKIE}=${token}` } : undefined,
  })
  return authenticateRequest(request, await getAuthEnvironment())
}

export async function requirePageUser(): Promise<AuthUser> {
  const auth = await getCurrentAuth()
  if (!auth.authorized || !auth.user) redirect('/login')
  return auth.user
}

export async function requirePageOwner(): Promise<AuthUser> {
  const user = await requirePageUser()
  if (user.role !== 'owner') redirect('/overview?error=owner_only')
  return user
}
