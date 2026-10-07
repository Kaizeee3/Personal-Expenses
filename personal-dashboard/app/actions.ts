'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/supabase/server'
import { EXPENSE_CATEGORIES, todayISO } from '@/lib/format'

export type ActionState = { ok: boolean; message: string } | null

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

function refresh() {
  revalidatePath('/', 'layout')
}

export async function addTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const title = text(formData, 'title')
  const due = text(formData, 'due_date')
  if (!title) return { ok: false, message: 'Task needs a title.' }
  if (title.length > 500) return { ok: false, message: 'Title is too long.' }
  if (due && !DATE_RE.test(due)) return { ok: false, message: 'Invalid due date.' }

  const { supabase, user } = await requireUser()
  const { error } = await supabase.from('entries').insert({
    user_id: user.id,
    type: 'task',
    title,
    due_date: due || null,
  })
  if (error) return { ok: false, message: error.message }
  refresh()
  return { ok: true, message: 'Task added.' }
}

export async function addExpense(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const title = text(formData, 'title')
  const amountRaw = text(formData, 'amount')
  const category = text(formData, 'category') || 'Other'
  const date = text(formData, 'occurred_on') || todayISO()
  const amount = Number(amountRaw)

  if (!title) return { ok: false, message: 'Expense needs a description.' }
  if (!amountRaw || !Number.isFinite(amount) || amount < 0 || amount >= 1e10) {
    return { ok: false, message: 'Enter a valid amount.' }
  }
  if (!DATE_RE.test(date)) return { ok: false, message: 'Invalid date.' }
  if (!(EXPENSE_CATEGORIES as readonly string[]).includes(category)) {
    return { ok: false, message: 'Unknown category.' }
  }

  const { supabase, user } = await requireUser()
  const { error } = await supabase.from('entries').insert({
    user_id: user.id,
    type: 'expense',
    title,
    amount: Math.round(amount * 100) / 100,
    currency: 'SGD',
    category,
    occurred_on: date,
    status: 'done',
  })
  if (error) return { ok: false, message: error.message }
  refresh()
  return { ok: true, message: 'Expense saved.' }
}

export async function toggleTask(formData: FormData) {
  const id = text(formData, 'id')
  const done = text(formData, 'done') === 'true'
  const { supabase } = await requireUser()
  await supabase.from('entries').update({ status: done ? 'open' : 'done' }).eq('id', id).eq('type', 'task')
  refresh()
}

export async function deleteEntry(formData: FormData) {
  const id = text(formData, 'id')
  const { supabase } = await requireUser()
  await supabase.from('entries').delete().eq('id', id)
  refresh()
}
