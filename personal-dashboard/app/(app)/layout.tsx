import { Nav } from '@/components/nav'
import { requireUser } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser()
  return (
    <div className="shell">
      <Nav email={user.email ?? ''} />
      <main className="content">{children}</main>
    </div>
  )
}
