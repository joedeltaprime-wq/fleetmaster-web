'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MainContent } from '@/components/dashboard/main-content'
import { weakTrucks } from '@/lib/fleet-data'
import { Search, AlertTriangle, CheckCircle, XCircle, Eye, MoreVertical } from 'lucide-react'

export default function WeakTrucksPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('All')

  const filteredTrucks = weakTrucks.filter(truck => {
    const matchesSearch = truck.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.make.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRisk = riskFilter === 'All' || truck.riskLevel === riskFilter
    return matchesSearch && matchesRisk
  })

  const riskColors = {
    High: 'bg-red-500/20 text-red-400',
    Medium: 'bg-orange-500/20 text-orange-400',
    Low: 'bg-yellow-500/20 text-yellow-400'
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent>
        <Header title="Weak Trucks" subtitle="Problematic trucks requiring attention" />
        
        <main className="p-6">
          {/* Summary Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="glass-card rounded-xl border-l-4 border-red-500 p-4">
              <p className="text-sm text-muted-foreground">High Risk</p>
              <p className="text-3xl font-bold text-red-400">{weakTrucks.filter(t => t.riskLevel === 'High').length}</p>
            </div>
            <div className="glass-card rounded-xl border-l-4 border-orange-500 p-4">
              <p className="text-sm text-muted-foreground">Medium Risk</p>
              <p className="text-3xl font-bold text-orange-400">{weakTrucks.filter(t => t.riskLevel === 'Medium').length}</p>
            </div>
            <div className="glass-card rounded-xl border-l-4 border-yellow-500 p-4">
              <p className="text-sm text-muted-foreground">Low Risk</p>
              <p className="text-3xl font-bold text-yellow-400">{weakTrucks.filter(t => t.riskLevel === 'Low').length}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="glass-card mb-6 flex flex-wrap items-center gap-4 rounded-xl p-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search truck number, make..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          {/* Weak Trucks Table */}
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Truck #</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Make/Model/Year</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Jigari Bormi</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Risk Level</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Notes</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrucks.map((truck) => (
                    <tr key={truck.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground">
                        {truck.truckNumber}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                        {truck.make} {truck.model} {truck.year}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {truck.jigariPresent ? (
                          <span className="flex items-center gap-1 text-accent">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">YES</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-destructive">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">NO</span>
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${riskColors[truck.riskLevel]}`}>
                          <AlertTriangle className="h-3 w-3" />
                          {truck.riskLevel}
                        </span>
                      </td>
                      <td className="max-w-[300px] px-4 py-3 text-sm text-muted-foreground">
                        {truck.notes}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border bg-secondary/30 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Showing {filteredTrucks.length} weak trucks
              </p>
            </div>
          </div>
        </main>
      </MainContent>
    </div>
  )
}
