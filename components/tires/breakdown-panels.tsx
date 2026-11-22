'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Repeat } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import type { ReasonStat, RecurringIssue, Summary, UnitRank } from '@/lib/analytics'
import type { UnitType } from '@/lib/data/types'
import { positionShort } from '@/lib/data/positions'
import { fmtCurrency, fmtDate, fmtNumber } from '@/lib/format'
import { EmptyState, Panel } from '@/components/ops/primitives'
import { Segmented } from '@/components/ops/segmented'

export function SplitDonut({ summary }: { summary: Summary }) {
  const [hover, setHover] = useState<number | null>(null)
  const data = [
    { name: 'Truck', value: summary.truck, tires: summary.truckTires, color: 'var(--truck)' },
    { name: 'Trailer', value: summary.trailer, tires: summary.trailerTires, color: 'var(--trailer)' },
  ]
  const focus = hover !== null ? data[hover] : null

  return (
    <Panel title="Truck vs trailer" description="Share of tire spend">
      {summary.total === 0 ? (
        <EmptyState title="No spend in this period" />
      ) : (
        <div className="flex flex-col items-center gap-5">
          <div className="relative size-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius="72%"
                  outerRadius="100%"
                  paddingAngle={summary.truck && summary.trailer ? 2 : 0}
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                  onMouseEnter={(_, i) => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  animationDuration={700}
                >
                  {data.map((d, i) => (
                    <Cell key={d.name} fill={d.color} opacity={hover === null || hover === i ? 1 : 0.35} className="transition-opacity" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] text-muted-foreground">{focus ? focus.name : 'Total'}</span>
              <span className="text-lg font-semibold tracking-tight tabular">{fmtCurrency(focus ? focus.value : summary.total, { compact: true })}</span>
              <span className="text-[11px] text-muted-foreground tabular">
                {focus ? `${((focus.value / summary.total) * 100).toFixed(1)}%` : `${fmtNumber(summary.tires)} tires`}
              </span>
            </div>
          </div>
          <ul className="grid w-full grid-cols-2 gap-2">
            {data.map((d, i) => (
              <li
                key={d.name}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className={cn('rounded-lg border p-3 transition-colors', hover === i && 'border-ring/40 bg-accent/40')}
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2 rounded-sm" style={{ background: d.color }} aria-hidden="true" />
                  {d.name}
                </div>
                <p className="mt-1 text-sm font-semibold tabular">{fmtCurrency(d.value)}</p>
                <p className="text-[11px] text-muted-foreground tabular">
                  {((d.value / summary.total) * 100).toFixed(1)}% · {fmtNumber(d.tires)} tires
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  )
}

export function TopUnits({ trucks, trailers }: { trucks: UnitRank[]; trailers: UnitRank[] }) {
  const [type, setType] = useState<UnitType>('truck')
  const list = type === 'truck' ? trucks : trailers
  const max = Math.max(1, ...list.map((u) => u.cost))

  return (
    <Panel
      title="Top units by cost"
      description="Highest tire spend in the selected period"
      actions={
        <Segmented
          size="sm"
          label="Unit type"
          value={type}
          onChange={setType}
          options={[
            { value: 'truck', label: 'Trucks' },
            { value: 'trailer', label: 'Trailers' },
          ]}
        />
      }
      bodyClassName="pt-3"
    >
      {list.length === 0 ? (
        <EmptyState title="No units in this view" description="Adjust the period or unit type filter." />
      ) : (
        <ol className="flex flex-col">
          {list.map((u, i) => (
            <li key={u.unitId}>
              <Link
                href={`/units/${u.unitId}`}
                className="group -mx-2 flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent/50"
              >
                <span className="w-4 text-right text-[11px] text-muted-foreground tabular">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {u.type === 'truck' ? 'Truck' : 'Trailer'} #{u.unitNumber}
                    </span>
                    <span className="text-sm font-medium tabular">{fmtCurrency(u.cost)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(u.cost / max) * 100}%`, background: `var(--${u.type})` }}
                      />
                    </div>
                    <span className="w-24 text-right text-[11px] text-muted-foreground tabular">
                      {u.tires} tires · {u.events} ev
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}

export function ReasonsPanel({ reasons }: { reasons: ReasonStat[] }) {
  const [metric, setMetric] = useState<'events' | 'cost'>('events')
  const sorted = [...reasons].sort((a, b) => b[metric] - a[metric])
  const total = sorted.reduce((s, r) => s + r[metric], 0) || 1

  return (
    <Panel
      title="Replacement reasons"
      description="Why tires are being replaced"
      actions={
        <Segmented
          size="sm"
          label="Metric"
          value={metric}
          onChange={setMetric}
          options={[
            { value: 'events', label: 'Events' },
            { value: 'cost', label: 'Cost' },
          ]}
        />
      }
    >
      {sorted.length === 0 ? (
        <EmptyState title="No replacements recorded" />
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((r, i) => {
            const share = r[metric] / total
            return (
              <li key={r.reason}>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="truncate font-medium">{r.reason}</span>
                  <span className="shrink-0 tabular text-muted-foreground">
                    <span className="text-foreground">{metric === 'events' ? fmtNumber(r.events) : fmtCurrency(r.cost, { compact: true })}</span>
                    {' · '}
                    {(share * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${share * 100}%`, background: `var(--chart-${(i % 5) + 1})` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

export function RecurringIssues({ issues }: { issues: RecurringIssue[] }) {
  return (
    <Panel
      title="Recurring issues"
      description="Units with the same replacement reason 4+ times in the period"
      actions={
        <span className="inline-flex items-center gap-1 rounded-md bg-negative/10 px-2 py-0.5 text-[11px] font-medium text-negative tabular">
          <Repeat className="size-3" aria-hidden="true" />
          {issues.length} flagged
        </span>
      }
      bodyClassName="px-0 pb-2 pt-3"
    >
      {issues.length === 0 ? (
        <div className="px-5 pb-3">
          <EmptyState title="No recurring patterns" description="No unit has repeated the same reason 4+ times in this period." />
        </div>
      ) : (
        <div className="scrollbar-thin max-h-80 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-card text-[11px] text-muted-foreground">
              <tr className="border-b">
                <th scope="col" className="px-5 py-2 font-medium">Unit</th>
                <th scope="col" className="px-3 py-2 font-medium">Reason</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Count</th>
                <th scope="col" className="hidden px-3 py-2 font-medium sm:table-cell">Hot spot</th>
                <th scope="col" className="hidden px-3 py-2 text-right font-medium md:table-cell">Cost</th>
                <th scope="col" className="px-5 py-2 text-right font-medium">Last</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((r) => (
                <tr key={`${r.unitId}-${r.reason}`} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="whitespace-nowrap px-5 py-2.5">
                      <Link href={`/units/${r.unitId}`} className="inline-flex items-center gap-1.5 font-medium hover:underline">
                      <span className="size-1.5 rounded-full" style={{ background: `var(--${r.type})` }} aria-hidden="true" />
                      {r.type === 'truck' ? 'Truck' : 'Trailer'} #{r.unitNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.reason}</td>
                  <td className="px-3 py-2.5 text-right font-medium tabular">{r.occurrences}×</td>
                  <td className="hidden px-3 py-2.5 sm:table-cell">
                    <span className="whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[10px]">{positionShort(r.topPosition)}</span>
                  </td>
                  <td className="hidden px-3 py-2.5 text-right tabular md:table-cell">{fmtCurrency(r.cost)}</td>
                  <td className="whitespace-nowrap px-5 py-2.5 text-right text-muted-foreground tabular">{fmtDate(r.lastDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}
