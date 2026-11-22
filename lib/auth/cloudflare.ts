import { getCloudflareContext } from '@opennextjs/cloudflare'
import type { AuthDatabase, AuthEnvironment } from './session'

declare global {
  interface CloudflareEnv {
    DB?: AuthDatabase
    GOOGLE_CLIENT_ID?: string
    OWNER_EMAIL?: string
    SESSION_TTL_HOURS?: string
  }
}

export async function getAuthEnvironment(): Promise<AuthEnvironment> {
  const { env } = await getCloudflareContext({ async: true })
  if (!env.DB) throw new Error('Cloudflare D1 binding DB is not configured')
  return env as AuthEnvironment
}
