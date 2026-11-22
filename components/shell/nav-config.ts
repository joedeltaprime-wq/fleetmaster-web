import { Clock, Disc3, History, KeyRound, LayoutDashboard, Settings, ShieldCheck, Wallet, type LucideIcon } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  ready: boolean
}

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Monitor',
    items: [
      { href: '/overview', label: 'Dashboard', icon: LayoutDashboard, ready: true },
      { href: '/safety', label: 'Inspections & Safety', icon: ShieldCheck, ready: true },
    ],
  },
  {
    label: 'Fleet assets',
    items: [
      { href: '/costs', label: 'Costs', icon: Wallet, ready: true },
      { href: '/tires', label: 'Tire Intelligence', icon: Disc3, ready: true },
      { href: '/units', label: 'Unit History', icon: History, ready: true },
    ],
  },
  {
    label: 'Operations',
    items: [{ href: '/time-zones', label: 'Time Zones', icon: Clock, ready: false }],
  },
  {
    label: 'Admin',
    items: [
      { href: '/access', label: 'Access Management', icon: KeyRound, ready: false },
      { href: '/settings', label: 'Settings', icon: Settings, ready: false },
    ],
  },
]

export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items)
