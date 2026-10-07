export type EntryType = 'task' | 'expense' | 'email' | 'message' | 'note'
export type EntryStatus = 'open' | 'done' | 'archived'

export type Entry = {
  id: string
  user_id: string
  type: EntryType
  title: string
  status: EntryStatus
  amount: string | null
  currency: string
  category: string | null
  due_date: string | null
  occurred_on: string
  source: string
  external_id: string | null
  details: Record<string, unknown>
  created_at: string
  updated_at: string
}
