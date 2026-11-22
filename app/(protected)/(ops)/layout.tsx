export const dynamic = 'force-dynamic'

import { AppShell } from '@/components/shell/app-shell'
import { dataSource } from '@/lib/data/source'
import { requirePageUser } from '@/lib/auth/guards'

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  await requirePageUser()
  const [meta, units] = await Promise.all([dataSource.getMeta(), dataSource.getUnits()])
  return (
    <AppShell meta={meta} units={units}>
      {children}
    </AppShell>
  )
}
