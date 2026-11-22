'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [error, setError] = useState('')

  async function signOut() {
    setError('')
    try {
      const response = await fetch('/api/logout', { method: 'POST' })
      if (!response.ok) throw new Error('Sign out failed. Please try again.')
      router.replace('/login')
      router.refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Sign out failed. Please try again.')
    }
  }

  return (
    <div>
      <button type="button" onClick={signOut} className={className}>Sign out</button>
      {error && <p role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}
