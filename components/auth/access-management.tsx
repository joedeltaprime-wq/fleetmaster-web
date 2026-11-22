'use client'

import { useCallback, useEffect, useState } from 'react'

interface ManagedUser {
  email: string
  name: string | null
  role: 'owner' | 'user'
  status: 'active' | 'revoked'
  added_at: string
  last_login_at: string | null
}

interface AccessRequest {
  id: number
  email: string
  name: string | null
  status: 'pending' | 'approved' | 'declined'
  requested_at: string
}

async function postJson(path: string, value: Record<string, unknown>): Promise<void> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(value),
  })
  if (!response.ok) {
    const body = await response.json() as { error?: string }
    throw new Error(body.error ?? 'The access action failed.')
  }
}

export function AccessManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const [usersResponse, requestsResponse] = await Promise.all([
        fetch('/api/admin/users', { cache: 'no-store' }),
        fetch('/api/admin/requests', { cache: 'no-store' }),
      ])
      if (!usersResponse.ok || !requestsResponse.ok) throw new Error('Could not load access records.')
      const usersBody = await usersResponse.json() as { users: ManagedUser[] }
      const requestsBody = await requestsResponse.json() as { requests: AccessRequest[] }
      setUsers(usersBody.users)
      setRequests(requestsBody.requests)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load access records.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function perform(action: () => Promise<void>) {
    setBusy(true)
    setError('')
    try {
      await action()
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The access action failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-primary">OPS / Administration</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Access management</h1>
        <p className="mt-2 text-sm text-muted-foreground">Approve requests and manage active user access.</p>
      </header>

      {error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Access requests</h2>
        {loading ? <p className="mt-4 text-sm text-muted-foreground">Loading requests…</p> : requests.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">There are no access requests.</p>
        ) : (
          <div className="mt-4 divide-y">
            {requests.map((request) => (
              <div key={request.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{request.name || request.email}</p>
                  {request.name && <p className="truncate text-xs text-muted-foreground">{request.email}</p>}
                  <p className="text-xs text-muted-foreground">{request.status} · {new Date(request.requested_at).toLocaleDateString()}</p>
                </div>
                {request.status === 'pending' && (
                  <>
                    <button disabled={busy} onClick={() => void perform(() => postJson('/api/admin/requests/approve', { id: request.id }))} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50">Approve</button>
                    <button disabled={busy} onClick={() => void perform(() => postJson('/api/admin/requests/decline', { id: request.id }))} className="rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-50">Decline</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Users</h2>
        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            void perform(async () => {
              await postJson('/api/admin/users', { email })
              setEmail('')
            })
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            aria-label="User email"
            className="min-w-56 flex-1 rounded-md border bg-background px-3 py-2 text-sm"
          />
          <button type="submit" disabled={busy} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">Add user</button>
        </form>

        {loading ? <p className="mt-4 text-sm text-muted-foreground">Loading users…</p> : (
          <div className="mt-4 divide-y">
            {users.map((user) => (
              <div key={user.email} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{user.name || user.email}</p>
                  {user.name && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
                  <p className="text-xs text-muted-foreground">{user.role} · {user.status}{user.last_login_at ? ` · Last login ${new Date(user.last_login_at).toLocaleDateString()}` : ''}</p>
                </div>
                {user.role !== 'owner' && user.status === 'active' && (
                  <button disabled={busy} onClick={() => void perform(() => postJson('/api/admin/users/revoke', { email: user.email }))} className="rounded-md border px-3 py-1.5 text-xs font-medium text-destructive disabled:opacity-50">Revoke</button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
