'use client'

import { useMemo, useState } from 'react'
import { MessageSquareText, Search, Store, UserRound } from 'lucide-react'
import { positionShort } from '@/lib/data/positions'
import type { TireEvent } from '@/lib/data/types'
import { fmtCurrency, fmtDate } from '@/lib/format'
import { EmptyState, NativeSelect } from '@/components/ops/primitives'

const PAGE = 15

export function UnitTimeline({ events }: { events: TireEvent[] }) {
  const [query, setQuery] = useState('')
  const [reason, setReason] = useState('all')
  const [limit, setLimit] = useState(PAGE)

  const reasons = useMemo(() => [...new Set(events.map((e) => e.reason))].sort(), [events])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter(
      (e) =>
        (reason === 'all' || e.reason === reason) &&
        (!q || [e.comments, e.driver, e.vendor, e.reason, ...e.positions.map(positionShort)].some((s) => s.toLowerCase().includes(q))),
    )
  }, [events, query, reason])

  const visible = filtered.slice(0, limit)
  const groups: { year: string; items: TireEvent[]; total: number }[] = []
  for (const e of visible) {
    const y = e.date.slice(0, 4)
    let g = groups[groups.length - 1]
    if (!g || g.year !== y) {
      g = { year: y, items: [], total: 0 }
      groups.push(g)
    }
    g.items.push(e)
  }
  const yearTotals = new Map<string, number>()
  for (const e of filtered) yearTotals.set(e.date.slice(0, 4), (yearTotals.get(e.date.slice(0, 4)) ?? 0) + e.cost)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex flex-1 items-center">
          <span className="sr-only">Search history</span>
          <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setLimit(PAGE)
            }}
            placeholder="Search comments, driver, vendor, position"
            className="h-8 w-full rounded-lg border bg-background pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </label>
        <NativeSelect
          label="Filter by reason"
          value={reason}
          onChange={(v) => {
            setReason(v)
            setLimit(PAGE)
          }}
          className="sm:w-48"
          options={[{ value: 'all', label: 'All reasons' }, ...reasons.map((r) => ({ value: r, label: r }))]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="No matching events" description="Try a different search or reason." />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((g) => (
            <section key={g.year} aria-label={`${g.year} events`}>
              <div className="mb-2 flex items-baseline justify-between border-b pb-2">
                <h3 className="text-sm font-semibold tabular">{g.year}</h3>
                <span className="text-[11px] text-muted-foreground tabular">{fmtCurrency(yearTotals.get(g.year) ?? 0)} total</span>
              </div>
              <ol className="relative ml-1.5 border-l">
                {g.items.map((e) => (
                  <li key={e.id} className="relative pb-4 pl-5 last:pb-1">
                    <span className="absolute -left-[4.5px] top-1.5 size-2 rounded-full border-2 border-card bg-primary ring-1 ring-border" aria-hidden="true" />
                    <div className="flex flex-col gap-1.5 rounded-lg px-3 py-2 transition-colors hover:bg-accent/40 sm:flex-row sm:items-start sm:gap-4">
                      <time dateTime={e.date} className="w-24 shrink-0 pt-0.5 text-xs text-muted-foreground tabular">
                        {fmtDate(e.date)}
                      </time>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-medium">{e.reason}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">
                            {e.quantity} {e.quantity === 1 ? 'tire' : 'tires'}
                          </span>
                          <span className="flex flex-wrap gap-1">
                            {e.positions.map((pos, i) => (
                              <span key={`${pos}-${i}`} className="rounded border bg-muted/40 px-1.5 py-px font-mono text-[10px]">
                                {positionShort(pos)}
                              </span>
                            ))}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Store className="size-3" aria-hidden="true" />
                            {e.vendor}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <UserRound className="size-3" aria-hidden="true" />
                            {e.driver}
                          </span>
                        </div>
                        {e.comments && (
                          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                            <MessageSquareText className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                            <span className="text-pretty">{e.comments}</span>
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular sm:text-right">{fmtCurrency(e.cost)}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      {filtered.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((l) => l + PAGE * 2)}
          className="mx-auto h-8 rounded-lg border px-4 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Show more ({filtered.length - limit} remaining)
        </button>
      )}
    </div>
  )
}
