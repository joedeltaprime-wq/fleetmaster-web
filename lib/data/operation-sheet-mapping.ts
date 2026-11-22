export interface OperationMetrics {
  totalTrucks: number
  activeTrucks: number
  needDriverTrucks: number
  homeTime: number | null
}

type KnownStatus = 'ON DUTY' | 'NEED A DRIVER'

function cellText(row: readonly unknown[] | undefined, index: number): string {
  const value = row?.[index]
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''
}

function parseHomeTime(value: string): number | null {
  const match = /^HOME TIME:\s*(\d+)$/i.exec(value)
  if (!match) return null
  const count = Number(match[1])
  return Number.isSafeInteger(count) ? count : null
}

export function parseOperationSheetRows(
  homeTimeCell: unknown,
  rows: readonly (readonly unknown[])[],
): OperationMetrics {
  const homeTime = parseHomeTime(cellText([homeTimeCell], 0))
  const trucks = new Map<string, KnownStatus>()

  for (const row of rows) {
    const truckUnit = cellText(row, 0)
    const rawStatus = cellText(row, 1)
    if (!truckUnit && !rawStatus) continue
    if (!truckUnit || !rawStatus) {
      throw new Error('OPERATION contains a truck row without both Truck Unit and Status values')
    }

    const status = rawStatus.replace(/\s+/g, ' ').toUpperCase()
    if (status !== 'ON DUTY' && status !== 'NEED A DRIVER') {
      throw new Error('OPERATION contains an unmapped truck status; refusing to calculate fleet metrics')
    }

    const truckKey = truckUnit.toUpperCase()
    const previousStatus = trucks.get(truckKey)
    if (previousStatus && previousStatus !== status) {
      throw new Error('OPERATION contains conflicting statuses for a Truck Unit; refusing to double-count it')
    }
    trucks.set(truckKey, status)
  }

  const statuses = [...trucks.values()]
  return {
    totalTrucks: trucks.size,
    activeTrucks: statuses.filter(status => status === 'ON DUTY').length,
    needDriverTrucks: statuses.filter(status => status === 'NEED A DRIVER').length,
    homeTime,
  }
}
