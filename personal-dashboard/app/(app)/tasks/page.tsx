import Link from 'next/link'
import { TaskRow } from '@/components/entry-rows'
import { TaskForm } from '@/components/forms'
import { todayISO } from '@/lib/format'
import { requireUser } from '@/lib/supabase/server'
import type { Entry } from '@/lib/types'

export const metadata = { title: 'Tasks · Personal Dashboard' }

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show } = await searchParams
  const showDone = show === 'done'
  const { supabase } = await requireUser()
  const today = todayISO()

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('type', 'task')
    .eq('status', showDone ? 'done' : 'open')
    .order(showDone ? 'updated_at' : 'due_date', { ascending: !showDone, nullsFirst: false })
    .limit(500)
  const tasks = (data ?? []) as Entry[]

  return (
    <>
      <header className="page-head row-between">
        <h1>Tasks</h1>
        <div className="tabs">
          <Link href="/tasks" className={!showDone ? 'active' : ''}>Open</Link>
          <Link href="/tasks?show=done" className={showDone ? 'active' : ''}>Done</Link>
        </div>
      </header>
      <section className="card">
        {!showDone && <TaskForm />}
        {error && <p className="error">{error.message}</p>}
        {tasks.length === 0 ? (
          <p className="muted">{showDone ? 'No completed tasks yet.' : 'No open tasks.'}</p>
        ) : (
          <ul className="list">{tasks.map((t) => <TaskRow key={t.id} task={t} today={today} />)}</ul>
        )}
      </section>
    </>
  )
}
