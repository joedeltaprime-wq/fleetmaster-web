import 'server-only'
import {getLiveData, liveConfigured} from './google-sheets'
import type { DataMeta, TireEvent, Unit } from './types'

/**
 * Data access boundary. The UI only depends on this interface, so a future
 * authenticated Google Sheets / Cloudflare Worker adapter can be swapped in
 * here without touching any components.
 */
export interface FleetDataSource {
  getMeta(): Promise<DataMeta>
  getUnits(): Promise<Unit[]>
  getUnit(id: string): Promise<Unit | null>
  getTireEvents(filter?: { unitId?: string }): Promise<TireEvent[]>
}

const emptySource: FleetDataSource = {
  async getMeta() { return {source:'sample',label:'Tire data not connected',asOf:new Date().toISOString().slice(0,10),description:'Configure Google Sheets to load tire records.'} },
  async getUnits() { return [] },
  async getUnit() { return null },
  async getTireEvents() { return [] },
}

const liveSource: FleetDataSource = {
  async getMeta() { return {source:'google-sheets',label:'Tire data · Google Sheets',asOf:new Date().toISOString().slice(0,10),description:'Read-only data from Truck_Tire_Map and Trailer_Tire_Map.'} },
  async getUnits() { return (await getLiveData()).units },
  async getUnit(id) {return (await getLiveData()).units.find(u=>u.id===id) ?? null},
  async getTireEvents(filter) {const rows=(await getLiveData()).events;return filter?.unitId ? rows.filter(e=>e.unitId===filter.unitId) : rows},
}
export const dataSource: FleetDataSource = liveConfigured() ? liveSource : emptySource
