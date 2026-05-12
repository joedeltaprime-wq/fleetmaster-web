'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MainContent } from '@/components/dashboard/main-content'
import { trailerCosts, kpiData } from '@/lib/fleet-data'
import { Search, Container, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function TrailerCostsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTrailers = trailerCosts.filter(trailer =>
    trailer.trailerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trailer.comment.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalYearlyCost = trailerCosts.reduce((sum, t) => sum + t.yearlyCost, 0)
  const avgMonthlyCost = Math.round(trailerCosts.reduce((sum, t) => sum + t.monthlyAvg, 0) / trailerCosts.length)

  const chartData = trailerCosts.map(t => ({
    trailer: t.trailerNumber,
    cost: t.yearlyCost
  }))

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent>
        <Header title="Trailer Costs" subtitle="Trailer expense tracking and analytics" />
        
        <main className="p-6">
          {/* Summary Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-card rounded-xl p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <Container className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Total Trailers</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{trailerCosts.length}</p>
            </div>

            <div className="glass-card rounded-xl p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <DollarSign className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-sm text-muted-foreground">Monthly Total</span>
              </div>
              <p className="text-3xl font-bold text-foreground">${kpiData.trailerCost.toLocaleString()}</p>
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
                <span className="text-sm text-muted-foreground">Avg Monthly/Trailer</span>
              </div>
              <p className="text-3xl font-bold text-foreground">${avgMonthlyCost}</p>
            </div>
          </div>

          {/* Cost Chart */}
          <div className="glass-card mb-6 rounded-xl p-5">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Yearly Cost by Trailer</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="trailer" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v/1000}K`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Yearly Cost']}
                  />
                  <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Search */}
          <div className="glass-card mb-6 rounded-xl p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search trailer number, comments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Trailer Costs Table */}
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Trailer #</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Yearly Cost</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Monthly Avg</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Last Expense</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrailers.map((trailer) => (
                    <tr key={trailer.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground">
                        {trailer.trailerNumber}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-foreground">
                        ${trailer.yearlyCost.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                        ${trailer.monthlyAvg.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                        {trailer.lastExpenseDate}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {trailer.comment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border bg-secondary/30 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Showing {filteredTrailers.length} of {trailerCosts.length} trailers
              </p>
            </div>
          </div>
        </main>
      </MainContent>
    </div>
  )
}
