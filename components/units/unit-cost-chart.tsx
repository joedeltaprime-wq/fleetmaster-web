'use client'

import { useState } from 'react'
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { UnitType } from '@/lib/data/types'
import { fmtCurrency, fmtMonth, fmtMonthShort, fmtNumber } from '@/lib/format'
import { AXIS_TICK, GRID_STROKE, TooltipCard } from '@/components/ops/chart-kit'
import { Legend, Panel } from '@/components/ops/primitives'

type Row = { key: string; cost: number; tires: number; fleetAvg: number }

export function UnitCostChart({ monthly, type }: { monthly: Row[]; type: UnitType }) {
  const [showFleet, setShowFleet] = useState(true)
  const total = monthly.reduce((s, r) => s + r.cost, 0)
  return (
    <Panel
      title="Monthly tire cost"
      description={`Last 24 months · ${fmtCurrency(total)} total`}
      actions={
        <Legend
          items={[
            { label: 'This unit', color: `var(--${type})` },
            { label: `${type === 'truck' ? 'Truck' : 'Trailer'} fleet avg`, color: 'var(--muted-foreground)', muted: !showFleet, onClick: () => setShowFleet((s) => !s) },
          ]}
        />
      }
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthly} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 3" />
            <XAxis dataKey="key" tickFormatter={fmtMonthShort} tick={AXIS_TICK} tickLine={false} axisLine={false} minTickGap={16} />
            <YAxis tickFormatter={(v) => fmtCurrency(v, { compact: true })} tick={AXIS_TICK} tickLine={false} axisLine={false} width={48} />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const r = payload[0].payload as Row
                return (
                  <TooltipCard
                    title={fmtMonth(r.key)}
                    rows={[
                      { label: 'This unit', value: fmtCurrency(r.cost), color: `var(--${type})` },
                      { label: 'Tires', value: fmtNumber(r.tires) },
                      { label: 'Fleet avg / unit', value: fmtCurrency(r.fleetAvg), color: 'var(--muted-foreground)', emphasis: true },
                    ]}
                  />
                )
              }}
            />
            <Bar dataKey="cost" fill={`var(--${type})`} radius={[3, 3, 0, 0]} maxBarSize={22} animationDuration={600} />
            {showFleet && (
              <Line type="monotone" dataKey="fleetAvg" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} animationDuration={600} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}
