export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { UnitDirectory } from '@/components/units/unit-directory'
import { unitSummaries } from '@/lib/analytics'
import { dataSource } from '@/lib/data/source'

export const metadata: Metadata = { title: 'Unit History' }

export default async function UnitsPage() {
  const [units, events, meta] = await Promise.all([dataSource.getUnits(), dataSource.getTireEvents(), dataSource.getMeta()])
  const summaries = unitSummaries(units, events, meta.asOf)
  return <UnitDirectory summaries={summaries} asOf={meta.asOf} isLive={meta.source === 'google-sheets'} />
}
