'use client'

import { useMemo, useState } from 'react'
import { CalendarRange, CircleDollarSign, Download, Layers, Receipt, Tag, TrendingUp } from 'lucide-react'
import {
  endOfMonth,
  filterEvents,
  monthKey,
  monthlySeries,
  pctChange,
  rankUnits,
  reasonStats,
  recurringIssues,
  resolvePeriod,
  shiftMonth,
  summarize,
  type PeriodPreset,
  type TypeFilter,
} from '@/lib/analytics'
import type { DataMeta, TireEvent } from '@/lib/data/types'
import { downloadCsv } from '@/lib/export'
import { fmtCurrency, fmtDate, fmtMonth, fmtNumber, fmtPct } from '@/lib/format'
import { ActionButton, KpiCard, NativeSelect, PageHeader, SampleNotice } from '@/components/ops/primitives'
import { Segmented } from '@/components/ops/segmented'
import { MonthlyExpenseChart } from './monthly-expense-chart'
import { CostPerTireChart, ReplacementTrendChart } from './trend-charts'
import { ReasonsPanel, RecurringIssues, SplitDonut, TopUnits } from './breakdown-panels'
import { PositionAnalysis } from './position-analysis'
import { PeriodComparison } from './period-comparison'
import { MonthlyTable } from './monthly-table'

export function TireDashboard({ events, meta }: { events: TireEvent[]; meta: DataMeta }) {
  const [preset, setPreset] = useState<PeriodPreset>('l12m')
  const [type, setType] = useState<TypeFilter>('all')
  const asOf = meta.asOf
  const firstDate = events[0]?.date ?? asOf

  const d = useMemo(() => {
    const period = resolvePeriod(preset, asOf, firstDate)
    const current = filterEvents(events, { from: period.from, to: period.to, type })
    const prev = period.prev ? summarize(filterEvents(events, { ...period.prev, type })) : null
    const s = summarize(current)
    const monthly = monthlySeries(current, period.from, period.to)
    const topMonth = monthly.reduce((best, r) => (r.totalCost > best.totalCost ? r : best), monthly[0])

    const typed = filterEvents(events, { type })
    const latest = shiftMonth(monthKey(asOf), -1)
    const inMonth = (k: string) => summarize(filterEvents(typed, { from: `${k}-01`, to: endOfMonth(k) }))
    const mCur = inMonth(latest)
    const mPrev = inMonth(shiftMonth(latest, -1))
    const mYoy = inMonth(shiftMonth(latest, -12))

    return {
      period,
      current,
      s,
      prev,
      monthly,
      topMonth,
      latest,
      mCur,
      mom: pctChange(mCur.total, mPrev.total),
      yoy: pctChange(mCur.total, mYoy.total),
      trucks: rankUnits(current, 'truck', 6),
      trailers: rankUnits(current, 'trailer', 6),
      reasons: reasonStats(current),
      recurring: recurringIssues(current),
      typed,
    }
  }, [events, preset, type, asOf, firstDate])

  const delta = (k: 'total' | 'truck' | 'trailer' | 'tires' | 'events' | 'avgPerTire') => (d.prev ? pctChange(d.s[k], d.prev[k]) : undefined)
  const vsHint = d.period.prev ? `vs ${d.period.prev.label}` : undefined

  const exportEvents = () =>
    downloadCsv(`tire-events-${d.period.label.toLowerCase().replace(/\s+/g, '-')}.csv`, [
      ['Date', 'Unit type', 'Unit', 'Positions', 'Quantity', 'Cost', 'Reason', 'Driver', 'Vendor', 'Comments'],
      ...d.current.map((e) => [e.date, e.unitType, e.unitNumber, e.positions.join(' '), e.quantity, e.cost, e.reason, e.driver, e.vendor, e.comments]),
    ])

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
      <PageHeader
        title="Tire Intelligence"
        description={`Tire spend, replacement patterns and problem units across the fleet · data through ${fmtDate(asOf)}`}
        actions={
          <>
            <Segmented
              label="Unit type"
              value={type}
              onChange={setType}
              options={[
                { value: 'all', label: 'All units' },
                { value: 'truck', label: 'Trucks' },
                { value: 'trailer', label: 'Trailers' },
              ]}
            />
            <NativeSelect
              label="Period"
              value={preset}
              onChange={(v) => setPreset(v as PeriodPreset)}
              className="w-36"
              options={[
                { value: 'l12m', label: 'Last 12 months' },
                { value: 'ytd', label: `Year to date` },
                { value: 'prev-year', label: `Calendar ${Number(asOf.slice(0, 4)) - 1}` },
                { value: 'all', label: 'All time' },
              ]}
            />
            <ActionButton icon={Download} onClick={exportEvents}>
              Export
            </ActionButton>
          </>
        }
      />

      <SampleNotice>
        {meta.source === 'google-sheets'
          ? 'LIVE GOOGLE SHEETS · Tire records from Truck_Tire_Map and Trailer_Tire_Map. Missing tire positions are not counted as known replacements.'
          : 'NOT CONNECTED · Add the Google Sheets service account to display real tire records. No sample figures are shown.'}
      </SampleNotice>

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total tire expenses" icon={CircleDollarSign} value={fmtCurrency(d.s.total)} delta={delta('total')} hint={vsHint} />
        <KpiCard label="Truck tire expenses" accent="truck" value={fmtCurrency(d.s.truck)} delta={delta('truck')} hint={vsHint} />
        <KpiCard label="Trailer tire expenses" accent="trailer" value={fmtCurrency(d.s.trailer)} delta={delta('trailer')} hint={vsHint} />
        <KpiCard label="Avg cost per tire" icon={Tag} value={fmtCurrency(d.s.avgPerTire, { cents: true })} delta={delta('avgPerTire')} hint={vsHint} />
        <KpiCard label="Tires replaced" icon={Layers} value={fmtNumber(d.s.tires)} delta={delta('tires')} hint={`${fmtNumber(d.s.truckTires)} truck · ${fmtNumber(d.s.trailerTires)} trailer`} />
        <KpiCard label="Replacement events" icon={Receipt} value={fmtNumber(d.s.events)} delta={delta('events')} hint={d.s.events ? `${(d.s.tires / d.s.events).toFixed(2)} tires / event` : undefined} />
        <KpiCard
          label="Most expensive month"
          icon={CalendarRange}
          value={d.topMonth && d.topMonth.totalCost ? fmtMonth(d.topMonth.key) : '—'}
          hint={d.topMonth ? `${fmtCurrency(d.topMonth.totalCost)} · ${fmtNumber(d.topMonth.tires)} tires` : undefined}
        />
        <KpiCard
          label={`${fmtMonth(d.latest)} vs prior month`}
          icon={TrendingUp}
          value={fmtCurrency(d.mCur.total)}
          delta={d.mom}
          hint={`YoY ${fmtPct(d.yoy)}`}
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <MonthlyExpenseChart rows={d.monthly} type={type} />
        </div>
        {type === 'all' ? <SplitDonut summary={d.s} /> : <ReasonsPanel reasons={d.reasons} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReplacementTrendChart rows={d.monthly} type={type} />
        <CostPerTireChart rows={d.monthly} type={type} average={d.s.avgPerTire} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PositionAnalysis events={d.current} typeFilter={type} />
        </div>
        <TopUnits trucks={d.trucks} trailers={d.trailers} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {type === 'all' && <ReasonsPanel reasons={d.reasons} />}
        <PeriodComparison events={d.typed} asOf={asOf} />
        {type !== 'all' && <RecurringIssues issues={d.recurring} />}
      </div>

      {type === 'all' && <RecurringIssues issues={d.recurring} />}

      <MonthlyTable rows={d.monthly} summary={d.s} periodLabel={d.period.label} />
    </div>
  )
}
