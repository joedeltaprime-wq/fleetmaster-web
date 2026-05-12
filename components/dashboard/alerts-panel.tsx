'use client'

import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { alerts, topDestinations } from '@/lib/truck-data'

const alertIcons = {
  danger: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info
}

const alertColors = {
  danger: 'bg-red-500/20 text-red-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  success: 'bg-green-500/20 text-green-400',
  info: 'bg-blue-500/20 text-blue-400'
}

export function AlertsPanel() {
  return (
    <div className="glass-card flex h-full flex-col rounded-xl">
      {/* Live Alerts */}
      <div className="flex-1 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Live Alerts</h3>
          <button className="text-xs text-primary hover:underline">View all</button>
        </div>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = alertIcons[alert.type]
            return (
              <div key={alert.id} className="flex items-start gap-3">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${alertColors[alert.type]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Truck {alert.truckNumber}</span>{' '}
                    {alert.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Current: {alert.location}
                  </p>
                </div>
                <span className="flex-shrink-0 text-xs text-muted-foreground">
                  {alert.time}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Destinations */}
      <div className="border-t border-border p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Top Destinations</h3>
          <button className="text-xs text-primary hover:underline">View all</button>
        </div>
        <div className="space-y-3">
          {topDestinations.map((dest) => (
            <div key={dest.state} className="flex items-center gap-3">
              <span className="w-20 text-sm text-muted-foreground">{dest.state}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(dest.trucks / 30) * 100}%`,
                    backgroundColor: dest.color
                  }}
                />
              </div>
              <span className="w-16 text-right text-sm text-muted-foreground">
                {dest.trucks} trucks
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
