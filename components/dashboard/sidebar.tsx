'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/lib/sidebar-context'
import { useState, useRef, useEffect } from 'react'
import { useAuthSession } from '@/components/auth/session-provider'
import { SignOutButton } from '@/components/auth/sign-out-button'
import {
  LayoutDashboard,
  Truck,
  Map,
  Building2,
  CircleDot,
  DollarSign,
  TruckIcon,
  Container,
  Ban,
  AlertTriangle,
  Bell,
  FileText,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  KeyRound
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Truck, label: 'Operations', href: '/operations' },
  { icon: Map, label: 'Live Map', href: '/live-map' },
  { icon: Building2, label: 'Shops Network', href: '/shops' },
  { icon: CircleDot, label: 'Tire Shops', href: '/tire-shops' },
  { icon: DollarSign, label: 'Cost Center', href: '/cost-center' },
  { icon: TruckIcon, label: 'Truck Costs', href: '/truck-costs' },
  { icon: Container, label: 'Trailer Costs', href: '/trailer-costs' },
  { icon: Ban, label: 'Blacklist', href: '/blacklist' },
  { icon: AlertTriangle, label: 'Weak Trucks', href: '/weak-trucks' },
  { icon: Bell, label: 'Alerts', href: '/alerts', badge: 12 },
  { icon: FileText, label: 'Reports', href: '/reports' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isCollapsed, toggleCollapsed } = useSidebar()
  const user = useAuthSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
          <Truck className="h-5 w-5 text-primary" />
        </div>
        {!isCollapsed && (
          <span className="text-base font-bold text-foreground whitespace-nowrap">FleetMaster</span>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleCollapsed}
        className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                  {item.badge && !isCollapsed && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && isCollapsed && (
                    <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="relative border-t border-border p-3" ref={menuRef}>
        <button 
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-secondary transition-colors",
            isCollapsed && "justify-center px-2"
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shrink-0">
            {(user.name || user.email).slice(0, 1).toUpperCase()}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 text-left">
                <p className="truncate text-sm font-medium text-foreground">{user.name || user.email}</p>
                <p className="text-xs text-muted-foreground">{user.role === 'owner' ? 'Owner' : 'User'}</p>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                showUserMenu && "rotate-180"
              )} />
            </>
          )}
        </button>

        {/* Account menu */}
        {showUserMenu && (
          <div className={cn(
            "absolute bottom-full left-0 mb-2 w-72 rounded-xl border border-border bg-card shadow-xl",
            isCollapsed && "left-full ml-2 bottom-0"
          )}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-white">Account</span>
              </div>
              <button
                onClick={() => setShowUserMenu(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 border-t border-border p-3">
              <p className="break-all text-xs text-gray-300">{user.email}</p>
              {user.role === 'owner' && (
                <Link
                  href="/access"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-blue-300 hover:bg-blue-500/10"
                >
                  <KeyRound className="h-4 w-4" />
                  Access management
                </Link>
              )}
              <SignOutButton className="w-full rounded-lg px-2 py-2 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white" />
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
