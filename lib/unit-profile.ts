import { monthKey, monthKeys, pctChange, positionStats, reasonStats, shiftMonth, summarize, type PositionStat, type ReasonStat, type Summary } from './analytics'
import { positionLabel } from './data/positions'
import type { TireEvent, Unit } from './data/types'
import { daysBetween, fmtCurrency } from './format'

export interface UnitProfile {
  unit: Unit
  events: TireEvent[]
  lifetime: Summary
  ytd: Summary
  ytdPrev: Summary
  rank: number
  fleetSize: number
  fleetAvgPerTire: number
  fleetAvgLifetime: number
  monthly: { key: string; cost: number; tires: number; fleetAvg: number }[]
  positions: PositionStat[]
  fleetPositionAvg: Record<string, number>
  reasons: ReasonStat[]
  daysSinceLast: number | null
  avgInterval: number | null
  insights: { tone: 'negative' | 'warning' | 'positive' | 'neutral'; title: string; detail: string }[]
  prevId: string | null
  nextId: string | null
}

export function buildUnitProfile(unit: Unit, units: Unit[], allEvents: TireEvent[], asOf: string): UnitProfile {
  const peers = units.filter((u) => u.type === unit.type)
  const fleetEvents = allEvents.filter((e) => e.unitType === unit.type)
  const events = fleetEvents.filter((e) => e.unitId === unit.id).sort((a, b) => b.date.localeCompare(a.date))
  const n = peers.length || 1

  const year = Number(asOf.slice(0, 4))
  const md = asOf.slice(4)
  const lifetime = summarize(events)
  const ytd = summarize(events.filter((e) => e.date >= `${year}-01-01` && e.date <= asOf))
  const ytdPrev = summarize(events.filter((e) => e.date >= `${year - 1}-01-01` && e.date <= `${year - 1}${md}`))

  const costByUnit = new Map<string, number>(peers.map((p) => [p.id, 0]))
  for (const e of fleetEvents) costByUnit.set(e.unitId, (costByUnit.get(e.unitId) ?? 0) + e.cost)
  const ranked = [...costByUnit.entries()].sort((a, b) => b[1] - a[1])
  const rank = ranked.findIndex(([id]) => id === unit.id) + 1
  const fleet = summarize(fleetEvents)

  const keys = monthKeys(`${shiftMonth(monthKey(asOf), -23)}-01`, asOf)
  const idx = new Map(keys.map((k, i) => [k, i]))
  const monthly = keys.map((key) => ({ key, cost: 0, tires: 0, fleetAvg: 0 }))
  for (const e of fleetEvents) {
    const i = idx.get(monthKey(e.date))
    if (i === undefined) continue
    monthly[i].fleetAvg += e.cost / n
    if (e.unitId === unit.id) {
      monthly[i].cost += e.cost
      monthly[i].tires += e.quantity
    }
  }

  const positions = positionStats(events, unit.type)
  const fleetPositions = positionStats(fleetEvents, unit.type)
  const fleetPositionAvg = Object.fromEntries(fleetPositions.map((p) => [p.id, p.tires / n]))
  const reasons = reasonStats(events)

  const daysSinceLast = events[0] ? daysBetween(events[0].date, asOf) : null
  const avgInterval = events.length > 1 ? daysBetween(events[events.length - 1].date, events[0].date) / (events.length - 1) : null

  const insights: UnitProfile['insights'] = []
  const costVsFleet = pctChange(lifetime.total, fleet.total / n)
  if (costVsFleet !== null) {
    insights.push({
      tone: costVsFleet > 0.25 ? 'negative' : costVsFleet < -0.15 ? 'positive' : 'neutral',
      title: `Ranks #${rank} of ${peers.length} ${unit.type}s by tire spend`,
      detail: `${fmtCurrency(lifetime.total)} lifetime, ${Math.abs(Math.round(costVsFleet * 100))}% ${costVsFleet >= 0 ? 'above' : 'below'} the ${unit.type} average of ${fmtCurrency(fleet.total / n)}.`,
    })
  }
  const hot = [...positions]
    .filter((p) => p.tires >= 3)
    .map((p) => ({ ...p, ratio: p.tires / Math.max(0.1, fleetPositionAvg[p.id] ?? 0) }))
    .sort((a, b) => b.ratio - a.ratio)[0]
  if (hot && hot.ratio >= 1.5) {
    insights.push({
      tone: 'negative',
      title: `${positionLabel(hot.id)} replaced ${hot.tires}×`,
      detail: `${hot.ratio.toFixed(1)}× the fleet average for this position. Most often: ${hot.topReason?.toLowerCase() ?? 'unspecified'}.`,
    })
  }
  const topReason = reasons[0]
  if (topReason && topReason.events >= 3) {
    insights.push({
      tone: 'warning',
      title: `Recurring: ${topReason.reason}`,
      detail: `${topReason.events} of ${lifetime.events} replacement events (${Math.round((topReason.events / Math.max(1, lifetime.events)) * 100)}%), costing ${fmtCurrency(topReason.cost)}.`,
    })
  }
  const cptVsFleet = pctChange(lifetime.avgPerTire, fleet.avgPerTire)
  if (cptVsFleet !== null && Math.abs(cptVsFleet) >= 0.05) {
    insights.push({
      tone: cptVsFleet > 0 ? 'warning' : 'positive',
      title: `Cost per tire ${cptVsFleet > 0 ? 'above' : 'below'} fleet`,
      detail: `${fmtCurrency(lifetime.avgPerTire, { cents: true })} vs ${fmtCurrency(fleet.avgPerTire, { cents: true })} fleet average for ${unit.type}s.`,
    })
  }

  const order = peers.findIndex((p) => p.id === unit.id)
  return {
    unit,
    events,
    lifetime,
    ytd,
    ytdPrev,
    rank,
    fleetSize: peers.length,
    fleetAvgPerTire: fleet.avgPerTire,
    fleetAvgLifetime: fleet.total / n,
    monthly,
    positions,
    fleetPositionAvg,
    reasons,
    daysSinceLast,
    avgInterval,
    insights: insights.slice(0, 4),
    prevId: order > 0 ? peers[order - 1].id : null,
    nextId: order >= 0 && order < peers.length - 1 ? peers[order + 1].id : null,
  }
}
