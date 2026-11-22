import { SessionProvider } from '@/components/auth/session-provider'
import { requirePageUser } from '@/lib/auth/guards'

export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser()
  return (
    <SessionProvider user={{ email: user.email, name: user.name, picture: user.picture, role: user.role }}>
      {children}
    </SessionProvider>
  )
}
