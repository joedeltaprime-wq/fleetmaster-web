'use client'

import { useMemo, useState } from 'react'
import { filterEvents, monthKey, pctChange, shiftMonth, summarize, endOfMonth, type Summary } from '@/lib/analytics'
import type { TireEvent } from '@/lib/data/types'
import { fmtCurrency, fmtMonth, fmtNumber } from '@/lib/format'
import { Delta, Panel } from '@/components/ops/primitives'
import { Segmented } from '@/components/ops/segmented'

type Mode = 'mom' | 'yoy' | 'ytd'

export function PeriodComparison({ events, asOf }: { events: TireEvent[]; asOf: string }) {
  const [mode, setMode] = useState<Mode>('mom')

  const { a, b, aLabel, bLabel } = useMemo(() => {
    const latest = shiftMonth(monthKey(asOf), -1)
    const range = (key: string) => ({ from: `${key}-01`, to: endOfMonth(key) })
    if (mode === 'mom') {
      const prev = shiftMonth(latest, -1)
      return { a: summarize(filterEvents(events, range(latest))), b: summarize(filterEvents(events, range(prev))), aLabel: fmtMonth(latest), bLabel: fmtMonth(prev) }
    }
    if (mode === 'yoy') {
      const prev = shiftMonth(latest, -12)
      return { a: summarize(filterEvents(events, range(latest))), b: summarize(filterEvents(events, range(prev))), aLabel: fmtMonth(latest), bLabel: fmtMonth(prev) }
    }
    const y = Number(asOf.slice(0, 4))
    const md = asOf.slice(4)
    return {
      a: summarize(filterEvents(events, { from: `${y}-01-01`, to: asOf })),
      b: summarize(filterEvents(events, { from: `${y - 1}-01-01`, to: `${y - 1}${md}` })),
      aLabel: `YTD ${y}`,
      bLabel: `YTD ${y - 1}`,
    }
  }, [events, asOf, mode])

  const rows: { label: string; get: (s: Summary) => number; fmt: (n: number) => string }[] = [
    { label: 'Total cost', get: (s) => s.total, fmt: (n) => fmtCurrency(n) },
    { label: 'Truck cost', get: (s) => s.truck, fmt: (n) => fmtCurrency(n) },
    { label: 'Trailer cost', get: (s) => s.trailer, fmt: (n) => fmtCurrency(n) },
    { label: 'Tires replaced', get: (s) => s.tires, fmt: fmtNumber },
    { label: 'Replacement events', get: (s) => s.events, fmt: fmtNumber },
    { label: 'Avg cost per tire', get: (s) => s.avgPerTire, fmt: (n) => fmtCurrency(n, { cents: true }) },
  ]

  const maxTotal = Math.max(a.total, b.total, 1)

  return (
    <Panel
      title="Period comparison"
      description="Latest complete month and year-to-date against prior periods"
      actions={
        <Segmented
          size="sm"
          label="Comparison"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'mom', label: 'Month / month' },
            { value: 'yoy', label: 'Year / year' },
            { value: 'ytd', label: 'YTD' },
          ]}
        />
      }
    >
      <div className="mb-5 flex flex-col gap-2.5">
        {[
          { label: aLabel, s: a, current: true },
          { label: bLabel, s: b, current: false },
        ].map(({ label, s, current }) => (
          <div key={label} className="flex items-center gap-3">
            <span className={`w-20 shrink-0 text-xs ${current ? 'font-medium' : 'text-muted-foreground'}`}>{label}</span>
            <div className="flex h-5 flex-1 overflow-hidden rounded bg-muted/60">
              <div className="h-full transition-all duration-500" style={{ width: `${(s.truck / maxTotal) * 100}%`, background: 'var(--truck)', opacity: current ? 1 : 0.5 }} />
              <div className="h-full transition-all duration-500" style={{ width: `${(s.trailer / maxTotal) * 100}%`, background: 'var(--trailer)', opacity: current ? 1 : 0.5 }} />
            </div>
            <span className="w-16 shrink-0 text-right text-xs tabular">{fmtCurrency(s.total, { compact: true })}</span>
          </div>
        ))}
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="border-b text-[11px] text-muted-foreground">
            <th scope="col" className="py-2 text-left font-medium">Metric</th>
            <th scope="col" className="py-2 text-right font-medium">{aLabel}</th>
            <th scope="col" className="py-2 text-right font-medium">{bLabel}</th>
            <th scope="col" className="py-2 text-right font-medium">Change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-border/60 last:border-0">
              <th scope="row" className="py-2 text-left font-normal text-muted-foreground">{r.label}</th>
              <td className="py-2 text-right font-medium tabular">{r.fmt(r.get(a))}</td>
              <td className="py-2 text-right text-muted-foreground tabular">{r.fmt(r.get(b))}</td>
              <td className="py-2 text-right">
                <Delta value={pctChange(r.get(a), r.get(b))} invert />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  )
}
