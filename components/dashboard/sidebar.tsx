'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/lib/sidebar-context'
import { useState, useRef, useEffect } from 'react'
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
  UserPlus,
  Trash2,
  X,
  Users,
  Mail
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

interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Manager' | 'Dispatcher' | 'Viewer'
  avatar: string
}

const initialUsers: User[] = [
  { id: '1', name: 'Joe White', email: 'joe.white@gmail.com', role: 'Admin', avatar: 'J' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@gmail.com', role: 'Manager', avatar: 'S' },
  { id: '3', name: 'Mike Davis', email: 'mike.d@gmail.com', role: 'Dispatcher', avatar: 'M' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isCollapsed, toggleCollapsed } = useSidebar()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0])
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState<User['role']>('Viewer')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
        setShowAddUser(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddUser = () => {
    if (newUserEmail && newUserName) {
      const newUser: User = {
        id: Date.now().toString(),
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        avatar: newUserName.charAt(0).toUpperCase()
      }
      setUsers([...users, newUser])
      setNewUserEmail('')
      setNewUserName('')
      setNewUserRole('Viewer')
      setShowAddUser(false)
    }
  }

  const handleRemoveUser = (userId: string) => {
    if (userId !== currentUser.id) {
      setUsers(users.filter(u => u.id !== userId))
    }
  }

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user)
    setShowUserMenu(false)
  }

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
            {currentUser.avatar}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.role}</p>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                showUserMenu && "rotate-180"
              )} />
            </>
          )}
        </button>

        {/* User Management Dropdown */}
        {showUserMenu && (
          <div className={cn(
            "absolute bottom-full left-0 mb-2 w-72 rounded-xl border border-border bg-card shadow-xl",
            isCollapsed && "left-full ml-2 bottom-0"
          )}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-white">Manage Users</span>
              </div>
              <button
                onClick={() => setShowUserMenu(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* User List */}
            <div className="max-h-48 overflow-y-auto p-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg p-2 group",
                    currentUser.id === user.id ? "bg-primary/10" : "hover:bg-secondary"
                  )}
                >
                  <button
                    onClick={() => handleSwitchUser(user)}
                    className="flex flex-1 items-center gap-3"
                  >
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shrink-0",
                      currentUser.id === user.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-white"
                    )}>
                      {user.avatar}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-gray-300">{user.email}</p>
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded",
                      user.role === 'Admin' && "bg-red-500/30 text-red-400",
                      user.role === 'Manager' && "bg-blue-500/30 text-blue-400",
                      user.role === 'Dispatcher' && "bg-green-500/30 text-green-400",
                      user.role === 'Viewer' && "bg-gray-500/30 text-gray-400"
                    )}>
                      {user.role}
                    </span>
                  </button>
                  {user.id !== currentUser.id && (
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition-all"
                      title="Remove user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add User Section */}
            {!showAddUser ? (
              <div className="border-t border-border p-2">
                <button
                  onClick={() => setShowAddUser(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Add New User
                </button>
              </div>
            ) : (
              <div className="border-t border-border p-3 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <UserPlus className="h-4 w-4 text-blue-400" />
                  Add New User
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="email@gmail.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-white/10 pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as User['role'])}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="Dispatcher">Dispatcher</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowAddUser(false)
                      setNewUserEmail('')
                      setNewUserName('')
                    }}
                    className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser}
                    disabled={!newUserEmail || !newUserName}
                    className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add User
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
