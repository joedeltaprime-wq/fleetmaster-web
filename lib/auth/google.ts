export interface GoogleIdentity {
  sub: string
  email: string
  name: string | null
  picture: string | null
}

interface GoogleJwk {
  kid?: string
  kty?: string
  alg?: string
  use?: string
  [key: string]: unknown
}

interface GoogleClaims {
  iss?: string
  aud?: string | string[]
  azp?: string
  exp?: number
  iat?: number
  sub?: string
  email?: string
  email_verified?: boolean | string
  name?: string
  picture?: string
}

export class GoogleCredentialError extends Error {
  readonly status: 401 | 503

  constructor(message: string, status: 401 | 503 = 401) {
    super(message)
    this.name = 'GoogleCredentialError'
    this.status = status
  }
}

let cachedKeys: GoogleJwk[] | null = null
let keysExpireAt = 0

async function loadGoogleJwks(forceRefresh = false): Promise<GoogleJwk[]> {
  if (!forceRefresh && cachedKeys && keysExpireAt > Date.now()) return cachedKeys
  let response: Response
  try {
    response = await fetch('https://www.googleapis.com/oauth2/v3/certs')
  } catch {
    throw new GoogleCredentialError('Google signing keys are unavailable', 503)
  }
  if (!response.ok) throw new GoogleCredentialError('Google signing keys are unavailable', 503)
  const body: { keys?: GoogleJwk[] } = await response.json()
  if (!Array.isArray(body.keys)) throw new GoogleCredentialError('Google signing keys are invalid', 503)
  const cacheControl = response.headers.get('cache-control') ?? ''
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/u)?.[1] ?? 1800)
  cachedKeys = body.keys
  keysExpireAt = Date.now() + Math.max(300, (Number.isFinite(maxAge) ? maxAge : 1800) - 60) * 1000
  return cachedKeys
}

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function decodeJson<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T
}

export async function verifyGoogleCredential(
  token: string,
  clientId: string,
  getKeys: () => Promise<GoogleJwk[]> = loadGoogleJwks,
): Promise<GoogleIdentity> {
  if (!clientId) throw new GoogleCredentialError('Google client ID is not configured', 503)
  const parts = token.split('.')
  if (parts.length !== 3 || parts.some((part) => !part)) throw new GoogleCredentialError('Malformed Google credential')

  let header: { alg?: string; kid?: string }
  let claims: GoogleClaims
  try {
    header = decodeJson(parts[0])
    claims = decodeJson(parts[1])
  } catch {
    throw new GoogleCredentialError('Malformed Google credential')
  }
  if (header.alg !== 'RS256' || !header.kid) throw new GoogleCredentialError('Unsupported Google credential')

  let keys = await getKeys()
  let jwk = keys.find((candidate) => candidate.kid === header.kid && candidate.kty === 'RSA')
  if (!jwk && getKeys === loadGoogleJwks) {
    keysExpireAt = 0
    keys = await loadGoogleJwks(true)
    jwk = keys.find((candidate) => candidate.kid === header.kid && candidate.kty === 'RSA')
  }
  if (!jwk) throw new GoogleCredentialError('Google signing key not found')
  let signatureValid = false
  try {
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])
    signatureValid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      decodeBase64Url(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    )
  } catch {
    throw new GoogleCredentialError('Invalid Google credential signature')
  }
  if (!signatureValid) throw new GoogleCredentialError('Invalid Google credential signature')

  const now = Math.floor(Date.now() / 1000)
  const audienceMatches = Array.isArray(claims.aud) ? claims.aud.includes(clientId) : claims.aud === clientId
  const issuerMatches = claims.iss === 'accounts.google.com' || claims.iss === 'https://accounts.google.com'
  if (!issuerMatches || !audienceMatches || (claims.azp && claims.azp !== clientId) || (Array.isArray(claims.aud) && claims.aud.length > 1 && claims.azp !== clientId)) {
    throw new GoogleCredentialError('Google credential claims do not match')
  }
  if (typeof claims.exp !== 'number' || claims.exp <= now || typeof claims.iat !== 'number' || claims.iat > now + 60) {
    throw new GoogleCredentialError('Google credential is expired or not yet valid')
  }
  if (claims.email_verified !== true && claims.email_verified !== 'true') {
    throw new GoogleCredentialError('Google email is not verified')
  }
  const email = typeof claims.email === 'string' ? claims.email.trim().toLowerCase() : ''
  if (typeof claims.sub !== 'string' || !claims.sub || !email || !email.includes('@')) {
    throw new GoogleCredentialError('Google account identity is incomplete')
  }

  return {
    sub: claims.sub,
    email,
    name: typeof claims.name === 'string' ? claims.name.trim() || null : null,
    picture: typeof claims.picture === 'string' ? claims.picture.trim() || null : null,
  }
}
