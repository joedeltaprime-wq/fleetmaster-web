export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { UnitProfileView } from '@/components/units/unit-profile-view'
import { dataSource } from '@/lib/data/source'
import { buildUnitProfile } from '@/lib/unit-profile'

export async function generateMetadata({ params }: { params: Promise<{ unitId: string }> }): Promise<Metadata> {
  const { unitId } = await params
  const unit = await dataSource.getUnit(unitId)
  return { title: unit ? `${unit.label} · Unit History` : 'Unit not found' }
}

export default async function UnitPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params
  const [unit, units, events, meta] = await Promise.all([
    dataSource.getUnit(unitId),
    dataSource.getUnits(),
    dataSource.getTireEvents(),
    dataSource.getMeta(),
  ])
  if (!unit) notFound()
  const profile = buildUnitProfile(unit, units, events, meta.asOf)
  return <UnitProfileView profile={profile} units={units} asOf={meta.asOf} isLive={meta.source === 'google-sheets'} />
}
