'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Menu, Search, X } from 'lucide-react'
import type { DataMeta, Unit } from '@/lib/data/types'
import { AppSidebar } from './app-sidebar'
import { ThemeToggle } from './theme-toggle'
import { UnitSearchDialog } from './unit-search-dialog'
import { NAV_ITEMS } from './nav-config'

export function AppShell({ meta, units, children }: { meta: DataMeta; units: Unit[]; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-sidebar-border lg:block">
        <AppSidebar meta={meta} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm animate-in fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-64 border-r border-sidebar-border shadow-2xl animate-in slide-in-from-left duration-200">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-3.5 z-10 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            <AppSidebar meta={meta} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="-ml-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          >
            <Menu className="size-4" />
          </button>
          <Breadcrumbs units={units} />
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-8 items-center gap-2 rounded-lg border bg-card/60 px-2.5 text-xs text-muted-foreground transition-colors hover:border-ring/40 hover:text-foreground md:w-64"
            >
              <Search className="size-3.5" aria-hidden="true" />
              <span className="hidden md:inline">Search trucks & trailers…</span>
              <span className="sr-only md:hidden">Search units</span>
              <kbd className="ml-auto hidden rounded border bg-background px-1.5 font-mono text-[10px] md:inline">⌘K</kbd>
            </button>
            <span className="hidden items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning sm:flex">
              <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
              {meta.source === 'google-sheets' ? 'Tires: Google Sheets' : 'Tires: Not connected'}
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 px-4 pb-16 pt-6 md:px-6 lg:px-8">{children}</main>
      </div>

      <UnitSearchDialog units={units} open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}

function Breadcrumbs({ units }: { units: Unit[] }) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const root = NAV_ITEMS.find((n) => n.href === `/${segments[0]}`)
  const unit = segments[0] === 'units' && segments[1] ? units.find((u) => u.id === segments[1]) : undefined

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-[13px]">
        <li className="hidden text-muted-foreground sm:block">OPS</li>
        {root && (
          <>
            <ChevronRight className="hidden size-3.5 text-muted-foreground/60 sm:block" aria-hidden="true" />
            <li className="truncate">
              {unit ? (
                <Link href={root.href} className="text-muted-foreground hover:text-foreground">
                  {root.label}
                </Link>
              ) : (
                <span className="font-medium" aria-current="page">
                  {root.label}
                </span>
              )}
            </li>
          </>
        )}
        {unit && (
          <>
            <ChevronRight className="size-3.5 text-muted-foreground/60" aria-hidden="true" />
            <li className="truncate font-medium" aria-current="page">
              {unit.label}
            </li>
          </>
        )}
      </ol>
    </nav>
  )
}
