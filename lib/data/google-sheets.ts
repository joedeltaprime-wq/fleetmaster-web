import 'server-only'
import { cache } from 'react'
import type { TireEvent, Unit } from './types'
import { positionsFor } from './positions'
import { createGoogleSheetsAccessToken, type GoogleServiceAccount } from './google-sheets-token'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '1B_WlCQVIgl5p1UvxMJU9lO10G1NEE2s2K91Y-ZTrM98'
type Account = GoogleServiceAccount
type Row = (string | number)[]

export function liveConfigured() { return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64 || (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY)) }
function credentials(): Account {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64) {
    const a = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64, 'base64').toString('utf8')) as Account
    if (!a.private_key || !a.client_email) throw new Error('Invalid Google service account')
    return a
  }
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) throw new Error('Missing Google service account credentials')
  return {client_email:process.env.GOOGLE_CLIENT_EMAIL,private_key:process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g,'\n')}
}
const token = cache(async () => createGoogleSheetsAccessToken(credentials()))
const sheetRows=async (sheet:string,lastCol:string): Promise<Row[]> => {
  const range=`'${sheet.replace(/'/g,"''")}'!A2:${lastCol}1008`
  const url=`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(SPREADSHEET_ID)}/values/${encodeURIComponent(range)}?valueRenderOption=FORMATTED_VALUE`
  const response=await fetch(url,{headers:{Authorization:`Bearer ${await token()}`},next:{revalidate:300}})
  if (!response.ok) throw new Error(`Google Sheets ${sheet} failed (${response.status})`)
  return ((await response.json()).values||[]) as Row[]
}
const parsedMoney=(x:unknown)=>{const n=Number(String(x??'').replace(/[$,\s]/g,''));return Number.isFinite(n)?n:0}
const dateISO=(value:unknown) => {
  const s=String(value??'').trim()
  const m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if(m) return `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`
  if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s
  return ''
}
const numTires=(cell:unknown)=>{
  const s=String(cell??'').trim().toUpperCase()
  if (['YES','Y','TRUE','X','✓'].includes(s)) return 1
  const n=Number(s)
  return Number.isInteger(n)&&n>0&&n<30?n:0
}
/** A row starts at A2. Each position is mapped via the real sheet column, not by an assumed offset. */
function mapEvents(rows:Row[],type:'truck'|'trailer'):TireEvent[]{
  const truck=type==='truck'
  const dateIndex=truck?16:13, costIndex=truck?15:12, commentIndex=truck?17:14
  const columnIndex=(column:string)=>column.charCodeAt(0)-'A'.charCodeAt(0)
  const positionColumns=positionsFor(type)
  return rows.flatMap((row,index)=>{
    const unitNumber=String(row[1]??'').trim(),date=dateISO(row[dateIndex])
    // Skip headers / incomplete records. Never fabricate dates or quantities.
    if(!unitNumber||!date)return []
    const positions=positionColumns.flatMap((p)=>Array(numTires(row[columnIndex(p.column)])).fill(p.id) as string[])
    const comments=String(row[commentIndex]??'').trim()
    return [{
      id:`${type}-${index+2}`, date, unitId:`${type}-${unitNumber}`,
      unitType:type, unitNumber, positions, quantity:positions.length,
      cost:parsedMoney(row[costIndex]), reason:comments || 'Unspecified',
      driver:String(row[2]??'').trim(), vendor:'', comments,
    }]
  })
}
export const getLiveData = cache(async () => {
  const [truck,trailer]=await Promise.all([sheetRows('Truck_Tire_Map','R'),sheetRows('Trailer_Tire_Map','O')])
  const events=[...mapEvents(truck,'truck'),...mapEvents(trailer,'trailer')]
  const names=new Map<string,Unit>()
  for(const e of events)if(!names.has(e.unitId))names.set(e.unitId,{id:e.unitId,number:e.unitNumber,type:e.unitType,label:`${e.unitType==='truck'?'Truck':'Trailer'} #${e.unitNumber}`,make:'',year:0,terminal:''})
  return {units:[...names.values()],events}
})
