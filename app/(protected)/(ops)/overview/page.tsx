export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { ArrowUpRight, Database, ShieldAlert } from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard | OPS' }
const blocks = [{"title": "Total Trucks"}, {"title": "Active Trucks"}, {"title": "Home Time"}, {"title": "Open / Broken Trucks"}]
export default function ModulePage() {
  return <div className="mx-auto max-w-[1440px] space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><div className="mb-2 text-[11px] font-semibold uppercase tracking-[.18em] text-primary">OPS / Dashboard</div>
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Dashboard</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Operations only: active fleet, truck availability, truck status and operational monitoring. No safety or financial metrics in this section.</p></div>
      <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">Independent module</span>
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {blocks.map(item => <div key={item.title} className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-xs font-medium text-muted-foreground">{item.title}</p>
        <p className="mt-5 text-2xl font-semibold tracking-tight">—</p>
        <p className="mt-2 text-xs text-muted-foreground">Awaiting connected source</p>
      </div>)}
    </div>
    <div className="grid gap-4 xl:grid-cols-5">
      <section className="rounded-xl border bg-card p-6 xl:col-span-3">
        <div className="mb-8 flex items-center justify-between"><h2 className="text-base font-semibold">Fleet operating status</h2><ArrowUpRight className="size-4 text-muted-foreground" /></div>
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 text-center">
          <Database className="mb-4 size-7 text-muted-foreground/70" />
          <p className="font-medium">No connected records</p><p className="mt-1 max-w-sm text-sm text-muted-foreground">Real charts will appear here when this module's Google Sheet is connected.</p>
        </div>
      </section>
      <section className="rounded-xl border bg-card p-6 xl:col-span-2">
        <h2 className="text-base font-semibold">Module configuration</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Connect the OPERATION sheet and confirm status mappings before displaying fleet totals.</p>
        <div className="mt-8 flex items-start gap-3 rounded-lg border bg-muted/30 p-4"><ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-500" /><p className="text-xs leading-5 text-muted-foreground">No old Cloudflare data and no invented sample figures are shown here.</p></div>
      </section>
    </div>
  </div>
}
