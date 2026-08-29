import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { t } from '../lib/strings'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleLogin() {
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(t.auth.wrongDetails)
    setBusy(false)
  }

  return (
    <div className="min-h-screen bg-chalk flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-4xl text-indigo text-center">
          {t.app.name}
        </h1>
        <p className="mt-1 text-center text-sm text-muted">{t.app.tagline}</p>

        <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
          <label className="block text-sm font-medium text-ink">
            {t.auth.email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-line bg-chalk px-3 py-3 text-base outline-none focus:border-indigo"
          />

          <label className="mt-4 block text-sm font-medium text-ink">
            {t.auth.password}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="mt-1 w-full rounded-lg border border-line bg-chalk px-3 py-3 text-base outline-none focus:border-indigo"
          />

          {error && <p className="mt-3 text-sm text-brass">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={busy || !email || !password}
            className="mt-6 w-full rounded-lg bg-indigo py-3 text-base font-semibold text-white disabled:opacity-40"
          >
            {busy ? t.auth.signingIn : t.auth.login}
          </button>
        </div>
      </div>
    </div>
  )
}