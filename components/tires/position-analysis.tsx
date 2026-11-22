'use client'

import { useMemo, useState } from 'react'
import { positionStats, type TypeFilter } from '@/lib/analytics'
import { positionLabel, positionShort } from '@/lib/data/positions'
import type { TireEvent, UnitType } from '@/lib/data/types'
import { fmtCurrency, fmtNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Panel } from '@/components/ops/primitives'
import { Segmented } from '@/components/ops/segmented'
import { AxleDiagram } from './axle-diagram'

export function PositionAnalysis({ events, typeFilter }: { events: TireEvent[]; typeFilter: TypeFilter }) {
  const [localType, setLocalType] = useState<UnitType>('truck')
  const type: UnitType = typeFilter === 'all' ? localType : typeFilter
  const [metric, setMetric] = useState<'tires' | 'cost'>('tires')
  const [selected, setSelected] = useState<string | null>(null)

  const stats = useMemo(() => positionStats(events, type), [events, type])
  const ranked = [...stats].sort((a, b) => (metric === 'tires' ? b.tires - a.tires : b.cost - a.cost))
  const totalTires = stats.reduce((s, p) => s + p.tires, 0) || 1
  const sel = stats.find((s) => s.id === selected) ?? ranked[0]

  return (
    <Panel
      title="Tire position analysis"
      description="Where replacements happen on the unit. Select a tire for details."
      actions={
        <>
          {typeFilter === 'all' && (
            <Segmented
              size="sm"
              label="Diagram unit type"
              value={localType}
              onChange={(v) => {
                setLocalType(v)
                setSelected(null)
              }}
              options={[
                { value: 'truck', label: 'Truck' },
                { value: 'trailer', label: 'Trailer' },
              ]}
            />
          )}
          <Segmented
            size="sm"
            label="Heat metric"
            value={metric}
            onChange={setMetric}
            options={[
              { value: 'tires', label: 'Count' },
              { value: 'cost', label: 'Cost' },
            ]}
          />
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
        <div className="flex justify-center rounded-lg bg-muted/30 px-6 py-5 md:px-10">
          <AxleDiagram type={type} stats={stats} metric={metric} selected={sel?.id} onSelect={setSelected} />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {sel && (
            <div className="rounded-lg border p-4" aria-live="polite">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Selected position</p>
              <p className="mt-1 text-base font-semibold">{positionLabel(sel.id)}</p>
              <dl className="mt-3 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">Tires</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular">{fmtNumber(sel.tires)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Share</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular">{((sel.tires / totalTires) * 100).toFixed(1)}%</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Cost</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular">{fmtCurrency(sel.cost, { compact: true })}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                Top reason: <span className="text-foreground">{sel.topReason ?? '—'}</span>
              </p>
            </div>
          )}

          <ul className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2" aria-label="Positions ranked">
            {ranked.map((p) => {
              const v = metric === 'tires' ? p.tires : p.cost
              const maxV = metric === 'tires' ? ranked[0].tires : ranked[0].cost
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(p.id)}
                    className={cn(
                      '-mx-1.5 flex w-[calc(100%+0.75rem)] items-center gap-2 rounded px-1.5 py-1 text-left text-xs transition-colors hover:bg-accent/50',
                      sel?.id === p.id && 'bg-accent/60',
                    )}
                  >
                    <span className="w-14 shrink-0 font-mono text-[10px] text-muted-foreground">{positionShort(p.id)}</span>
                    <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full transition-all duration-500"
                        style={{ width: `${maxV ? (v / maxV) * 100 : 0}%`, background: `var(--${type})` }}
                      />
                    </span>
                    <span className="w-12 shrink-0 text-right tabular">{metric === 'tires' ? fmtNumber(v) : fmtCurrency(v, { compact: true })}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </Panel>
  )
}
