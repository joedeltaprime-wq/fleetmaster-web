export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { TireDashboard } from '@/components/tires/tire-dashboard'
import { dataSource } from '@/lib/data/source'

export const metadata: Metadata = { title: 'Tire Intelligence' }

export default async function TiresPage() {
  const [meta, events] = await Promise.all([dataSource.getMeta(), dataSource.getTireEvents()])
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))
  return <TireDashboard events={sorted} meta={meta} />
}
