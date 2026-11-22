import 'server-only'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { createGoogleSheetsAccessToken, type GoogleServiceAccount } from './google-sheets-token'
import { parseOperationSheetRows, type OperationMetrics } from './operation-sheet-mapping'

type GoogleSheetsBindings = {
  GOOGLE_SHEET_ID?: unknown
  GOOGLE_SERVICE_ACCOUNT_JSON_B64?: unknown
  GOOGLE_CLIENT_EMAIL?: unknown
  GOOGLE_PRIVATE_KEY?: unknown
}

export type OperationDashboardData =
  | { status: 'unconfigured' }
  | { status: 'ready'; metrics: OperationMetrics }

function bindingString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function serviceAccount(bindings: GoogleSheetsBindings): GoogleServiceAccount {
  const encoded = bindingString(bindings.GOOGLE_SERVICE_ACCOUNT_JSON_B64)
  if (encoded) {
    let parsed: unknown
    try {
      parsed = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'))
    } catch {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON_B64 must contain valid service-account JSON')
    }
    if (!parsed || typeof parsed !== 'object' || !('client_email' in parsed) || !('private_key' in parsed)) {
      throw new Error('Google service-account binding is missing client_email or private_key')
    }
    const account = parsed as { client_email: unknown; private_key: unknown; token_uri?: unknown }
    if (typeof account.client_email !== 'string' || typeof account.private_key !== 'string') {
      throw new Error('Google service-account binding is missing client_email or private_key')
    }
    return {
      client_email: account.client_email,
      private_key: account.private_key.replace(/\\n/g, '\n'),
      token_uri: typeof account.token_uri === 'string' ? account.token_uri : undefined,
    }
  }

  const clientEmail = bindingString(bindings.GOOGLE_CLIENT_EMAIL)
  const privateKey = bindingString(bindings.GOOGLE_PRIVATE_KEY)
  if (!clientEmail || !privateKey) {
    throw new Error('Configure GOOGLE_SERVICE_ACCOUNT_JSON_B64 or both GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY')
  }
  return { client_email: clientEmail, private_key: privateKey.replace(/\\n/g, '\n') }
}

export async function getOperationDashboardData(): Promise<OperationDashboardData> {
  const { env } = await getCloudflareContext({ async: true })
  const bindings = env as GoogleSheetsBindings
  const spreadsheetId = bindingString(bindings.GOOGLE_SHEET_ID)
  const encodedAccount = bindingString(bindings.GOOGLE_SERVICE_ACCOUNT_JSON_B64)
  const clientEmail = bindingString(bindings.GOOGLE_CLIENT_EMAIL)
  const privateKey = bindingString(bindings.GOOGLE_PRIVATE_KEY)

  if (!spreadsheetId && !encodedAccount && !clientEmail && !privateKey) {
    return { status: 'unconfigured' }
  }
  if (!spreadsheetId) throw new Error('GOOGLE_SHEET_ID Cloudflare binding is required for the OPERATION dashboard')

  const accessToken = await createGoogleSheetsAccessToken(serviceAccount(bindings))
  const query = new URLSearchParams({ valueRenderOption: 'FORMATTED_VALUE' })
  query.append('ranges', "'OPERATION'!E2")
  query.append('ranges', "'OPERATION'!B4:C")
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values:batchGet?${query}`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Google Sheets OPERATION request failed (${response.status})`)

  const payload: unknown = await response.json()
  if (!payload || typeof payload !== 'object') {
    throw new Error('Google Sheets returned an invalid OPERATION response')
  }
  const valueRanges = 'valueRanges' in payload ? payload.valueRanges : undefined
  if (!Array.isArray(valueRanges) || valueRanges.length !== 2) {
    throw new Error('Google Sheets returned invalid OPERATION ranges')
  }
  const summaryValues = valueRanges[0] && typeof valueRanges[0] === 'object' && 'values' in valueRanges[0]
    ? valueRanges[0].values
    : undefined
  const truckValues = valueRanges[1] && typeof valueRanges[1] === 'object' && 'values' in valueRanges[1]
    ? valueRanges[1].values
    : undefined
  if ((summaryValues !== undefined && (!Array.isArray(summaryValues) || !summaryValues.every(Array.isArray)))
    || (truckValues !== undefined && (!Array.isArray(truckValues) || !truckValues.every(Array.isArray)))) {
    throw new Error('Google Sheets returned invalid OPERATION rows')
  }
  const homeTimeCell = Array.isArray(summaryValues) ? summaryValues[0]?.[0] : undefined

  return {
    status: 'ready',
    metrics: parseOperationSheetRows(homeTimeCell, (truckValues ?? []) as unknown[][]),
  }
}
