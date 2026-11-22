'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, ChevronRight, Repeat, Search } from 'lucide-react'
import type { TypeFilter } from '@/lib/analytics'
import type { UnitSummary } from '@/lib/data/types'
import { fmtCurrency, fmtDate, fmtNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { EmptyState, KpiCard, PageHeader, SampleNotice } from '@/components/ops/primitives'
import { Segmented } from '@/components/ops/segmented'
import { Sparkline } from './sparkline'

type SortKey = 'number' | 'lifetimeCost' | 'ytdCost' | 'tires' | 'events' | 'lastDate'

export function UnitDirectory({ summaries, asOf, isLive = false }: { summaries: UnitSummary[]; asOf: string; isLive?: boolean }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [type, setType] = useState<TypeFilter>('all')
  const [onlyFlagged, setOnlyFlagged] = useState(false)
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'lifetimeCost', dir: 'desc' })

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, '')
    const list = summaries.filter(
      (s) =>
        (type === 'all' || s.unit.type === type) &&
        (!onlyFlagged || s.recurring) &&
        (!q || s.unit.number.includes(q) || s.unit.make.toLowerCase().includes(q) || s.unit.terminal.toLowerCase().includes(q)),
    )
    const val = (s: UnitSummary) => (sort.key === 'number' ? s.unit.number : sort.key === 'lastDate' ? (s.lastDate ?? '') : s[sort.key])
    return list.sort((a, b) => {
      const av = val(a)
      const bv = val(b)
      const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [summaries, query, type, onlyFlagged, sort])

  const totals = useMemo(() => {
    const scoped = summaries.filter((s) => type === 'all' || s.unit.type === type)
    return {
      units: scoped.length,
      ytd: scoped.reduce((a, s) => a + s.ytdCost, 0),
      flagged: scoped.filter((s) => s.recurring).length,
      avg: scoped.length ? scoped.reduce((a, s) => a + s.lifetimeCost, 0) / scoped.length : 0,
    }
  }, [summaries, type])

  const maxLifetime = Math.max(1, ...rows.map((r) => r.lifetimeCost))

  const header = (key: SortKey, label: string, className = '', align: 'left' | 'right' = 'right') => {
    const active = sort.key === key
    return (
      <th scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={cn('font-medium', className)}>
        <button
          type="button"
          onClick={() => setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))}
          className={cn('inline-flex h-9 w-full items-center gap-1 px-3 hover:text-foreground', align === 'right' && 'justify-end', active && 'text-foreground')}
        >
          {label}
          {active && (sort.dir === 'asc' ? <ArrowUp className="size-3" aria-hidden="true" /> : <ArrowDown className="size-3" aria-hidden="true" />)}
        </button>
      </th>
    )
  }

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
      <PageHeader
        title="Unit History"
        description={`Every truck and trailer with its tire replacement record · data through ${fmtDate(asOf)}`}
      />

      <SampleNotice>
        {isLive ? 'LIVE GOOGLE SHEETS · Only units with tire log records are shown.' : 'NOT CONNECTED · No demo records are shown. Configure Google Sheets to load unit history.'}
      </SampleNotice>

      <section aria-label="Fleet totals" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Units" value={fmtNumber(totals.units)} hint={type === 'all' ? 'Trucks and trailers' : type === 'truck' ? 'Trucks' : 'Trailers'} />
        <KpiCard label="YTD tire spend" value={fmtCurrency(totals.ytd)} hint={`Through ${fmtDate(asOf)}`} />
        <KpiCard label="Avg lifetime spend / unit" value={fmtCurrency(totals.avg)} hint="Since first record" />
        <KpiCard label="Units with recurring issues" value={fmtNumber(totals.flagged)} hint="Same reason 4+ times · last 12 mo" />
      </section>

      <section className="rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
          <label className="relative flex w-full items-center md:max-w-xs">
            <span className="sr-only">Search units</span>
            <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search unit #, make, terminal"
              className="h-8 w-full rounded-lg border bg-background pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={onlyFlagged}
              onClick={() => setOnlyFlagged((v) => !v)}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs transition-colors',
                onlyFlagged ? 'border-negative/40 bg-negative/10 text-negative' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Repeat className="size-3.5" aria-hidden="true" />
              Recurring only
            </button>
            <Segmented
              label="Unit type"
              value={type}
              onChange={setType}
              options={[
                { value: 'all', label: 'All' },
                { value: 'truck', label: 'Trucks' },
                { value: 'trailer', label: 'Trailers' },
              ]}
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Search} title="No units match" description="Try a different unit number or clear filters." />
          </div>
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[11px] text-muted-foreground">
                <tr className="border-b bg-muted/30">
                  {header('number', 'Unit', 'pl-2 text-left', 'left')}
                  <th scope="col" className="hidden px-3 text-left font-medium lg:table-cell">Details</th>
                  {header('lifetimeCost', 'Lifetime cost')}
                  {header('ytdCost', 'YTD', 'hidden sm:table-cell')}
                  {header('tires', 'Tires', 'hidden md:table-cell')}
                  {header('events', 'Events', 'hidden md:table-cell')}
                  <th scope="col" className="hidden px-3 text-left font-medium xl:table-cell">Last 12 months</th>
                  {header('lastDate', 'Last replaced', 'hidden sm:table-cell')}
                  <th scope="col" className="w-8"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr
                    key={s.unit.id}
                    onClick={() => router.push(`/units/${s.unit.id}`)}
                    className="group cursor-pointer border-b border-border/60 last:border-0 hover:bg-accent/40"
                  >
                    <th scope="row" className="py-2.5 pl-5 pr-3 text-left font-medium">
                      <Link href={`/units/${s.unit.id}`} className="inline-flex items-center gap-2 hover:underline" onClick={(e) => e.stopPropagation()}>
                        <span className="size-1.5 rounded-full" style={{ background: `var(--${s.unit.type})` }} aria-hidden="true" />
                        {s.unit.type === 'truck' ? 'Truck' : 'Trailer'} #{s.unit.number}
                      </Link>
                      {s.recurring && (
                        <span className="ml-2 inline-flex items-center gap-0.5 rounded bg-negative/10 px-1 py-px text-[10px] font-medium text-negative">
                          <Repeat className="size-2.5" aria-hidden="true" />
                          <span className="sr-only">Recurring issue</span>
                        </span>
                      )}
                    </th>
                    <td className="hidden whitespace-nowrap px-3 py-2.5 text-muted-foreground lg:table-cell">
                      {s.unit.year} {s.unit.make} · {s.unit.terminal}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="hidden h-1 w-16 overflow-hidden rounded-full bg-muted md:block" aria-hidden="true">
                          <span className="block h-full rounded-full" style={{ width: `${(s.lifetimeCost / maxLifetime) * 100}%`, background: `var(--${s.unit.type})` }} />
                        </span>
                        <span className="w-16 font-medium tabular">{fmtCurrency(s.lifetimeCost)}</span>
                      </div>
                    </td>
                    <td className="hidden px-3 py-2.5 text-right tabular sm:table-cell">{fmtCurrency(s.ytdCost)}</td>
                    <td className="hidden px-3 py-2.5 text-right tabular md:table-cell">{fmtNumber(s.tires)}</td>
                    <td className="hidden px-3 py-2.5 text-right tabular md:table-cell">{fmtNumber(s.events)}</td>
                    <td className="hidden px-3 py-1.5 xl:table-cell">
                      <Sparkline values={s.monthly} color={`var(--${s.unit.type})`} />
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-2.5 text-right text-muted-foreground tabular sm:table-cell">
                      {s.lastDate ? fmtDate(s.lastDate) : '—'}
                    </td>
                    <td className="pr-3 text-muted-foreground">
                      <ChevronRight className="size-3.5 opacity-40 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t px-5 py-2.5 text-[11px] text-muted-foreground">
          Showing {rows.length} of {summaries.length} units
        </p>
      </section>
    </div>
  )
}
