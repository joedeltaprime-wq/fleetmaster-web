'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, CircleCheck, Container, Download, Info, Repeat, Search, Truck } from 'lucide-react'
import { pctChange } from '@/lib/analytics'
import type { Unit } from '@/lib/data/types'
import { downloadCsv } from '@/lib/export'
import { fmtCurrency, fmtDate, fmtNumber } from '@/lib/format'
import type { UnitProfile } from '@/lib/unit-profile'
import { cn } from '@/lib/utils'
import { ActionButton, KpiCard, Panel, SampleNotice } from '@/components/ops/primitives'
import { UnitSearchDialog } from '@/components/shell/unit-search-dialog'
import { ReasonsPanel } from '@/components/tires/breakdown-panels'
import { UnitCostChart } from './unit-cost-chart'
import { UnitPositions } from './unit-positions'
import { UnitTimeline } from './unit-timeline'

const TONE = {
  negative: { icon: AlertTriangle, className: 'text-negative bg-negative/10' },
  warning: { icon: Repeat, className: 'text-warning bg-warning/10' },
  positive: { icon: CircleCheck, className: 'text-positive bg-positive/10' },
  neutral: { icon: Info, className: 'text-muted-foreground bg-muted' },
}

export function UnitProfileView({ profile: p, units, asOf, isLive = false }: { profile: UnitProfile; units: Unit[]; asOf: string; isLive?: boolean }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const { unit } = p
  const TypeIcon = unit.type === 'truck' ? Truck : Container
  const typeLabel = unit.type === 'truck' ? 'Truck' : 'Trailer'
  const year = asOf.slice(0, 4)

  const exportCsv = () =>
    downloadCsv(`${unit.type}-${unit.number}-tire-history.csv`, [
      ['Date', 'Positions', 'Quantity', 'Cost', 'Reason', 'Driver', 'Vendor', 'Comments'],
      ...p.events.map((e) => [e.date, e.positions.join(' '), e.quantity, e.cost, e.reason, e.driver, e.vendor, e.comments]),
    ])

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
      <div className="flex flex-col gap-5">
        <Link href="/units" className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3" aria-hidden="true" />
          All units
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-xl border"
              style={{ background: `color-mix(in oklch, var(--${unit.type}) 14%, transparent)`, color: `var(--${unit.type})` }}
            >
              <TypeIcon className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {typeLabel} #{unit.number}
                </h1>
                <span className="rounded-md border px-1.5 py-0.5 text-[11px] text-muted-foreground tabular">
                  #{p.rank} of {p.fleetSize} by spend
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {unit.year} {unit.make} · {unit.terminal} terminal · {fmtNumber(p.lifetime.events)} recorded events
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg border bg-card">
              {p.prevId ? (
                <Link href={`/units/${p.prevId}`} className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground" aria-label={`Previous ${unit.type}`}>
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <span className="flex size-8 items-center justify-center text-muted-foreground/40" aria-hidden="true">
                  <ChevronLeft className="size-4" />
                </span>
              )}
              <span className="h-4 w-px bg-border" aria-hidden="true" />
              {p.nextId ? (
                <Link href={`/units/${p.nextId}`} className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground" aria-label={`Next ${unit.type}`}>
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <span className="flex size-8 items-center justify-center text-muted-foreground/40" aria-hidden="true">
                  <ChevronRight className="size-4" />
                </span>
              )}
            </div>
            <ActionButton icon={Search} onClick={() => setSearchOpen(true)}>
              Switch unit
            </ActionButton>
            <ActionButton icon={Download} onClick={exportCsv} disabled={!p.events.length}>
              Export history
            </ActionButton>
          </div>
        </div>
      </div>

      <SampleNotice>
        {isLive ? 'LIVE GOOGLE SHEETS · Tire history from the live tire map. Vendor is not included in this source.' : 'NOT CONNECTED · Real Google Sheets tire records are not available.'}
      </SampleNotice>

      <section aria-label="Unit metrics" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Lifetime tire cost" value={fmtCurrency(p.lifetime.total)} delta={pctChange(p.lifetime.total, p.fleetAvgLifetime)} hint="vs fleet avg" />
        <KpiCard label={`YTD ${year}`} value={fmtCurrency(p.ytd.total)} delta={pctChange(p.ytd.total, p.ytdPrev.total)} hint={`vs YTD ${Number(year) - 1}`} />
        <KpiCard label="Tires replaced" value={fmtNumber(p.lifetime.tires)} hint={`${fmtNumber(p.lifetime.events)} events`} />
        <KpiCard
          label="Avg cost per tire"
          value={fmtCurrency(p.lifetime.avgPerTire, { cents: true })}
          delta={pctChange(p.lifetime.avgPerTire, p.fleetAvgPerTire)}
          hint="vs fleet"
        />
        <KpiCard label="Last replacement" value={p.daysSinceLast === null ? '—' : `${p.daysSinceLast}d ago`} hint={p.events[0] ? fmtDate(p.events[0].date) : 'No records'} />
        <KpiCard label="Avg interval" value={p.avgInterval === null ? '—' : `${Math.round(p.avgInterval)} days`} hint="Between events" />
      </section>

      {p.insights.length > 0 && (
        <section aria-label="Insights" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {p.insights.map((ins) => {
            const tone = TONE[ins.tone]
            return (
              <div key={ins.title} className="flex gap-3 rounded-xl border bg-card p-4">
                <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-md', tone.className)}>
                  <tone.icon className="size-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{ins.title}</p>
                  <p className="mt-0.5 text-pretty text-xs text-muted-foreground">{ins.detail}</p>
                </div>
              </div>
            )
          })}
        </section>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <UnitCostChart monthly={p.monthly} type={unit.type} />
        </div>
        <ReasonsPanel reasons={p.reasons} />
      </div>

      <UnitPositions type={unit.type} stats={p.positions} fleetAvg={p.fleetPositionAvg} events={p.events} />

      <Panel title="Replacement history" description="Every recorded tire event for this unit, newest first" bodyClassName="pt-3">
        <UnitTimeline events={p.events} />
      </Panel>

      <UnitSearchDialog units={units} open={searchOpen} onOpenChange={setSearchOpen} currentId={unit.id} title="Switch unit" />
    </div>
  )
}
