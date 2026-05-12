'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MainContent } from '@/components/dashboard/main-content'
import { alerts } from '@/lib/truck-data'
import { AlertTriangle, CheckCircle, Info, XCircle, Bell, Filter } from 'lucide-react'
import { useState } from 'react'

const allAlerts = [
  ...alerts,
  { id: '5', type: 'warning' as const, truckNumber: '4012', message: 'Low fuel warning', location: 'Sacramento, CA', time: '1h 30m ago' },
  { id: '6', type: 'info' as const, truckNumber: '3015', message: 'Approaching weigh station', location: 'Portland, OR', time: '2h ago' },
  { id: '7', type: 'danger' as const, truckNumber: '2040', message: 'Engine temperature high', location: 'Beavercreek, OH', time: '2h 15m ago' },
  { id: '8', type: 'success' as const, truckNumber: '4025', message: 'Delivery completed', location: 'Orlando, FL', time: '3h ago' },
  { id: '9', type: 'warning' as const, truckNumber: '5001', message: 'Hours of service warning', location: 'Denver, CO', time: '3h 30m ago' },
  { id: '10', type: 'info' as const, truckNumber: '1032', message: 'Route deviation detected', location: 'Mobile, AL', time: '4h ago' },
]

const alertIcons = {
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
  success: CheckCircle
}

const alertColors = {
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  danger: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  success: 'bg-green-500/20 text-green-400 border-green-500/30'
}

export default function AlertsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('All')

  const filteredAlerts = typeFilter === 'All' 
    ? allAlerts 
    : allAlerts.filter(a => a.type === typeFilter)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent>
        <Header title="Alerts" subtitle="Real-time fleet notifications and warnings" />
        
        <main className="p-6">
          {/* Summary */}
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <div className="glass-card rounded-xl border-l-4 border-red-500 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-3xl font-bold text-red-400">{allAlerts.filter(a => a.type === 'danger').length}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400/50" />
              </div>
            </div>
            <div className="glass-card rounded-xl border-l-4 border-yellow-500 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                  <p className="text-3xl font-bold text-yellow-400">{allAlerts.filter(a => a.type === 'warning').length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400/50" />
              </div>
            </div>
            <div className="glass-card rounded-xl border-l-4 border-blue-500 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Info</p>
                  <p className="text-3xl font-bold text-blue-400">{allAlerts.filter(a => a.type === 'info').length}</p>
                </div>
                <Info className="h-8 w-8 text-blue-400/50" />
              </div>
            </div>
            <div className="glass-card rounded-xl border-l-4 border-green-500 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success</p>
                  <p className="text-3xl font-bold text-green-400">{allAlerts.filter(a => a.type === 'success').length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400/50" />
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="glass-card mb-6 flex items-center gap-4 rounded-xl p-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Alerts</option>
              <option value="danger">Critical</option>
              <option value="warning">Warnings</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
            </select>
            <span className="text-sm text-muted-foreground">
              Showing {filteredAlerts.length} alerts
            </span>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const Icon = alertIcons[alert.type]
              return (
                <div
                  key={alert.id}
                  className={`glass-card flex items-center gap-4 rounded-xl border p-4 ${alertColors[alert.type]}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-current/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Truck {alert.truckNumber}</span>
                      <span className="text-sm opacity-80">{alert.message}</span>
                    </div>
                    <p className="text-sm opacity-70">{alert.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-70">{alert.time}</p>
                    <button className="mt-1 text-xs underline opacity-70 hover:opacity-100">
                      View Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      </MainContent>
    </div>
  )
}
