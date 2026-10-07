'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Today' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/expenses', label: 'Expenses' },
]

export function Nav({ email }: { email: string }) {
  const path = usePathname()
  return (
    <aside className="sidebar">
      <div className="brand">Personal Dashboard</div>
      <nav>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={path === l.href ? 'active' : ''}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-foot">
        <span className="muted small" title={email}>{email}</span>
        <form action="/auth/signout" method="post">
          <button className="btn ghost small">Sign out</button>
        </form>
      </div>
    </aside>
  )
}
