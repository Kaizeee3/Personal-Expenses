'use client'

import { useActionState } from 'react'
import { sendMagicLink, type LoginState } from './actions'

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, null)
  return (
    <form action={action} className="stack">
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </label>
      <button className="btn primary" disabled={pending}>
        {pending ? 'Sending…' : 'Send sign-in link'}
      </button>
      {state && <p className={state.ok ? 'success' : 'error'}>{state.message}</p>}
    </form>
  )
}
