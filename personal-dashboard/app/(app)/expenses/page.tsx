import Link from 'next/link'
import { CategoryBars, sum, totalsByCategory } from '@/components/category-bars'
import { ExpenseRow } from '@/components/entry-rows'
import { ExpenseForm } from '@/components/forms'
import { formatMoney, monthRange, shiftMonth, todayISO } from '@/lib/format'
import { requireUser } from '@/lib/supabase/server'
import type { Entry } from '@/lib/types'

export const metadata = { title: 'Expenses · Personal Dashboard' }

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month: monthParam } = await searchParams
  const { month, start, end } = monthRange(monthParam)
  const { supabase } = await requireUser()

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('type', 'expense')
    .gte('occurred_on', start)
    .lt('occurred_on', end)
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: false })
  const expenses = (data ?? []) as Entry[]

  const label = new Date(`${start}T00:00:00Z`).toLocaleDateString('en-SG', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  const isCurrent = month === todayISO().slice(0, 7)

  return (
    <>
      <header className="page-head row-between">
        <div>
          <h1>Expenses</h1>
          <p className="muted">{label} · {formatMoney(sum(expenses))} across {expenses.length} entries</p>
        </div>
        <div className="tabs">
          <Link href={`/expenses?month=${shiftMonth(month, -1)}`}>← Prev</Link>
          {!isCurrent && <Link href="/expenses">This month</Link>}
          <Link href={`/expenses?month=${shiftMonth(month, 1)}`}>Next →</Link>
          <a href={`/api/export?month=${month}`} className="accent-link">Export CSV</a>
          <a href="/api/export" className="accent-link">Export all</a>
        </div>
      </header>

      <div className="grid wide-left">
        <section className="card">
          <ExpenseForm today={todayISO()} />
          {error && <p className="error">{error.message}</p>}
          {expenses.length === 0 ? (
            <p className="muted">No expenses this month.</p>
          ) : (
            <ul className="list">{expenses.map((e) => <ExpenseRow key={e.id} expense={e} />)}</ul>
          )}
        </section>
        <section className="card">
          <h2>By category</h2>
          <CategoryBars rows={totalsByCategory(expenses)} />
        </section>
      </div>
    </>
  )
}
