import type { UnitType } from './types'

/** Actual sheet column mapping, verified against the Google Sheets header row (row 1). */
export interface TirePosition {
  id: string
  label: string
  short: string
  column: string
  group: string
}

export const TRUCK_POSITIONS: TirePosition[] = [
  { id: 'S-L', label: 'Steer Left (STL)', short: 'STL', column: 'D', group: 'Steer' },
  { id: 'S-R', label: 'Steer Right (STR)', short: 'STR', column: 'E', group: 'Steer' },
  { id: 'T-UNK-F', label: 'Unknown truck position (F)', short: 'Unknown F', column: 'F', group: 'Unknown' },
  { id: 'D1-LO', label: 'Drive Front Left Outer (LFO)', short: 'LFO', column: 'G', group: 'Drive 1' },
  { id: 'D1-LI', label: 'Drive Front Left Inner (LFI)', short: 'LFI', column: 'H', group: 'Drive 1' },
  { id: 'D1-RI', label: 'Drive Front Right Inner (RFI)', short: 'RFI', column: 'I', group: 'Drive 1' },
  { id: 'D1-RO', label: 'Drive Front Right Outer (RFO)', short: 'RFO', column: 'J', group: 'Drive 1' },
  { id: 'D2-LO', label: 'Drive Rear Left Outer (LRO)', short: 'LRO', column: 'K', group: 'Drive 2' },
  { id: 'D2-LI', label: 'Drive Rear Left Inner (LRI)', short: 'LRI', column: 'L', group: 'Drive 2' },
  { id: 'D2-RI', label: 'Drive Rear Right Inner (RRI)', short: 'RRI', column: 'M', group: 'Drive 2' },
  { id: 'D2-RO', label: 'Drive Rear Right Outer (RRO)', short: 'RRO', column: 'N', group: 'Drive 2' },
  { id: 'T-UNK-O', label: 'Unknown truck position (O)', short: 'Unknown O', column: 'O', group: 'Unknown' },
]

export const TRAILER_POSITIONS: TirePosition[] = [
  { id: 'A1-LO', label: 'Trailer Front Left Outer (LFO)', short: 'LFO', column: 'D', group: 'Axle 1' },
  { id: 'A1-LI', label: 'Trailer Front Left Inner (LFI)', short: 'LFI', column: 'E', group: 'Axle 1' },
  { id: 'A1-RI', label: 'Trailer Front Right Inner (RFI)', short: 'RFI', column: 'F', group: 'Axle 1' },
  { id: 'A1-RO', label: 'Trailer Front Right Outer (RFO)', short: 'RFO', column: 'G', group: 'Axle 1' },
  { id: 'A2-LO', label: 'Trailer Rear Left Outer (LRO)', short: 'LRO', column: 'H', group: 'Axle 2' },
  { id: 'A2-LI', label: 'Trailer Rear Left Inner (LRI)', short: 'LRI', column: 'I', group: 'Axle 2' },
  { id: 'A2-RI', label: 'Trailer Rear Right Inner (RRI)', short: 'RRI', column: 'J', group: 'Axle 2' },
  { id: 'A2-RO', label: 'Trailer Rear Right Outer (RRO)', short: 'RRO', column: 'K', group: 'Axle 2' },
  { id: 'R-UNK-L', label: 'Unknown trailer position (L)', short: 'Unknown L', column: 'L', group: 'Unknown' },
]

const ALL = [...TRUCK_POSITIONS, ...TRAILER_POSITIONS]
const BY_ID = new Map(ALL.map((p) => [p.id, p]))

export function positionsFor(type: UnitType) {
  return type === 'truck' ? TRUCK_POSITIONS : TRAILER_POSITIONS
}

export function positionLabel(id: string) {
  return BY_ID.get(id)?.label ?? id
}

export function positionShort(id: string) {
  return BY_ID.get(id)?.short ?? id
}
