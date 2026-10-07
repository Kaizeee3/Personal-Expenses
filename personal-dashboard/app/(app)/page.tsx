import { CategoryBars, sum, totalsByCategory } from '@/components/category-bars'
import { ExpenseRow, TaskRow } from '@/components/entry-rows'
import { ExpenseForm, TaskForm } from '@/components/forms'
import { formatMoney, monthRange, todayISO } from '@/lib/format'
import { requireUser } from '@/lib/supabase/server'
import type { Entry } from '@/lib/types'

export default async function TodayPage() {
  const { supabase } = await requireUser()
  const today = todayISO()
  const { start, end } = monthRange()
  const dayStartUtc = new Date(`${today}T00:00:00+08:00`).toISOString()

  const [tasksRes, expensesRes] = await Promise.all([
    supabase
      .from('entries')
      .select('*')
      .eq('type', 'task')
      .or(`status.eq.open,and(status.eq.done,updated_at.gte.${dayStartUtc})`)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
      .limit(200),
    supabase
      .from('entries')
      .select('*')
      .eq('type', 'expense')
      .gte('occurred_on', start)
      .lt('occurred_on', end)
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false }),
  ])

  const tasks = (tasksRes.data ?? []) as Entry[]
  const expenses = (expensesRes.data ?? []) as Entry[]
  const open = tasks.filter((t) => t.status === 'open')
  const focus = tasks.filter((t) => t.status === 'done' || t.due_date === null || t.due_date <= today)
  const upcoming = open.filter((t) => t.due_date !== null && t.due_date > today)
  const overdue = open.filter((t) => t.due_date !== null && t.due_date < today).length
  const todays = expenses.filter((e) => e.occurred_on === today)

  const heading = new Date().toLocaleDateString('en-SG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Singapore',
  })

  return (
    <>
      <header className="page-head">
        <h1>{heading}</h1>
        {(tasksRes.error || expensesRes.error) && (
          <p className="error">Could not load data: {(tasksRes.error ?? expensesRes.error)?.message}</p>
        )}
      </header>

      <section className="stats">
        <Stat label="Open tasks" value={String(open.length)} />
        <Stat label="Overdue" value={String(overdue)} tone={overdue ? 'danger' : undefined} />
        <Stat label="Spent today" value={formatMoney(sum(todays))} />
        <Stat label="Spent this month" value={formatMoney(sum(expenses))} />
      </section>

      <div className="grid">
        <section className="card">
          <h2>Today&apos;s tasks</h2>
          <TaskForm />
          {focus.length === 0 ? (
            <p className="muted">Nothing due. Add a task above.</p>
          ) : (
            <ul className="list">{focus.map((t) => <TaskRow key={t.id} task={t} today={today} />)}</ul>
          )}
          {upcoming.length > 0 && (
            <>
              <h3>Upcoming</h3>
              <ul className="list">{upcoming.slice(0, 5).map((t) => <TaskRow key={t.id} task={t} today={today} />)}</ul>
            </>
          )}
        </section>

        <section className="card">
          <h2>Log an expense</h2>
          <ExpenseForm today={today} />
          <h3>Today</h3>
          {todays.length === 0 ? (
            <p className="muted">No spending logged today.</p>
          ) : (
            <ul className="list">{todays.map((e) => <ExpenseRow key={e.id} expense={e} />)}</ul>
          )}
          <h3>This month by category</h3>
          <CategoryBars rows={totalsByCategory(expenses)} />
        </section>
      </div>
    </>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'danger' }) {
  return (
    <div className={`card stat ${tone ?? ''}`}>
      <span className="muted small">{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
