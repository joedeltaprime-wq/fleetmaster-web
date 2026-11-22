'use client'

import { useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MonthRow, TypeFilter } from '@/lib/analytics'
import { fmtCurrency, fmtMonth, fmtMonthShort, fmtNumber } from '@/lib/format'
import { AXIS_TICK, GRID_STROKE, TooltipCard } from '@/components/ops/chart-kit'
import { Legend, Panel } from '@/components/ops/primitives'

export function ReplacementTrendChart({ rows, type }: { rows: MonthRow[]; type: TypeFilter }) {
  const [showEvents, setShowEvents] = useState(true)
  return (
    <Panel
      title="Replacement trends"
      description="Tires replaced per month, with replacement events"
      actions={
        <Legend
          items={[
            ...(type !== 'trailer' ? [{ label: 'Truck tires', color: 'var(--truck)' }] : []),
            ...(type !== 'truck' ? [{ label: 'Trailer tires', color: 'var(--trailer)' }] : []),
            { label: 'Events', color: 'var(--warning)', muted: !showEvents, onClick: () => setShowEvents((s) => !s) },
          ]}
        />
      }
    >
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillTruck" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--truck)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--truck)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillTrailer" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--trailer)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--trailer)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
            <XAxis dataKey="key" tickFormatter={fmtMonthShort} tick={AXIS_TICK} tickLine={false} axisLine={false} minTickGap={16} />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={32} />
            <Tooltip
              cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const r = payload[0].payload as MonthRow
                return (
                  <TooltipCard
                    title={fmtMonth(r.key)}
                    rows={[
                      ...(type !== 'trailer' ? [{ label: 'Truck tires', value: fmtNumber(r.truckTires), color: 'var(--truck)' }] : []),
                      ...(type !== 'truck' ? [{ label: 'Trailer tires', value: fmtNumber(r.trailerTires), color: 'var(--trailer)' }] : []),
                      { label: 'Events', value: fmtNumber(r.events), color: 'var(--warning)' },
                      { label: 'Tires per event', value: r.events ? (r.tires / r.events).toFixed(2) : '—', emphasis: true },
                    ]}
                  />
                )
              }}
            />
            {type !== 'trailer' && (
              <Area type="monotone" dataKey="truckTires" stackId="t" stroke="var(--truck)" strokeWidth={1.5} fill="url(#fillTruck)" animationDuration={700} />
            )}
            {type !== 'truck' && (
              <Area type="monotone" dataKey="trailerTires" stackId="t" stroke="var(--trailer)" strokeWidth={1.5} fill="url(#fillTrailer)" animationDuration={700} />
            )}
            {showEvents && (
              <Line type="monotone" dataKey="events" stroke="var(--warning)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} animationDuration={700} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}

export function CostPerTireChart({ rows, type, average }: { rows: MonthRow[]; type: TypeFilter; average: number }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const toggle = (k: string) =>
    setHidden((h) => {
      const n = new Set(h)
      if (n.has(k)) n.delete(k)
      else n.add(k)
      return n
    })
  const series = [
    { key: 'costPerTire', label: 'Blended', color: 'var(--foreground)', show: type === 'all' },
    { key: 'truckCpt', label: 'Truck', color: 'var(--truck)', show: type !== 'trailer' },
    { key: 'trailerCpt', label: 'Trailer', color: 'var(--trailer)', show: type !== 'truck' },
  ].filter((s) => s.show)

  return (
    <Panel
      title="Cost per tire"
      description={`Monthly average · period mean ${fmtCurrency(average)}`}
      actions={<Legend items={series.map((s) => ({ label: s.label, color: s.color, muted: hidden.has(s.key), onClick: () => toggle(s.key) }))} />}
    >
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
            <XAxis dataKey="key" tickFormatter={fmtMonthShort} tick={AXIS_TICK} tickLine={false} axisLine={false} minTickGap={16} />
            <YAxis
              tickFormatter={(v) => `$${v}`}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={44}
              domain={['dataMin - 30', 'dataMax + 30']}
              allowDecimals={false}
            />
            <ReferenceLine y={average} stroke="var(--muted-foreground)" strokeDasharray="2 4" />
            <Tooltip
              cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const r = payload[0].payload as MonthRow
                return (
                  <TooltipCard
                    title={fmtMonth(r.key)}
                    rows={series.map((s) => ({
                      label: s.label,
                      value: fmtCurrency(r[s.key as keyof MonthRow] as number, { cents: true }),
                      color: s.color,
                    }))}
                  />
                )
              }}
            />
            {series
              .filter((s) => !hidden.has(s.key))
              .map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={(r: MonthRow) => (r[s.key as keyof MonthRow] as number) || null}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={s.key === 'costPerTire' ? 2 : 1.5}
                  dot={false}
                  activeDot={{ r: 3.5, strokeWidth: 0 }}
                  connectNulls
                  animationDuration={700}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}
