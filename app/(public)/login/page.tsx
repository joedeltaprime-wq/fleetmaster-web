import type { Metadata } from 'next'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { LoginClient } from '@/components/auth/login-client'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Sign in | OPS' }

export default async function LoginPage() {
  const { env } = await getCloudflareContext({ async: true })
  return <LoginClient googleClientId={env.GOOGLE_CLIENT_ID ?? ''} />
}
