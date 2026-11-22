import { positionsFor } from './data/positions'
import type { TireEvent, Unit, UnitSummary, UnitType } from './data/types'

export type TypeFilter = 'all' | UnitType
export type PeriodPreset = 'ytd' | 'l12m' | 'prev-year' | 'all'

export interface Period {
  from: string
  to: string
  label: string
  prev?: { from: string; to: string; label: string }
}

export function monthKey(date: string) {
  return date.slice(0, 7)
}

export function shiftMonth(key: string, delta: number) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

function endOfMonth(key: string) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return `${key}-${String(d).padStart(2, '0')}`
}

export function monthKeys(from: string, to: string) {
  const keys: string[] = []
  let k = monthKey(from)
  const end = monthKey(to)
  while (k <= end) {
    keys.push(k)
    k = shiftMonth(k, 1)
  }
  return keys
}

export function resolvePeriod(preset: PeriodPreset, asOf: string, firstDate: string): Period {
  const year = Number(asOf.slice(0, 4))
  const md = asOf.slice(4)
  switch (preset) {
    case 'ytd':
      return {
        from: `${year}-01-01`,
        to: asOf,
        label: `YTD ${year}`,
        prev: { from: `${year - 1}-01-01`, to: `${year - 1}${md}`, label: `YTD ${year - 1}` },
      }
    case 'l12m': {
      const start = shiftMonth(monthKey(asOf), -11)
      const prevStart = shiftMonth(start, -12)
      return {
        from: `${start}-01`,
        to: asOf,
        label: 'Last 12 months',
        prev: { from: `${prevStart}-01`, to: `${year - 1}${md}`, label: 'prior 12 months' },
      }
    }
    case 'prev-year':
      return {
        from: `${year - 1}-01-01`,
        to: `${year - 1}-12-31`,
        label: `${year - 1}`,
        prev: { from: `${year - 2}-01-01`, to: `${year - 2}-12-31`, label: `${year - 2}` },
      }
    default:
      return { from: firstDate, to: asOf, label: 'All time' }
  }
}

export function filterEvents(events: TireEvent[], opts: { from?: string; to?: string; type?: TypeFilter }) {
  return events.filter(
    (e) =>
      (!opts.from || e.date >= opts.from) &&
      (!opts.to || e.date <= opts.to) &&
      (!opts.type || opts.type === 'all' || e.unitType === opts.type),
  )
}

export interface Summary {
  total: number
  truck: number
  trailer: number
  tires: number
  truckTires: number
  trailerTires: number
  events: number
  avgPerTire: number
}

export function summarize(events: TireEvent[]): Summary {
  const s = { total: 0, truck: 0, trailer: 0, tires: 0, truckTires: 0, trailerTires: 0, events: events.length, avgPerTire: 0 }
  for (const e of events) {
    s.total += e.cost
    s.tires += e.quantity
    if (e.unitType === 'truck') {
      s.truck += e.cost
      s.truckTires += e.quantity
    } else {
      s.trailer += e.cost
      s.trailerTires += e.quantity
    }
  }
  s.avgPerTire = s.tires ? s.total / s.tires : 0
  return s
}

export interface MonthRow {
  key: string
  truckCost: number
  trailerCost: number
  totalCost: number
  truckTires: number
  trailerTires: number
  tires: number
  events: number
  costPerTire: number
  truckCpt: number
  trailerCpt: number
}

export function monthlySeries(events: TireEvent[], from: string, to: string): MonthRow[] {
  const rows = new Map<string, MonthRow>(
    monthKeys(from, to).map((key) => [
      key,
      { key, truckCost: 0, trailerCost: 0, totalCost: 0, truckTires: 0, trailerTires: 0, tires: 0, events: 0, costPerTire: 0, truckCpt: 0, trailerCpt: 0 },
    ]),
  )
  for (const e of events) {
    const row = rows.get(monthKey(e.date))
    if (!row) continue
    row.events++
    row.totalCost += e.cost
    row.tires += e.quantity
    if (e.unitType === 'truck') {
      row.truckCost += e.cost
      row.truckTires += e.quantity
    } else {
      row.trailerCost += e.cost
      row.trailerTires += e.quantity
    }
  }
  for (const row of rows.values()) {
    row.costPerTire = row.tires ? row.totalCost / row.tires : 0
    row.truckCpt = row.truckTires ? row.truckCost / row.truckTires : 0
    row.trailerCpt = row.trailerTires ? row.trailerCost / row.trailerTires : 0
  }
  return [...rows.values()]
}

export function pctChange(current: number, previous: number): number | null {
  if (!previous) return null
  return (current - previous) / previous
}

export interface UnitRank {
  unitId: string
  unitNumber: string
  type: UnitType
  cost: number
  tires: number
  events: number
}

export function rankUnits(events: TireEvent[], type: UnitType, limit = 10): UnitRank[] {
  const map = new Map<string, UnitRank>()
  for (const e of events) {
    if (e.unitType !== type) continue
    const r = map.get(e.unitId) ?? { unitId: e.unitId, unitNumber: e.unitNumber, type, cost: 0, tires: 0, events: 0 }
    r.cost += e.cost
    r.tires += e.quantity
    r.events++
    map.set(e.unitId, r)
  }
  return [...map.values()].sort((a, b) => b.cost - a.cost).slice(0, limit)
}

export interface PositionStat {
  id: string
  tires: number
  cost: number
  topReason: string | null
}

export function positionStats(events: TireEvent[], type: UnitType): PositionStat[] {
  const stats = new Map(positionsFor(type).map((p) => [p.id, { id: p.id, tires: 0, cost: 0, reasons: new Map<string, number>() }]))
  for (const e of events) {
    if (e.unitType !== type) continue
    const share = e.quantity ? e.cost / e.quantity : 0
    for (const pos of e.positions) {
      const s = stats.get(pos)
      if (!s) continue
      s.tires++
      s.cost += share
      s.reasons.set(e.reason, (s.reasons.get(e.reason) ?? 0) + 1)
    }
  }
  return [...stats.values()].map((s) => ({
    id: s.id,
    tires: s.tires,
    cost: s.cost,
    topReason: [...s.reasons.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
  }))
}

export interface ReasonStat {
  reason: string
  events: number
  tires: number
  cost: number
}

export function reasonStats(events: TireEvent[]): ReasonStat[] {
  const map = new Map<string, ReasonStat>()
  for (const e of events) {
    const r = map.get(e.reason) ?? { reason: e.reason, events: 0, tires: 0, cost: 0 }
    r.events++
    r.tires += e.quantity
    r.cost += e.cost
    map.set(e.reason, r)
  }
  return [...map.values()].sort((a, b) => b.events - a.events)
}

export interface RecurringIssue {
  unitId: string
  unitNumber: string
  type: UnitType
  reason: string
  occurrences: number
  topPosition: string
  cost: number
  lastDate: string
}

export const RECURRING_MIN = 4

export function recurringIssues(events: TireEvent[], minOccurrences = RECURRING_MIN): RecurringIssue[] {
  const map = new Map<string, RecurringIssue & { positions: Map<string, number> }>()
  for (const e of events) {
    const key = `${e.unitId}|${e.reason}`
    const r =
      map.get(key) ??
      { unitId: e.unitId, unitNumber: e.unitNumber, type: e.unitType, reason: e.reason, occurrences: 0, topPosition: '', cost: 0, lastDate: e.date, positions: new Map() }
    r.occurrences++
    r.cost += e.cost
    if (e.date > r.lastDate) r.lastDate = e.date
    for (const p of e.positions) r.positions.set(p, (r.positions.get(p) ?? 0) + 1)
    map.set(key, r)
  }
  return [...map.values()]
    .filter((r) => r.occurrences >= minOccurrences)
    .map(({ positions, ...r }) => ({ ...r, topPosition: [...positions.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '' }))
    .sort((a, b) => b.occurrences - a.occurrences || b.cost - a.cost)
}

export function topPosition(events: TireEvent[]) {
  const counts = new Map<string, number>()
  for (const e of events) for (const p of e.positions) counts.set(p, (counts.get(p) ?? 0) + 1)
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  return top ? { id: top[0], count: top[1] } : null
}

export function unitSummaries(units: Unit[], events: TireEvent[], asOf: string): UnitSummary[] {
  const year = asOf.slice(0, 4)
  const months = monthKeys(`${shiftMonth(monthKey(asOf), -11)}-01`, asOf)
  const byUnit = new Map<string, TireEvent[]>()
  for (const e of events) {
    const list = byUnit.get(e.unitId) ?? []
    list.push(e)
    byUnit.set(e.unitId, list)
  }
  const windowStart = `${months[0]}-01`
  const recentEvents = events.filter((e) => e.date >= windowStart && e.date <= asOf)
  const recurringIds = new Set(recurringIssues(recentEvents, RECURRING_MIN).map((r) => r.unitId))
  return units.map((unit) => {
    const list = byUnit.get(unit.id) ?? []
    const monthly = months.map(() => 0)
    let lifetimeCost = 0
    let ytdCost = 0
    let tires = 0
    let lastDate: string | null = null
    for (const e of list) {
      lifetimeCost += e.cost
      tires += e.quantity
      if (e.date.startsWith(year)) ytdCost += e.cost
      if (!lastDate || e.date > lastDate) lastDate = e.date
      const idx = months.indexOf(monthKey(e.date))
      if (idx >= 0) monthly[idx] += e.cost
    }
    return { unit, lifetimeCost, ytdCost, tires, events: list.length, lastDate, monthly, recurring: recurringIds.has(unit.id) }
  })
}

export { endOfMonth }
