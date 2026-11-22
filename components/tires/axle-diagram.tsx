'use client'

import { cn } from '@/lib/utils'
import type { PositionStat } from '@/lib/analytics'
import type { UnitType } from '@/lib/data/types'
import { positionLabel, positionShort } from '@/lib/data/positions'
import { fmtCurrency, fmtNumber } from '@/lib/format'

type Metric = 'tires' | 'cost'

interface Props {
  type: UnitType
  stats: PositionStat[]
  metric?: Metric
  selected?: string | null
  onSelect?: (id: string) => void
}

export function heatColor(ratio: number, type: UnitType) {
  const pct = Math.round(8 + ratio * 92)
  return `color-mix(in oklch, var(--${type}) ${pct}%, var(--muted))`
}

export function AxleDiagram({ type, stats, metric = 'tires', selected, onSelect }: Props) {
  const byId = new Map(stats.map((s) => [s.id, s]))
  const max = Math.max(1, ...stats.map((s) => (metric === 'tires' ? s.tires : s.cost)))

  const tire = (id: string) => {
    const s = byId.get(id)
    const v = s ? (metric === 'tires' ? s.tires : s.cost) : 0
    const ratio = v / max
    const isSel = selected === id
    return (
      <button
        key={id}
        type="button"
        onClick={() => onSelect?.(id)}
        aria-pressed={isSel}
        aria-label={`${positionLabel(id)}: ${fmtNumber(s?.tires ?? 0)} tires, ${fmtCurrency(s?.cost ?? 0)}`}
        title={`${positionLabel(id)} · ${fmtNumber(s?.tires ?? 0)} tires · ${fmtCurrency(s?.cost ?? 0)}`}
        className={cn(
          'relative h-12 w-6 rounded-[5px] border border-black/10 transition-all duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/10',
          isSel && 'ring-2 ring-foreground ring-offset-2 ring-offset-card',
        )}
        style={{ background: heatColor(ratio, type) }}
      >
        <span className="absolute inset-x-1 top-1.5 bottom-1.5 rounded-[2px] border-y border-black/10 dark:border-white/10" aria-hidden="true" />
      </button>
    )
  }

  const side = (ids: string[], align: 'start' | 'end') => (
    <div className={cn('flex w-[52px] gap-1', align === 'start' ? 'justify-start' : 'justify-end')}>{ids.map(tire)}</div>
  )

  const axle = (label: string, left: string[], right: string[]) => (
    <div className="relative flex items-center gap-3">
      <span className="absolute -left-16 w-14 text-right text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {side(left, 'start')}
      <div className="h-1 w-16 rounded-full bg-border" aria-hidden="true" />
      {side(right, 'end')}
    </div>
  )

  const extras = type === 'truck' ? ['T-UNK-F', 'T-UNK-O'] : ['R-UNK-L']

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex flex-col items-center pl-14">
        <div className="relative flex flex-col items-center">
          <div
            className="pointer-events-none absolute inset-y-2 left-1/2 w-12 -translate-x-1/2 rounded-md border border-dashed border-border bg-muted/30"
            aria-hidden="true"
          />
          {type === 'truck' ? (
            <>
              <div className="relative mb-3 rounded-t-xl border border-b-0 bg-muted/50 px-6 pt-1.5 pb-1 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Front
              </div>
              {axle('Steer', ['S-L'], ['S-R'])}
              <div className="h-12" />
              <div className="flex flex-col gap-2.5">
                {axle('Drive 1', ['D1-LO', 'D1-LI'], ['D1-RI', 'D1-RO'])}
                {axle('Drive 2', ['D2-LO', 'D2-LI'], ['D2-RI', 'D2-RO'])}
              </div>
            </>
          ) : (
            <>
              <div className="relative mb-3 rounded-t-md border border-b-0 bg-muted/50 px-4 pt-1.5 pb-1 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Kingpin
              </div>
              <div className="h-24" />
              <div className="flex flex-col gap-2.5">
                {axle('Axle 1', ['A1-LO', 'A1-LI'], ['A1-RI', 'A1-RO'])}
                {axle('Axle 2', ['A2-LO', 'A2-LI'], ['A2-RI', 'A2-RO'])}
              </div>
              <div className="h-3" />
            </>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {extras.map((id) => {
          const s = byId.get(id)
          const v = s ? (metric === 'tires' ? s.tires : s.cost) : 0
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect?.(id)}
              aria-pressed={selected === id}
              className={cn(
                'flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground',
                selected === id && 'border-foreground/40 text-foreground',
              )}
            >
              <span className="size-2 rounded-sm" style={{ background: heatColor(v / max, type) }} aria-hidden="true" />
              {positionShort(id)}
              <span className="tabular text-foreground">{fmtNumber(s?.tires ?? 0)}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground" aria-hidden="true">
        <span>Low</span>
        <div className="flex gap-0.5">
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <span key={r} className="h-2 w-5 rounded-sm" style={{ background: heatColor(r, type) }} />
          ))}
        </div>
        <span>High</span>
      </div>
    </div>
  )
}
