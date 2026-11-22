import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MainContent } from '@/components/dashboard/main-content'
import { USAMap } from '@/components/dashboard/usa-map'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'

export default function LiveMapPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent>
        <Header title="Live Map" subtitle="Real-time truck and shop locations" />
        
        <main className="p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_350px]" style={{ height: 'calc(100vh - 180px)' }}>
            <USAMap fullHeight />
            <AlertsPanel />
          </div>
        </main>
      </MainContent>
    </div>
  )
}
