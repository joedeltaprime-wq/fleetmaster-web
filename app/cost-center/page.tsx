'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MainContent } from '@/components/dashboard/main-content'
import { truckCosts, kpiData } from '@/lib/fleet-data'
import { DollarSign, TrendingUp, Clock, Truck } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const monthlyData = [
  { month: 'Sep', cost: 245000 },
  { month: 'Oct', cost: 268000 },
  { month: 'Nov', cost: 252000 },
  { month: 'Dec', cost: 298000 },
  { month: 'Jan', cost: 275000 },
  { month: 'Feb', cost: 285400 },
]

const topExpensiveTrucks = truckCosts.sort((a, b) => b.yearlyCost - a.yearlyCost).slice(0, 5)

export default function CostCenterPage() {
  const dailyAverage = Math.round(kpiData.monthlyCost / 30)
  const hourlyExpense = Math.round(kpiData.monthlyCost / 720)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent>
        <Header title="Cost Center" subtitle="Fleet expense analytics and tracking" />
        
        <main className="p-6">
          {/* Summary Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-card rounded-xl p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Monthly Total</span>
              </div>
              <p className="text-3xl font-bold text-foreground">${kpiData.monthlyCost.toLocaleString()}</p>
              <p className="mt-1 text-xs text-accent">+4.5% vs last month</p>
            </div>

            <div className="glass-card rounded-xl p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-sm text-muted-foreground">Daily Average</span>
              </div>
              <p className="text-3xl font-bold text-foreground">${dailyAverage.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">Based on 30-day period</p>
            </div>

            <div className="glass-card rounded-xl p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                  <Clock className="h-5 w-5 text-orange-400" />
                </div>
                <span className="text-sm text-muted-foreground">Hourly Expense</span>
              </div>
              <p className="text-3xl font-bold text-foreground">${hourlyExpense}</p>
              <p className="mt-1 text-xs text-muted-foreground">24/7 operations</p>
            </div>

            <div className="glass-card rounded-xl p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                  <Truck className="h-5 w-5 text-purple-400" />
                </div>
                <span className="text-sm text-muted-foreground">Cost Per Truck</span>
              </div>
              <p className="text-3xl font-bold text-foreground">${Math.round(kpiData.monthlyCost / kpiData.totalTrucks).toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">Monthly average</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            {/* Monthly Trend Chart */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Monthly Cost Trend</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v/1000}K`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
                    />
                    <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Expensive Trucks */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Top Expensive Trucks</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topExpensiveTrucks} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v/1000}K`} />
                    <YAxis type="category" dataKey="truckNumber" stroke="#64748b" fontSize={12} width={60} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Yearly Cost']}
                    />
                    <Bar dataKey="yearlyCost" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Truck Costs Table */}
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="border-b border-border bg-secondary/30 px-5 py-4">
              <h3 className="text-lg font-semibold text-foreground">Truck Cost Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Truck #</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Monthly Cost</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Yearly Cost</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Monthly Avg</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Last Expense</th>
                  </tr>
                </thead>
                <tbody>
                  {truckCosts.map((truck) => (
                    <tr key={truck.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground">{truck.truckNumber}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">${truck.monthlyCost.toLocaleString()}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-foreground">${truck.yearlyCost.toLocaleString()}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">${truck.monthlyAvg.toLocaleString()}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">{truck.lastExpenseDate}</td>
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
