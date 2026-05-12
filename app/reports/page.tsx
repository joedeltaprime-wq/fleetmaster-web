import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MainContent } from '@/components/dashboard/main-content'
import { FileText, Download, Calendar, TrendingUp, Truck, DollarSign, BarChart3 } from 'lucide-react'

const reports = [
  { id: '1', name: 'Monthly Fleet Summary', type: 'Operations', date: '2024-03-01', size: '2.4 MB' },
  { id: '2', name: 'Cost Analysis Report', type: 'Finance', date: '2024-03-01', size: '1.8 MB' },
  { id: '3', name: 'Driver Performance', type: 'Operations', date: '2024-02-28', size: '3.1 MB' },
  { id: '4', name: 'Maintenance Schedule', type: 'Maintenance', date: '2024-02-25', size: '1.2 MB' },
  { id: '5', name: 'Fuel Consumption Report', type: 'Finance', date: '2024-02-20', size: '890 KB' },
  { id: '6', name: 'Safety Compliance', type: 'Compliance', date: '2024-02-15', size: '2.1 MB' },
]

const quickReports = [
  { name: 'Fleet Status', icon: Truck, color: 'bg-blue-500/20 text-blue-400' },
  { name: 'Cost Summary', icon: DollarSign, color: 'bg-green-500/20 text-green-400' },
  { name: 'Performance', icon: TrendingUp, color: 'bg-purple-500/20 text-purple-400' },
  { name: 'Analytics', icon: BarChart3, color: 'bg-orange-500/20 text-orange-400' },
]

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent>
        <Header title="Reports" subtitle="Generate and download fleet reports" />
        
        <main className="p-6">
          {/* Quick Reports */}
          <div className="mb-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Reports</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickReports.map((report) => (
                <button
                  key={report.name}
                  className="glass-card flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-secondary/50"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${report.color}`}>
                    <report.icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{report.name}</p>
                    <p className="text-xs text-muted-foreground">Generate Now</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-5 py-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Reports</h3>
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <FileText className="h-4 w-4" />
                New Report
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Report Name</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Size</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium text-foreground">{report.name}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          {report.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {report.date}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                        {report.size}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <button className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                          <Download className="h-3 w-3" />
                          Download
                        </button>
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
