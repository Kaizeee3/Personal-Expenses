import { NextResponse, type NextRequest } from 'next/server'
import { monthRange } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'

const COLUMNS = ['occurred_on', 'type', 'title', 'amount', 'currency', 'category', 'status', 'due_date', 'source', 'created_at'] as const

function csvCell(value: unknown) {
  if (value === null || value === undefined) return ''
  let s = String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const monthParam = request.nextUrl.searchParams.get('month')
  const type = request.nextUrl.searchParams.get('type')
  let query = supabase.from('entries').select(COLUMNS.join(',')).order('occurred_on', { ascending: true })
  if (monthParam) {
    const { start, end } = monthRange(monthParam)
    query = query.gte('occurred_on', start).lt('occurred_on', end)
  }
  if (type) query = query.eq('type', type)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data ?? []) as unknown as Record<string, unknown>[]
  const body = [COLUMNS.join(','), ...rows.map((r) => COLUMNS.map((c) => csvCell(r[c])).join(','))].join('\r\n')
  const name = `personal-dashboard-${monthParam ?? 'all'}.csv`

  return new NextResponse(`﻿${body}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
    },
  })
}
