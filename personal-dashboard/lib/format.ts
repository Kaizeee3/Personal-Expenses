export const TIME_ZONE = 'Asia/Singapore'
export const CURRENCY = 'SGD'

const money = new Intl.NumberFormat('en-SG', { style: 'currency', currency: CURRENCY })

export function formatMoney(value: number | string | null | undefined) {
  return money.format(Number(value ?? 0))
}

export function todayISO(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(date)
}

export function monthRange(month?: string) {
  const base = month && /^\d{4}-\d{2}$/.test(month) ? month : todayISO().slice(0, 7)
  const [y, m] = base.split('-').map(Number)
  const start = `${base}-01`
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
  return { month: base, start, end: `${next}-01` }
}

export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function formatDate(iso: string | null) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Groceries',
  'Bills',
  'Shopping',
  'Health',
  'Entertainment',
  'Subscriptions',
  'Family',
  'Other',
] as const
