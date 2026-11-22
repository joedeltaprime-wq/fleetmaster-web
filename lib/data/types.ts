export type UnitType = 'truck' | 'trailer'

export interface Unit {
  id: string
  number: string
  type: UnitType
  label: string
  make: string
  year: number
  terminal: string
}

export interface TireEvent {
  id: string
  /** ISO date, YYYY-MM-DD */
  date: string
  unitId: string
  unitType: UnitType
  unitNumber: string
  /** Position ids, one per tire replaced */
  positions: string[]
  quantity: number
  cost: number
  reason: string
  driver: string
  vendor: string
  comments: string
}

export interface DataMeta {
  source: 'sample' | 'google-sheets'
  label: string
  asOf: string
  description: string
}

export interface UnitSummary {
  unit: Unit
  lifetimeCost: number
  ytdCost: number
  tires: number
  events: number
  lastDate: string | null
  monthly: number[]
  recurring: boolean
}
