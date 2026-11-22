'use client'

import { createContext, useContext } from 'react'
import type { AuthRole } from '@/lib/auth/session'

export interface AuthenticatedProfile {
  email: string
  name: string | null
  picture: string | null
  role: AuthRole
}

const SessionContext = createContext<AuthenticatedProfile | null>(null)

export function SessionProvider({
  user,
  children,
}: {
  user: AuthenticatedProfile
  children: React.ReactNode
}) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
}

export function useAuthSession(): AuthenticatedProfile {
  const session = useContext(SessionContext)
  if (!session) throw new Error('Authenticated session is not available')
  return session
}
