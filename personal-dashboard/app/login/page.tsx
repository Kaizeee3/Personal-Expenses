import { LoginForm } from './login-form'

export const metadata = { title: 'Sign in · Personal Dashboard' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  return (
    <main className="login">
      <div className="card login-card">
        <h1>Personal Dashboard</h1>
        <p className="muted">Tasks and SGD expenses in one place. Sign in with a one-time email link.</p>
        {error === 'link' && <p className="error">That link expired or was already used. Request a new one.</p>}
        <LoginForm />
      </div>
    </main>
  )
}
