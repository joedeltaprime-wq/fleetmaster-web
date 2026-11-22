import type { Metadata } from 'next'
import { AccessManagement } from '@/components/auth/access-management'
import { requirePageOwner } from '@/lib/auth/guards'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Access Management | OPS' }

export default async function AccessPage() {
  await requirePageOwner()
  return <AccessManagement />
}
