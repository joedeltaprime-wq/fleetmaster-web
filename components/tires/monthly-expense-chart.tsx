'use client'

import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthRow, TypeFilter } from '@/lib/analytics'
import { fmtCurrency, fmtMonth, fmtMonthShort, fmtNumber } from '@/lib/format'
import { AXIS_TICK, GRID_STROKE, TooltipCard } from '@/components/ops/chart-kit'
import { Legend, Panel } from '@/components/ops/primitives'
import { Segmented } from '@/components/ops/segmented'

export function MonthlyExpenseChart({ rows, type }: { rows: MonthRow[]; type: TypeFilter }) {
  const [mode, setMode] = useState<'stacked' | 'grouped'>('stacked')
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const showTruck = type !== 'trailer' && !hidden.has('truck')
  const showTrailer = type !== 'truck' && !hidden.has('trailer')
  const toggle = (k: string) =>
    setHidden((h) => {
      const n = new Set(h)
      if (n.has(k)) n.delete(k)
      else n.add(k)
      return n
    })

  const legend = [
    ...(type !== 'trailer' ? [{ label: 'Truck', color: 'var(--truck)', muted: hidden.has('truck'), onClick: () => toggle('truck') }] : []),
    ...(type !== 'truck' ? [{ label: 'Trailer', color: 'var(--trailer)', muted: hidden.has('trailer'), onClick: () => toggle('trailer') }] : []),
  ]

  return (
    <Panel
      title="Monthly expenses"
      description="Truck vs trailer tire spend by month"
      actions={
        <>
          <Legend items={legend} />
          <Segmented
            size="sm"
            label="Bar layout"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'stacked', label: 'Stacked' },
              { value: 'grouped', label: 'Side by side' },
            ]}
          />
        </>
      }
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={2}>
            <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
            <XAxis dataKey="key" tickFormatter={fmtMonthShort} tick={AXIS_TICK} tickLine={false} axisLine={false} minTickGap={12} />
            <YAxis tickFormatter={(v) => fmtCurrency(v, { compact: true })} tick={AXIS_TICK} tickLine={false} axisLine={false} width={52} />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const r = payload[0].payload as MonthRow
                return (
                  <TooltipCard
                    title={fmtMonth(r.key)}
                    rows={[
                      ...(type !== 'trailer' ? [{ label: 'Truck', value: fmtCurrency(r.truckCost), color: 'var(--truck)' }] : []),
                      ...(type !== 'truck' ? [{ label: 'Trailer', value: fmtCurrency(r.trailerCost), color: 'var(--trailer)' }] : []),
                      { label: 'Total', value: fmtCurrency(r.totalCost), emphasis: true },
                      { label: 'Tires · events', value: `${fmtNumber(r.tires)} · ${fmtNumber(r.events)}` },
                    ]}
                  />
                )
              }}
            />
            {showTruck && (
              <Bar
                dataKey="truckCost"
                stackId={mode === 'stacked' ? 'a' : undefined}
                fill="var(--truck)"
                radius={mode === 'stacked' && showTrailer ? [0, 0, 0, 0] : [3, 3, 0, 0]}
                maxBarSize={mode === 'stacked' ? 28 : 14}
                animationDuration={600}
              />
            )}
            {showTrailer && (
              <Bar
                dataKey="trailerCost"
                stackId={mode === 'stacked' ? 'a' : undefined}
                fill="var(--trailer)"
                radius={[3, 3, 0, 0]}
                maxBarSize={mode === 'stacked' ? 28 : 14}
                animationDuration={600}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}
