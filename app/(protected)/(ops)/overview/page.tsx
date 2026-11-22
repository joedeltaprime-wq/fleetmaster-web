export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { ArrowUpRight, Database, ShieldAlert } from 'lucide-react'
import { getOperationDashboardData } from '@/lib/data/operation-sheet'

export const metadata: Metadata = { title: 'Dashboard | OPS' }
export default async function ModulePage() {
  const dashboard = await getOperationDashboardData()
  const metrics = dashboard.status === 'ready' ? dashboard.metrics : null
  const blocks = [
    { title: 'Total Trucks', value: metrics?.totalTrucks ?? 'N/A', detail: metrics ? 'Unique Truck Unit values' : 'OPERATION source not configured' },
    { title: 'Active Trucks', value: metrics?.activeTrucks ?? 'N/A', detail: metrics ? 'Status: ON DUTY' : 'OPERATION source not configured' },
    { title: 'Home Time', value: metrics?.homeTime ?? 'N/A', detail: !metrics ? 'OPERATION source not configured' : metrics.homeTime === null ? 'E2 summary unavailable' : 'Count from OPERATION cell E2' },
    { title: 'Broken Trucks', value: 'N/A', detail: 'No confirmed broken-truck status in OPERATION' },
  ]
  const sourceReady = dashboard.status === 'ready'
  const statusRows = metrics ? [
    { label: 'ON DUTY', count: metrics.activeTrucks, color: 'bg-emerald-500' },
    { label: 'NEED A DRIVER', count: metrics.needDriverTrucks, color: 'bg-sky-500' },
  ] : []

  return <div className="mx-auto max-w-[1440px] space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><div className="mb-2 text-[11px] font-semibold uppercase tracking-[.18em] text-primary">OPS / Dashboard</div>
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Dashboard</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Operations only: active fleet, truck availability, truck status and operational monitoring. No safety or financial metrics in this section.</p></div>
      <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">{sourceReady ? 'OPERATION · READ ONLY' : 'OPERATION · NOT CONFIGURED'}</span>
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {blocks.map(item => <div key={item.title} className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-xs font-medium text-muted-foreground">{item.title}</p>
        <p className="mt-5 text-2xl font-semibold tracking-tight">{item.value}</p>
        <p className="mt-2 text-xs text-muted-foreground">{item.detail}</p>
      </div>)}
    </div>
    <div className="grid gap-4 xl:grid-cols-5">
      <section className="rounded-xl border bg-card p-6 xl:col-span-3">
        <div className="mb-8 flex items-center justify-between"><h2 className="text-base font-semibold">Fleet operating status</h2><ArrowUpRight className="size-4 text-muted-foreground" /></div>
        <div className="min-h-64 rounded-lg border border-dashed bg-muted/20 p-5">
          {metrics ? <div className="space-y-6">
            {statusRows.map(row => {
              const percent = metrics.totalTrucks ? Math.round((row.count / metrics.totalTrucks) * 100) : 0
              return <div key={row.label} className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">{row.label}</span><strong>{row.count}</strong></div>
                <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full ${row.color}`} style={{ width: `${percent}%` }} /></div>
              </div>
            })}
            <p className="text-xs text-muted-foreground">Counts use unique Truck Unit values from rows 4 onward. Statuses are read from column C.</p>
          </div> : <div className="flex min-h-52 flex-col items-center justify-center text-center">
            <Database className="mb-4 size-7 text-muted-foreground/70" />
            <p className="font-medium">OPERATION source not configured</p><p className="mt-1 max-w-sm text-sm text-muted-foreground">Configure the staging Cloudflare bindings to load read-only fleet records.</p>
          </div>}
        </div>
      </section>
      <section className="rounded-xl border bg-card p-6 xl:col-span-2">
        <h2 className="text-base font-semibold">OPERATION mapping</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Column B is the unique Truck Unit, column C is Status, and cell E2 contains the Home Time count.</p>
        <div className="mt-5 space-y-2 text-xs text-muted-foreground">
          <p><span className="font-medium text-foreground">Active:</span> ON DUTY</p>
          <p><span className="font-medium text-foreground">Inactive:</span> Need a Driver</p>
          <p><span className="font-medium text-foreground">Broken Trucks:</span> N/A; no broken status is mapped.</p>
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-lg border bg-muted/30 p-4"><ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-500" /><p className="text-xs leading-5 text-muted-foreground">Inspection OOS and demo records are not used to infer truck condition or live fleet totals.</p></div>
      </section>
    </div>
  </div>
}
