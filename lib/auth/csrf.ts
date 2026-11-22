export function matchesGoogleCsrf(formToken: string | null, cookieToken: string | null): boolean {
  if (!formToken || !cookieToken || formToken.length !== cookieToken.length) return false
  let difference = 0
  for (let index = 0; index < formToken.length; index += 1) {
    difference |= formToken.charCodeAt(index) ^ cookieToken.charCodeAt(index)
  }
  return difference === 0
}
