'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp, Download } from 'lucide-react'
import { pctChange, type MonthRow, type Summary } from '@/lib/analytics'
import { downloadCsv } from '@/lib/export'
import { fmtCurrency, fmtMonth, fmtNumber } from '@/lib/format'
import { ActionButton, Delta, Panel } from '@/components/ops/primitives'

type SortKey = 'key' | 'truckCost' | 'trailerCost' | 'totalCost' | 'tires' | 'events' | 'costPerTire'

const COLS: { key: SortKey; label: string; className?: string }[] = [
  { key: 'key', label: 'Month' },
  { key: 'truckCost', label: 'Truck', className: 'hidden sm:table-cell' },
  { key: 'trailerCost', label: 'Trailer', className: 'hidden sm:table-cell' },
  { key: 'totalCost', label: 'Total' },
  { key: 'tires', label: 'Tires' },
  { key: 'events', label: 'Events', className: 'hidden md:table-cell' },
  { key: 'costPerTire', label: 'Cost / tire', className: 'hidden md:table-cell' },
]

export function MonthlyTable({ rows, summary, periodLabel }: { rows: MonthRow[]; summary: Summary; periodLabel: string }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'key', dir: 'desc' })
  const momByKey = new Map(rows.map((r, i) => [r.key, i > 0 ? pctChange(r.totalCost, rows[i - 1].totalCost) : null]))
  const sorted = [...rows].sort((a, b) => {
    const av = a[sort.key]
    const bv = b[sort.key]
    const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number)
    return sort.dir === 'asc' ? cmp : -cmp
  })

  const exportCsv = () =>
    downloadCsv(`tire-monthly-summary-${periodLabel.toLowerCase().replace(/\s+/g, '-')}.csv`, [
      ['Month', 'Truck cost', 'Trailer cost', 'Total cost', 'Truck tires', 'Trailer tires', 'Tires', 'Events', 'Cost per tire'],
      ...rows.map((r) => [r.key, r.truckCost, r.trailerCost, r.totalCost, r.truckTires, r.trailerTires, r.tires, r.events, r.costPerTire.toFixed(2)]),
    ])

  return (
    <Panel
      title="Monthly summary"
      description={`${periodLabel} · click a column to sort`}
      actions={
        <ActionButton icon={Download} onClick={exportCsv}>
          Export CSV
        </ActionButton>
      }
      bodyClassName="px-0 pb-0 pt-3"
    >
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[11px] text-muted-foreground">
            <tr className="border-y bg-muted/30">
              {COLS.map((c, i) => {
                const active = sort.key === c.key
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className={`${c.className ?? ''} py-0 font-medium ${i === 0 ? 'pl-5 text-left' : 'text-right'}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key && s.dir === 'desc' ? 'asc' : 'desc' }))}
                      className={`inline-flex h-9 items-center gap-1 px-3 hover:text-foreground ${i === 0 ? '-ml-3' : ''} ${active ? 'text-foreground' : ''}`}
                    >
                      {c.label}
                      {active && (sort.dir === 'asc' ? <ArrowUp className="size-3" aria-hidden="true" /> : <ArrowDown className="size-3" aria-hidden="true" />)}
                    </button>
                  </th>
                )
              })}
              <th scope="col" className="py-2 pl-3 pr-5 text-right font-medium">MoM</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.key} className="border-b border-border/60 hover:bg-accent/40">
                <th scope="row" className="whitespace-nowrap py-2.5 pl-5 text-left font-medium">{fmtMonth(r.key)}</th>
                <td className="hidden px-3 py-2.5 text-right tabular sm:table-cell">{fmtCurrency(r.truckCost)}</td>
                <td className="hidden px-3 py-2.5 text-right tabular sm:table-cell">{fmtCurrency(r.trailerCost)}</td>
                <td className="px-3 py-2.5 text-right font-medium tabular">{fmtCurrency(r.totalCost)}</td>
                <td className="px-3 py-2.5 text-right tabular">{fmtNumber(r.tires)}</td>
                <td className="hidden px-3 py-2.5 text-right tabular md:table-cell">{fmtNumber(r.events)}</td>
                <td className="hidden px-3 py-2.5 text-right tabular md:table-cell">{r.tires ? fmtCurrency(r.costPerTire) : '—'}</td>
                <td className="py-2.5 pl-3 pr-5 text-right">
                  <Delta value={momByKey.get(r.key) ?? null} invert />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/30 font-medium">
              <th scope="row" className="py-3 pl-5 text-left">Total</th>
              <td className="hidden px-3 py-3 text-right tabular sm:table-cell">{fmtCurrency(summary.truck)}</td>
              <td className="hidden px-3 py-3 text-right tabular sm:table-cell">{fmtCurrency(summary.trailer)}</td>
              <td className="px-3 py-3 text-right tabular">{fmtCurrency(summary.total)}</td>
              <td className="px-3 py-3 text-right tabular">{fmtNumber(summary.tires)}</td>
              <td className="hidden px-3 py-3 text-right tabular md:table-cell">{fmtNumber(summary.events)}</td>
              <td className="hidden px-3 py-3 text-right tabular md:table-cell">{fmtCurrency(summary.avgPerTire)}</td>
              <td className="py-3 pl-3 pr-5" />
            </tr>
          </tfoot>
        </table>
      </div>
    </Panel>
  )
}
