/**
 * Column contract for the Google Sheets source of truth.
 * A future server-side adapter (e.g. via Cloudflare Worker) maps rows using
 * this schema into `TireEvent` records. Credentials never reach the browser.
 * Position column → position mapping should be confirmed against the live sheet.
 */
export const SHEET_SCHEMA = {
  Truck_Tire_Map: {
    unitNumber: 'B',
    positions: { from: 'D', to: 'O' },
    cost: 'P',
    date: 'Q',
    comments: 'R',
  },
  Trailer_Tire_Map: {
    unitNumber: 'B',
    positions: { from: 'D', to: 'L' },
    cost: 'M',
    date: 'N',
    comments: 'O',
  },
  My_Daily_Mistakes: {},
} as const
