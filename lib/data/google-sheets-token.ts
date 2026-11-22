import 'server-only'
import { createSign } from 'node:crypto'

export type GoogleServiceAccount = {
  client_email: string
  private_key: string
  token_uri?: string
}

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url')
}

export async function createGoogleSheetsAccessToken(account: GoogleServiceAccount): Promise<string> {
  const tokenUrl = account.token_uri || 'https://oauth2.googleapis.com/token'
  const now = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = base64url(JSON.stringify({
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: tokenUrl,
    iat: now,
    exp: now + 3600,
  }))
  const unsignedAssertion = `${header}.${claims}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsignedAssertion)
  signer.end()
  const assertion = `${unsignedAssertion}.${base64url(signer.sign(account.private_key))}`
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  })
  const result: unknown = await response.json()
  const accessToken = result && typeof result === 'object' && 'access_token' in result && typeof result.access_token === 'string'
    ? result.access_token
    : null
  if (!response.ok || !accessToken) {
    const error = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
      ? result.error
      : 'access token unavailable'
    throw new Error(`Google OAuth error (${response.status}): ${error}`)
  }
  return accessToken
}
