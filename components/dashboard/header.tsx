'use client'

import { Search, Bell, Moon, Sun, ChevronDown } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({ title = 'Dashboard', subtitle = 'Fleet overview and real-time operations' }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search truck, driver, location..."
            className="h-10 w-64 rounded-lg border border-border bg-input pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Fleet Selector */}
        <button className="flex h-10 items-center gap-2 rounded-lg border border-border bg-secondary px-4 text-sm text-muted-foreground hover:text-foreground">
          All Fleets
          <ChevronDown className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-white">
            3
          </span>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* User Avatar */}
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          J
        </button>
      </div>
    </header>
  )
}
