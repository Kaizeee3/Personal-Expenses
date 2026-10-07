'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addExpense, addTask, type ActionState } from '@/app/actions'
import { EXPENSE_CATEGORIES } from '@/lib/format'

function useResetOnSuccess(state: ActionState) {
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state?.ok) {
      ref.current?.reset()
      ref.current?.querySelector<HTMLInputElement>('input[name="title"]')?.focus()
    }
  }, [state])
  return ref
}

export function TaskForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(addTask, null)
  const ref = useResetOnSuccess(state)
  return (
    <form ref={ref} action={action} className="quick-form">
      <input name="title" placeholder="Add a task…" required maxLength={500} aria-label="Task title" />
      <input name="due_date" type="date" aria-label="Due date" />
      <button className="btn primary" disabled={pending}>Add</button>
      {state && !state.ok && <p className="error full">{state.message}</p>}
    </form>
  )
}

export function ExpenseForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addExpense, null)
  const ref = useResetOnSuccess(state)
  return (
    <form ref={ref} action={action} className="quick-form expense">
      <input name="title" placeholder="What was it?" required maxLength={500} aria-label="Description" />
      <input name="amount" type="number" inputMode="decimal" step="0.01" min="0" placeholder="0.00" required aria-label="Amount in SGD" />
      <select name="category" defaultValue="Food" aria-label="Category">
        {EXPENSE_CATEGORIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <input name="occurred_on" type="date" defaultValue={today} aria-label="Date" />
      <button className="btn primary" disabled={pending}>Add</button>
      {state && !state.ok && <p className="error full">{state.message}</p>}
    </form>
  )
}
