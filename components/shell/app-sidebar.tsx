'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DataMeta } from '@/lib/data/types'
import { fmtDate } from '@/lib/format'
import { NAV_GROUPS } from './nav-config'

export function OpsLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex size-7 items-center justify-center rounded-md bg-foreground text-background" aria-hidden="true">
        <svg viewBox="0 0 16 16" className="size-4" fill="none">
          <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="1.75" fill="currentColor" />
          <path d="M8 2.75V5M8 11v2.25M2.75 8H5M11 8h2.25" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight">OPS</span>
        <span className="mt-0.5 text-[11px] text-muted-foreground">Operations Intelligence</span>
      </div>
    </div>
  )
}

export function AppSidebar({ meta, onNavigate }: { meta: DataMeta; onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center px-4">
        <Link href="/overview" onClick={onNavigate} className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2">
          <OpsLogo />
        </Link>
      </div>

      <nav aria-label="Primary" className="scrollbar-thin flex-1 overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-2.5 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{group.label}</p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors',
                        active
                          ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                      )}
                    >
                      {active && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary" aria-hidden="true" />}
                      <Icon className={cn('size-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                      {!item.ready && (
                        <span className="ml-auto rounded border border-sidebar-border px-1 text-[10px] leading-4 text-muted-foreground">Soon</span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-lg border border-sidebar-border bg-background/40 p-3">
          <div className="flex items-center gap-2">
            <Database className="size-3.5 text-warning" aria-hidden="true" />
            <span className="text-xs font-medium">{meta.label}</span>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">{meta.source === 'google-sheets' ? 'Live' : 'Offline'}</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {meta.source === 'google-sheets' ? 'Tire and unit history only. Dashboard, Costs, Safety still require integration.' : 'Connect Google Sheets to display tire history.'}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2.5 px-1">
          <div className="flex size-7 items-center justify-center rounded-full bg-secondary text-[11px] font-medium" aria-hidden="true">
            OM
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-medium">Ops Manager</p>
            <p className="truncate text-[11px] text-muted-foreground">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  )
}
