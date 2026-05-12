'use client'

import { Truck, Activity, Home, AlertTriangle, Car, Skull, Clock, Wrench, Building2, DollarSign, Container, Gauge } from 'lucide-react'
import { kpiData } from '@/lib/fleet-data'

const kpis = [
  {
    label: 'Total Trucks',
    value: kpiData.totalTrucks,
    icon: Truck,
    change: '+3 today',
    changeType: 'positive',
    sparkline: 'up'
  },
  {
    label: 'Active Trucks',
    value: kpiData.activeTrucks,
    icon: Activity,
    change: '74.5% of total',
    changeType: 'neutral',
    sparkline: 'up'
  },
  {
    label: 'Home Time',
    value: kpiData.homeTime,
    icon: Home,
    change: '8.7% of total',
    changeType: 'neutral',
    color: 'blue',
    sparkline: 'neutral'
  },
  {
    label: 'Broken Trucks',
    value: kpiData.brokenTrucks,
    icon: AlertTriangle,
    change: '5.8% of total',
    changeType: 'danger',
    color: 'red',
    sparkline: 'down'
  },
  {
    label: 'Accident',
    value: kpiData.accident,
    icon: Car,
    change: '2.1% of total',
    changeType: 'danger',
    color: 'orange',
    sparkline: 'down'
  },
  {
    label: 'Total Lost',
    value: kpiData.totalLost,
    icon: Skull,
    change: '1.4% of total',
    changeType: 'danger',
    color: 'darkred',
    sparkline: 'neutral'
  },
  {
    label: 'Getting Ready',
    value: kpiData.gettingReady,
    icon: Clock,
    change: '3.6% of total',
    changeType: 'neutral',
    color: 'purple',
    sparkline: 'up'
  },
  {
    label: 'In Shop',
    value: kpiData.inShop,
    icon: Wrench,
    change: '5.8% of total',
    changeType: 'warning',
    color: 'gray',
    sparkline: 'down'
  },
  {
    label: 'High Risk Shops',
    value: kpiData.highRiskShops,
    icon: Building2,
    change: 'Blacklisted',
    changeType: 'danger',
    color: 'red',
    sparkline: 'neutral'
  },
  {
    label: 'Monthly Cost',
    value: `$${(kpiData.monthlyCost / 1000).toFixed(0)}K`,
    icon: DollarSign,
    change: '+$12K vs last',
    changeType: 'warning',
    color: 'yellow',
    sparkline: 'up'
  },
  {
    label: 'Trailer Cost',
    value: `$${(kpiData.trailerCost / 1000).toFixed(0)}K`,
    icon: Container,
    change: '-$3K vs last',
    changeType: 'positive',
    sparkline: 'down'
  },
  {
    label: 'PM Risk',
    value: kpiData.pmRisk,
    icon: Gauge,
    change: '< 2,500 mi',
    changeType: 'warning',
    color: 'cyan',
    sparkline: 'up'
  }
]

function Sparkline({ type }: { type: string }) {
  if (type === 'up') {
    return (
      <svg className="h-8 w-16" viewBox="0 0 64 32">
        <path
          d="M0 28 L12 24 L24 20 L36 16 L48 10 L64 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-accent"
        />
      </svg>
    )
  }
  if (type === 'down') {
    return (
      <svg className="h-8 w-16" viewBox="0 0 64 32">
        <path
          d="M0 4 L12 8 L24 12 L36 18 L48 24 L64 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-destructive"
        />
      </svg>
    )
  }
  return (
    <svg className="h-8 w-16" viewBox="0 0 64 32">
      <path
        d="M0 16 L16 14 L32 18 L48 15 L64 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-muted-foreground"
      />
    </svg>
  )
}

export function KPICards() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="glass-card rounded-xl p-3"
        >
          <div className="mb-2 flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                kpi.color === 'orange'
                  ? 'bg-orange-500/20 text-orange-400'
                  : kpi.color === 'yellow'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : kpi.color === 'red'
                  ? 'bg-red-500/20 text-red-400'
                  : kpi.color === 'darkred'
                  ? 'bg-red-900/30 text-red-600'
                  : kpi.color === 'cyan'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : kpi.color === 'blue'
                  ? 'bg-blue-500/20 text-blue-400'
                  : kpi.color === 'purple'
                  ? 'bg-purple-500/20 text-purple-400'
                  : kpi.color === 'gray'
                  ? 'bg-slate-500/20 text-slate-400'
                  : 'bg-primary/20 text-primary'
              }`}
            >
              <kpi.icon className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-foreground">{kpi.value}</p>
          <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
          <p
            className={`text-[10px] ${
              kpi.changeType === 'positive'
                ? 'text-accent'
                : kpi.changeType === 'danger'
                ? 'text-destructive'
                : kpi.changeType === 'warning'
                ? 'text-yellow-400'
                : 'text-muted-foreground'
            }`}
          >
            {kpi.change}
          </p>
        </div>
      ))}
    </div>
  )
}
