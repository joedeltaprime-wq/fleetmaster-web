export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  let value: unknown
  try {
    value = await request.json()
  } catch {
    return null
  }
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)
}
