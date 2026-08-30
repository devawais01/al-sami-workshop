import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useMyRole, useMembers } from '../lib/useRole'
import { t } from '../lib/strings'

const ROLE_LABEL: Record<string, string> = {
  admin: t.users.admin,
  malik: t.users.malik,
  dekhne_wala: t.users.malik,
}

export default function Users() {
  const nav = useNavigate()
  const qc = useQueryClient()
  const { data: myRole, isLoading: roleLoading } = useMyRole()
  const isAdmin = myRole === 'admin'
  const { data: members } = useMembers(isAdmin)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState<string>(t.users.defaultPass)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  async function add() {
    setBusy(true)
    setErr('')
    setMsg('')

    const { data: s } = await supabase.auth.getSession()

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/add-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${s.session?.access_token}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          role: 'malik',
        }),
      }
    )

    const body = await res.json()

    setBusy(false)

    if (!res.ok) {
      setErr(body.error ?? 'Error')
      return
    }

    setMsg(t.users.saved)
    setEmail('')
    setPassword(t.users.defaultPass)

    qc.invalidateQueries({ queryKey: ['members'] })
  }

  async function remove(id: string) {
    if (!confirm(t.users.removeConfirm)) return

    await supabase
      .from('workshop_member')
      .delete()
      .eq('id', id)

    qc.invalidateQueries({ queryKey: ['members'] })
  }

  const field =
    'mt-1 w-full rounded-lg border border-line bg-chalk px-3 py-3 text-base outline-none focus:border-ink'

  if (roleLoading) {
    return (
      <p className="p-5 text-sm text-muted">
        {t.common.loading}
      </p>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-chalk">
        <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
          <button
            onClick={() => nav(-1)}
            className="text-muted"
          >
            <ArrowLeft size={22} />
          </button>

          <p className="font-medium text-ink">
            {t.users.title}
          </p>
        </header>

        <p className="p-5 text-sm text-muted">
          {t.users.onlyAdmin}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-chalk pb-10">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
        <button
          onClick={() => nav(-1)}
          className="text-muted"
        >
          <ArrowLeft size={22} />
        </button>

        <p className="font-medium text-ink">
          {t.users.title}
        </p>
      </header>

      <div className="p-5">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm font-medium text-ink">
            {t.users.add}
          </p>

          <p className="mt-1 text-xs text-muted">
            {t.users.hint}
          </p>

          <label className="mt-4 block text-sm font-medium text-ink">
            {t.users.email}
          </label>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            autoCapitalize="none"
            className={field}
          />

          <label className="mt-4 block text-sm font-medium text-ink">
            {t.users.password}
          </label>

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
          />

          <button
            onClick={add}
            disabled={busy || !email.trim() || !password}
            className="mt-6 w-full rounded-lg bg-indigo py-3 text-base font-semibold text-white disabled:opacity-30"
          >
            {busy ? t.worker.saving : t.users.add}
          </button>

          {msg && (
            <p className="mt-3 text-sm text-sabz">
              {msg}
            </p>
          )}

          {err && (
            <p className="mt-3 text-sm text-out">
              {err}
            </p>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm font-medium text-ink">
            {t.users.existing}
          </p>

          <ul className="mt-3 space-y-2">
            {members?.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-chalk px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">
                    {m.email}
                  </p>

                  <p className="text-xs text-muted">
                    {ROLE_LABEL[m.role] ?? m.role}
                  </p>
                </div>

                {m.role !== 'admin' && (
                  <button
                    onClick={() => remove(m.id)}
                    className="shrink-0 text-muted"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}