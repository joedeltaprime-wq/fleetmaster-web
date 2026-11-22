'use client'

import { useState } from 'react'
import type { PositionStat } from '@/lib/analytics'
import { positionLabel } from '@/lib/data/positions'
import type { TireEvent, UnitType } from '@/lib/data/types'
import { fmtCurrency, fmtDate, fmtNumber } from '@/lib/format'
import { EmptyState, Panel } from '@/components/ops/primitives'
import { AxleDiagram } from '@/components/tires/axle-diagram'

export function UnitPositions({
  type,
  stats,
  fleetAvg,
  events,
}: {
  type: UnitType
  stats: PositionStat[]
  fleetAvg: Record<string, number>
  events: TireEvent[]
}) {
  const ranked = [...stats].sort((a, b) => b.tires - a.tires)
  const [selected, setSelected] = useState<string>(ranked[0]?.id ?? '')
  const sel = stats.find((s) => s.id === selected)
  const selEvents = events.filter((e) => e.positions.includes(selected))
  const avg = fleetAvg[selected] ?? 0
  const ratio = sel && avg ? sel.tires / avg : null

  return (
    <Panel title="Tire positions" description="Replacement count by position on this unit. Select a tire to see its history.">
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="flex justify-center rounded-lg bg-muted/30 px-6 py-5 md:px-10">
          <AxleDiagram type={type} stats={stats} selected={selected} onSelect={setSelected} />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {sel ? (
            <>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Selected position</p>
                  <p className="mt-1 text-base font-semibold">{positionLabel(sel.id)}</p>
                </div>
                {ratio !== null && (
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium tabular ${ratio >= 1.5 ? 'bg-negative/10 text-negative' : ratio <= 0.75 ? 'bg-positive/10 text-positive' : 'bg-muted text-muted-foreground'}`}
                  >
                    {ratio.toFixed(1)}× fleet average
                  </span>
                )}
              </div>
              <dl className="grid grid-cols-3 gap-3 rounded-lg border p-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">Tires</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular">{fmtNumber(sel.tires)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Fleet avg</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular">{avg.toFixed(1)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Cost</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular">{fmtCurrency(sel.cost)}</dd>
                </div>
              </dl>
              {selEvents.length === 0 ? (
                <EmptyState title="No replacements at this position" description="This tire position has no recorded replacements." />
              ) : (
                <ul className="scrollbar-thin flex max-h-56 flex-col divide-y divide-border/60 overflow-auto rounded-lg border">
                  {selEvents.map((e) => (
                    <li key={e.id} className="flex items-center gap-3 px-3 py-2 text-xs">
                      <span className="w-24 shrink-0 text-muted-foreground tabular">{fmtDate(e.date)}</span>
                      <span className="min-w-0 flex-1 truncate">{e.reason}</span>
                      <span className="hidden shrink-0 text-muted-foreground sm:inline">{e.vendor}</span>
                      <span className="w-16 shrink-0 text-right font-medium tabular">{fmtCurrency(e.quantity ? e.cost / e.quantity : 0)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <EmptyState title="No position data" />
          )}
        </div>
      </div>
    </Panel>
  )
}
