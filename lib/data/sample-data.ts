import type { TireEvent, Unit, UnitType } from './types'

/**
 * SAMPLE DATA — deterministically generated for the prototype.
 * Not real company data. Replace via `lib/data/source.ts`.
 */
export const SAMPLE_AS_OF = '2026-10-21'

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20261021)
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]
const between = (min: number, max: number) => min + rand() * (max - min)

function weighted<T>(items: readonly (readonly [T, number])[]): T {
  const total = items.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [v, w] of items) {
    r -= w
    if (r <= 0) return v
  }
  return items[items.length - 1][0]
}

const DRIVERS = [
  'Marcus Hale', 'Dana Whitfield', 'Luis Romero', 'Tamika Brooks', 'Greg Olsen',
  'Andre Coleman', 'Sofia Petrova', 'Raymond Diaz', 'Kevin Tran', 'Brenda Mills',
  'Jamal Carter', 'Erik Lindqvist', 'Patricia Nunez', 'Victor Osei', 'Hannah Price',
  'Derek Simmons', 'Omar Haddad', 'Chris Delaney', 'Yolanda Reed', 'Tomasz Nowak',
  'Isaac Moreno', 'Ruth Bishop', 'Nate Kowalski', 'Gloria Fuentes', 'Samuel Ortiz',
]

const VENDORS = [
  ["Love's Truck Care · Amarillo, TX", 18],
  ['TA Truck Service · Joplin, MO', 14],
  ['Southern Tire Mart · Memphis, TN', 16],
  ['Pilot Flying J · Effingham, IL', 10],
  ['Bridgestone Commercial · Dallas, TX', 12],
  ['Goodyear Fleet HQ · Roadside', 11],
  ['In-house Shop · Dallas Terminal', 19],
] as const

const TRUCK_MAKES = ['Freightliner Cascadia', 'Volvo VNL 860', 'Kenworth T680', 'Peterbilt 579']
const TRAILER_MAKES = ['Utility 4000D-X', 'Great Dane Champion', 'Wabash DuraPlate']
const TERMINALS = ['Dallas, TX', 'Joplin, MO', 'Atlanta, GA']

const REASONS = [
  ['Tread wear', 26],
  ['Puncture / flat', 20],
  ['Irregular wear', 12],
  ['Sidewall damage', 10],
  ['Road hazard', 9],
  ['Blowout', 8],
  ['DOT inspection', 8],
  ['Valve stem failure', 4],
] as const

const COMMENTS: Record<string, string[]> = {
  'Tread wear': ['Tread at 3/32" — replaced at PM service', 'Worn below spec on scheduled inspection', 'Replaced during PM-B service'],
  'Puncture / flat': ['Nail in tread, not repairable', 'Slow leak — screw near shoulder', 'TPMS low-pressure alert, tire unrepairable'],
  'Irregular wear': ['Feathering on inner edge — alignment check requested', 'Cupping observed, shocks inspected', 'Uneven wear pattern, recurring on this position'],
  'Sidewall damage': ['Curb strike at customer dock', 'Sidewall bulge found on pre-trip', 'Cut in sidewall from debris'],
  'Road hazard': ['Debris on I-40, tire cut', 'Pothole impact on I-44', 'Metal debris in road'],
  Blowout: ['Blowout on highway — roadside service dispatched', 'Heat-related failure, casing destroyed', 'Tread separation, roadside replacement'],
  'DOT inspection': ['Flagged during roadside inspection', 'Replaced to clear DOT write-up', 'Tread depth violation at weigh station'],
  'Valve stem failure': ['Valve stem cracked, tire lost pressure', 'Stem leak — replaced with tire'],
}

const ROADSIDE = new Set(['Puncture / flat', 'Blowout', 'Road hazard', 'Sidewall damage'])

const TRUCK_SINGLE = [
  ['S-L', 15], ['S-R', 15], ['D1-LO', 9], ['D1-LI', 7], ['D1-RI', 7], ['D1-RO', 9],
  ['D2-LO', 9], ['D2-LI', 7], ['D2-RI', 7], ['D2-RO', 9], ['T-SP', 2], ['T-OT', 1],
] as const
const TRUCK_PAIRS = [['S-L', 'S-R'], ['D1-LO', 'D1-LI'], ['D1-RI', 'D1-RO'], ['D2-LO', 'D2-LI'], ['D2-RI', 'D2-RO']]
const TRUCK_QUADS = [['D1-LO', 'D1-LI', 'D1-RI', 'D1-RO'], ['D2-LO', 'D2-LI', 'D2-RI', 'D2-RO']]

const TRAILER_SINGLE = [
  ['A1-LO', 12], ['A1-LI', 10], ['A1-RI', 10], ['A1-RO', 12],
  ['A2-LO', 14], ['A2-LI', 11], ['A2-RI', 11], ['A2-RO', 14], ['R-SP', 2],
] as const
const TRAILER_PAIRS = [['A1-LO', 'A1-LI'], ['A1-RI', 'A1-RO'], ['A2-LO', 'A2-LI'], ['A2-RI', 'A2-RO']]
const TRAILER_QUADS = [['A1-LO', 'A1-LI', 'A1-RI', 'A1-RO'], ['A2-LO', 'A2-LI', 'A2-RI', 'A2-RO']]

interface UnitProfile {
  unit: Unit
  propensity: number
  driver: string
  pattern?: { reason: string; positions: string[]; chance: number }
}

function buildUnits(): UnitProfile[] {
  const profiles: UnitProfile[] = []
  const hot: Record<string, Partial<UnitProfile>> = {
    '3004': { propensity: 3.2, pattern: { reason: 'Irregular wear', positions: ['S-L', 'S-R'], chance: 0.5 } },
    '3017': { propensity: 2.3, pattern: { reason: 'Puncture / flat', positions: ['D2-RO'], chance: 0.35 } },
    '3031': { propensity: 2.0 },
    H16840: { propensity: 3.0, pattern: { reason: 'Puncture / flat', positions: ['A2-LO', 'A2-RO'], chance: 0.5 } },
    H16812: { propensity: 2.2, pattern: { reason: 'Irregular wear', positions: ['A1-RO'], chance: 0.4 } },
  }

  for (let n = 3001; n <= 3042; n++) {
    const number = String(n)
    profiles.push({
      unit: {
        id: `truck-${number}`,
        number,
        type: 'truck',
        label: `Truck #${number}`,
        make: pick(TRUCK_MAKES),
        year: 2020 + Math.floor(rand() * 5),
        terminal: pick(TERMINALS),
      },
      propensity: 0.55 + rand() * 0.9,
      driver: DRIVERS[(n - 3001) % DRIVERS.length],
      ...hot[number],
    })
  }

  for (let n = 1; n <= 45; n++) {
    if (n % 5 === 3) continue
    const number = `H168${String(n).padStart(2, '0')}`
    profiles.push({
      unit: {
        id: `trailer-${number}`,
        number,
        type: 'trailer',
        label: `Trailer ${number}`,
        make: pick(TRAILER_MAKES),
        year: 2018 + Math.floor(rand() * 6),
        terminal: pick(TERMINALS),
      },
      propensity: 0.55 + rand() * 0.9,
      driver: '',
      ...hot[number],
    })
  }
  return profiles
}

function choosePositions(type: UnitType, qty: number): string[] {
  if (type === 'truck') {
    if (qty === 1) return [weighted(TRUCK_SINGLE)]
    if (qty === 2) return [...pick(TRUCK_PAIRS)]
    return [...pick(TRUCK_QUADS)]
  }
  if (qty === 1) return [weighted(TRAILER_SINGLE)]
  if (qty === 2) return [...pick(TRAILER_PAIRS)]
  return [...pick(TRAILER_QUADS)]
}

function tirePrice(position: string, inflation: number) {
  if (position.startsWith('S-')) return between(545, 665) * inflation
  if (position.startsWith('D') || position.startsWith('T-')) return between(425, 520) * inflation
  return between(335, 425) * inflation
}

const SEASONAL = [0.9, 0.85, 0.95, 1, 1.05, 1.15, 1.25, 1.2, 1.05, 1, 0.95, 1]
const INFLATION: Record<number, number> = { 2024: 1, 2025: 1.045, 2026: 1.085 }

function generate() {
  const profiles = buildUnits()
  const trucks = profiles.filter((p) => p.unit.type === 'truck')
  const trailers = profiles.filter((p) => p.unit.type === 'trailer')
  const events: TireEvent[] = []
  let seq = 1

  for (let year = 2024; year <= 2026; year++) {
    for (let month = 0; month < 12; month++) {
      if (year === 2026 && month > 9) break
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
      const maxDay = year === 2026 && month === 9 ? 21 : daysInMonth
      const growth = 1 + (year - 2024) * 0.05
      const scale = SEASONAL[month] * growth * (maxDay / daysInMonth)

      for (const [pool, base] of [[trucks, 21], [trailers, 16]] as const) {
        const count = Math.round(base * scale * between(0.8, 1.2))
        const poolWeights = pool.map((p) => [p, p.propensity] as const)
        for (let i = 0; i < count; i++) {
          const profile = weighted(poolWeights)
          const { unit } = profile
          const day = 1 + Math.floor(rand() * maxDay)
          const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

          let reason: string
          let positions: string[]
          if (profile.pattern && rand() < profile.pattern.chance) {
            reason = profile.pattern.reason
            positions = [...profile.pattern.positions]
          } else {
            const qty = weighted([[1, 58], [2, 30], [4, 12]] as const)
            positions = choosePositions(unit.type, qty)
            reason = qty === 4 ? weighted([['Tread wear', 70], ['DOT inspection', 30]] as const) : weighted(REASONS)
          }

          const inflation = INFLATION[year]
          const tireCost = positions.reduce((s, p) => s + tirePrice(p, inflation), 0)
          const fee = ROADSIDE.has(reason) ? between(120, 320) : between(35, 90)

          events.push({
            id: `TE-${year}${String(month + 1).padStart(2, '0')}-${String(seq++).padStart(4, '0')}`,
            date,
            unitId: unit.id,
            unitType: unit.type,
            unitNumber: unit.number,
            positions,
            quantity: positions.length,
            cost: Math.round((tireCost + fee) * 100) / 100,
            reason,
            driver: unit.type === 'truck' ? (rand() < 0.85 ? profile.driver : pick(DRIVERS)) : pick(DRIVERS),
            vendor: ROADSIDE.has(reason) ? weighted(VENDORS) : weighted([...VENDORS.slice(4), ['In-house Shop · Dallas Terminal', 30]] as const),
            comments: pick(COMMENTS[reason]),
          })
        }
      }
    }
  }

  events.sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date)))
  return { units: profiles.map((p) => p.unit), events }
}

const generated = generate()

export const SAMPLE_UNITS: Unit[] = generated.units
export const SAMPLE_EVENTS: TireEvent[] = generated.events
