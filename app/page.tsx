import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { USAMap } from '@/components/dashboard/usa-map'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { TruckTable } from '@/components/dashboard/truck-table'
import { MainContent } from '@/components/dashboard/main-content'

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <MainContent>
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <main className="p-6">
          {/* KPI Cards */}
          <section className="mb-6">
            <KPICards />
          </section>

          {/* Map and Alerts */}
          <section className="mb-6 grid gap-6 lg:grid-cols-[1fr_350px]">
            <USAMap />
            <AlertsPanel />
          </section>

          {/* Truck Table */}
          <section>
            <TruckTable />
          </section>
        </main>
      </MainContent>
    </div>
  )
}
