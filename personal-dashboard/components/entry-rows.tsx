import { deleteEntry, toggleTask } from '@/app/actions'
import { formatDate, formatMoney } from '@/lib/format'
import type { Entry } from '@/lib/types'

export function TaskRow({ task, today }: { task: Entry; today: string }) {
  const done = task.status === 'done'
  const overdue = !done && task.due_date !== null && task.due_date < today
  return (
    <li className={`row ${done ? 'done' : ''}`}>
      <form action={toggleTask}>
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="done" value={String(done)} />
        <button className={`check ${done ? 'on' : ''}`} aria-label={done ? 'Mark as not done' : 'Mark as done'}>
          {done ? '✓' : ''}
        </button>
      </form>
      <span className="grow title">{task.title}</span>
      {task.due_date && (
        <span className={`pill ${overdue ? 'danger' : task.due_date === today ? 'accent' : ''}`}>
          {task.due_date === today ? 'Today' : formatDate(task.due_date)}
        </span>
      )}
      <DeleteButton id={task.id} />
    </li>
  )
}

export function ExpenseRow({ expense }: { expense: Entry }) {
  return (
    <li className="row">
      <span className="date muted">{formatDate(expense.occurred_on)}</span>
      <span className="grow title">{expense.title}</span>
      {expense.category && <span className="pill">{expense.category}</span>}
      <span className="amount">{formatMoney(expense.amount)}</span>
      <DeleteButton id={expense.id} />
    </li>
  )
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteEntry}>
      <input type="hidden" name="id" value={id} />
      <button className="icon-btn" aria-label="Delete">×</button>
    </form>
  )
}
