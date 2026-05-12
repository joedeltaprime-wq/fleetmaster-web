'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MainContent } from '@/components/dashboard/main-content'
import { truckCosts } from '@/lib/fleet-data'
import { Search, Truck, DollarSign, TrendingUp, Calendar, Eye, MoreVertical } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316']

export default function TruckCostsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTrucks = truckCosts.filter(truck =>
    truck.truckNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalYearlyCost = truckCosts.reduce((sum, t) => sum + t.yearlyCost, 0)
  const totalMonthlyCost = truckCosts.reduce((sum, t) => sum + t.monthlyCost, 0)
  const avgCostPerTruck = Math.round(totalYearlyCost / truckCosts.length)

  const topCostTrucks = [...truckCosts].sort((a, b) => b.yearlyCost - a.yearlyCost).slice(0, 5)
  const pieData = topCostTrucks.map((t, i) => ({
    name: t.truckNumber,
    value: t.yearlyCost,
    color: COLORS[i]
  }))

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent>
        <Header title="Truck Costs" subtitle="Individual truck expense tracking" />
        
        <main className="p-6">
          {/* Summary Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-card rounded-xl p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Total Trucks</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{truckCosts.length}</p>
            </div>

            <div className="glass-card rounded-xl p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <DollarSign className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-sm text-muted-foreground">Monthly Total</span>
              </div>
              <p className="text-3xl font-bold text-foreground">${totalMonthlyCost.toLocaleString()}</p>
            </div>

            <div className="glass-card rounded-xl p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                </div>
                <span className="text-sm text-muted-foreground">Yearly Total</span>
              </div>
              <p className="text-3xl font-bold text-foreground">${totalYearlyCost.toLocaleString()}</p>
            </div>

            <div className="glass-card rounded-xl p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                <span className="text-sm text-muted-foreground">Avg/Truck (Yearly)</span>
              </div>
              <p className="text-3xl font-bold text-foreground">${avgCostPerTruck.toLocaleString()}</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            {/* Bar Chart */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Yearly Cost by Truck</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={truckCosts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="truckNumber" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v/1000}K`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Yearly Cost']}
                    />
                    <Bar dataKey="yearlyCost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Top 5 Expensive Trucks</h3>
              <div className="flex h-[250px] items-center">
                <div className="h-full w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-sm text-foreground">{item.name}</span>
                      <span className="ml-auto text-sm text-muted-foreground">${(item.value / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="glass-card mb-6 rounded-xl p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search truck number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Truck Costs Table */}
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Truck #</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Monthly Cost</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Yearly Cost</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Monthly Avg</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Last Expense</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrucks.map((truck) => (
                    <tr key={truck.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground">
                        {truck.truckNumber}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                        ${truck.monthlyCost.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-foreground">
                        ${truck.yearlyCost.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                        ${truck.monthlyAvg.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                        {truck.lastExpenseDate}
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
          </div>
        </main>
      </MainContent>
    </div>
  )
}
