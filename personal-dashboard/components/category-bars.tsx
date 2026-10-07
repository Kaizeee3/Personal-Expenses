import { formatMoney } from '@/lib/format'

export function CategoryBars({ rows }: { rows: { category: string; total: number }[] }) {
  if (rows.length === 0) return <p className="muted">No expenses yet this month.</p>
  const max = Math.max(...rows.map((r) => r.total))
  return (
    <ul className="bars">
      {rows.map((r) => (
        <li key={r.category}>
          <span className="bar-label">{r.category}</span>
          <span className="bar-track">
            <span className="bar-fill" style={{ width: `${max ? (r.total / max) * 100 : 0}%` }} />
          </span>
          <span className="amount">{formatMoney(r.total)}</span>
        </li>
      ))}
    </ul>
  )
}

export function totalsByCategory(expenses: { category: string | null; amount: string | null }[]) {
  const map = new Map<string, number>()
  for (const e of expenses) {
    const key = e.category ?? 'Other'
    map.set(key, (map.get(key) ?? 0) + Number(e.amount ?? 0))
  }
  return [...map.entries()].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total)
}

export function sum(expenses: { amount: string | null }[]) {
  return expenses.reduce((acc, e) => acc + Number(e.amount ?? 0), 0)
}
