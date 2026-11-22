const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const usdCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const usdCompact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 })
const num = new Intl.NumberFormat('en-US')

export function fmtCurrency(n: number, opts: { compact?: boolean; cents?: boolean } = {}) {
  if (opts.compact) return usdCompact.format(n)
  if (opts.cents) return usdCents.format(n)
  return usd.format(n)
}

export function fmtNumber(n: number) {
  return num.format(Math.round(n))
}

export function fmtPct(n: number | null, digits = 1) {
  if (n === null || !Number.isFinite(n)) return '—'
  const sign = n > 0 ? '+' : n < 0 ? '−' : ''
  return `${sign}${Math.abs(n * 100).toFixed(digits)}%`
}

export function fmtMonth(key: string) {
  const [y, m] = key.split('-')
  return `${MONTHS[Number(m) - 1]} ${y}`
}

export function fmtMonthShort(key: string) {
  const [y, m] = key.split('-')
  return `${MONTHS[Number(m) - 1]} ’${y.slice(2)}`
}

export function fmtDate(date: string) {
  const [y, m, d] = date.split('-')
  return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`
}

export function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
}
