'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignOutButton } from './sign-out-button'

interface GoogleIdApi {
  initialize(options: { client_id: string; ux_mode: 'redirect'; login_uri: string }): void
  renderButton(element: HTMLElement, options: { theme: 'outline'; size: 'large'; width: number }): void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } }
  }
}

interface LoginState {
  authenticated: boolean
  authorized: boolean
  requestStatus: 'pending' | 'approved' | 'declined' | null
  email?: string | null
}

export function LoginClient({ googleClientId }: { googleClientId: string }) {
  const router = useRouter()
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const [login, setLogin] = useState<LoginState | null>(null)
  const [error, setError] = useState('')
  const [googleError, setGoogleError] = useState('')
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/me', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not validate the current session.')
        return response.json() as Promise<LoginState>
      })
      .then((state) => {
        if (!active) return
        setLogin(state)
        if (state.authenticated && state.authorized) router.replace('/overview')
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not validate the current session.')
      })
    return () => { active = false }
  }, [router])

  async function requestAccess() {
    setError('')
    setRequesting(true)
    try {
      const response = await fetch('/api/access/request', { method: 'POST' })
      const result = await response.json() as { status?: string; error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Could not request access.')
      setLogin((current) => current ? { ...current, requestStatus: result.status === 'pending' ? 'pending' : current.requestStatus } : current)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not request access.')
    } finally {
      setRequesting(false)
    }
  }

  const waitingForSession = login === null && !error
  const needsAccess = login?.authenticated && !login.authorized
  const showGoogleButton = !waitingForSession && !needsAccess && !login?.authorized && Boolean(googleClientId)

  useEffect(() => {
    if (!scriptReady || !showGoogleButton) return

    let cancelled = false
    let attempts = 0
    let retryTimer = 0
    let renderCheckTimer = 0

    function initializeButton() {
      if (cancelled) return
      const googleId = window.google?.accounts?.id
      if (!googleId) {
        if (attempts < 30) {
          attempts += 1
          retryTimer = window.setTimeout(initializeButton, 100)
          return
        }
        setGoogleError('Google sign-in loaded, but its button API did not become available. Check browser console errors or script/content blockers.')
        return
      }

      const element = googleButtonRef.current
      if (!element) {
        setGoogleError('The Google sign-in button container is unavailable. Reload the page and try again.')
        return
      }

      try {
        element.replaceChildren()
        googleId.initialize({
          client_id: googleClientId,
          ux_mode: 'redirect',
          login_uri: `${window.location.origin}/auth/google`,
        })
        googleId.renderButton(element, { theme: 'outline', size: 'large', width: 320 })
        setGoogleError('')
        renderCheckTimer = window.setTimeout(() => {
          if (!cancelled && !element.firstElementChild) {
            setGoogleError('Google sign-in initialized but rendered no button. Verify GOOGLE_CLIENT_ID and the staging Authorized JavaScript origin in Google Cloud Console.')
          }
        }, 1000)
      } catch (reason) {
        const detail = reason instanceof Error ? ` ${reason.message}` : ''
        setGoogleError(`Google sign-in could not be initialized.${detail} Verify the client ID and authorized staging origin.`)
      }
    }

    initializeButton()
    return () => {
      cancelled = true
      window.clearTimeout(retryTimer)
      window.clearTimeout(renderCheckTimer)
    }
  }, [googleClientId, scriptReady, showGoogleButton])

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      {googleClientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onReady={() => {
            setGoogleError('')
            setScriptReady(true)
          }}
          onError={() => setGoogleError('Google sign-in could not be loaded. Check the browser network console and staging Content Security Policy.')}
        />
      )}
      <section className="w-full max-w-md rounded-xl border bg-card p-7 shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">OPS</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Sign in to FleetMaster</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use your approved Google account to access operations.</p>

        {waitingForSession && <p className="mt-6 text-sm text-muted-foreground">Checking session…</p>}
        {!waitingForSession && !needsAccess && !login?.authorized && (
          <div className="mt-6">
            {googleClientId ? (
              <>
                <div id="google-login-button" ref={googleButtonRef} className="min-h-10" />
                {!scriptReady && <p className="mt-2 text-xs text-muted-foreground">Loading Google sign-in…</p>}
                {googleError && <p role="alert" className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{googleError}</p>}
              </>
            ) : (
              <p className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning">Google sign-in is not configured for this environment.</p>
            )}
          </div>
        )}
        {needsAccess && (
          <div className="mt-6 space-y-3">
            <p className="text-sm">Signed in as <span className="font-medium">{login.email || 'your Google account'}</span>, but access has not been approved.</p>
            {login?.requestStatus === 'pending' ? (
              <p className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">Your access request is pending owner approval.</p>
            ) : (
              <button type="button" disabled={requesting} onClick={requestAccess} className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
                {requesting ? 'Requesting…' : 'Request access'}
              </button>
            )}
            <SignOutButton className="w-full rounded-md border px-4 py-2.5 text-sm font-medium" />
          </div>
        )}
        {error && <p role="alert" className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      </section>
    </main>
  )
}
