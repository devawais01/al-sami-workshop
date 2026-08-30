import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, LogOut, Search, Users as UsersIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useWorkshop } from '../lib/useWorkshop'
import { useWorkers } from '../lib/useWorkers'
import { useMyRole } from '../lib/useRole'
import { t } from '../lib/strings'
import AddWorker from './AddWorker'
import Photo from '../components/Photo'

export default function Workers() {
  const { data: workshop } = useWorkshop()
  const { data: workers, isLoading, error } = useWorkers(workshop?.id)
  const [adding, setAdding] = useState(false)
  const [q, setQ] = useState('')
  const { data: myRole, isLoading: roleLoading } = useMyRole()

  const term = q.trim().toLowerCase()
  const shown = term
    ? (workers ?? []).filter(
        (w) =>
          w.name.toLowerCase().includes(term) ||
          w.phone.includes(term)
      )
    : workers ?? []

  return (
    <div className="min-h-screen bg-chalk pb-24">
      <header className="sticky top-0 z-10 border-b border-line bg-surface px-5 py-3">
        <div className="flex items-center gap-3">
          <img
            src="/icon-512.png"
            alt=""
            className="h-9 w-9 rounded-lg"
          />

          <div className="min-w-0 flex-1">
            <p className="font-display text-lg leading-tight text-ink">
              {t.app.name}
            </p>
            <p className="truncate text-xs text-muted">
              {workshop?.name ?? ''}
            </p>
          </div>

          {!roleLoading && myRole === 'admin' && (
            <Link
              to="/users"
              aria-label={t.users.title}
              className="rounded-lg p-2 text-muted hover:bg-chalk"
            >
              <UsersIcon size={20} />
            </Link>
          )}

          <button
            onClick={() => supabase.auth.signOut()}
            aria-label={t.auth.logout}
            className="rounded-lg p-2 text-muted hover:bg-chalk"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="relative mt-3">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.worker.search}
            className="w-full rounded-lg border border-line bg-chalk py-2.5 pl-9 pr-3 text-base outline-none focus:border-ink placeholder:text-muted/60"
          />
        </div>
      </header>

      {isLoading && (
        <p className="p-5 text-sm text-muted">
          {t.common.loading}
        </p>
      )}

      {error && (
        <p className="m-5 rounded-lg bg-out-soft p-3 text-sm text-out">
          {(error as Error).message}
        </p>
      )}

      {!isLoading && !error && !workers?.length && (
        <p className="p-5 text-sm text-muted">
          {t.worker.empty}
        </p>
      )}

      <ul className="divide-y divide-line bg-surface">
        {shown.map((w) => (
          <li key={w.id}>
            <Link
              to={`/karigar/${w.id}`}
              className="flex items-center gap-3 px-5 py-3 active:bg-chalk"
            >
              <Photo
                bucket="worker-photos"
                path={w.photo_path}
                name={w.name}
                id={w.id}
                size={48}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">
                  {w.name}
                </p>
                <p className="nums truncate text-sm text-muted">
                  {w.phone}
                </p>
              </div>

              {w.pending > 0 && (
                <span className="nums shrink-0 rounded-full bg-brass px-2.5 py-1 text-xs font-semibold text-white">
                  {w.pending}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setAdding(true)}
        aria-label={t.worker.add}
        className="fixed bottom-24 right-6 z-20 grid h-14 w-14 place-items-center rounded-full bg-indigo text-white shadow-lg"
      >
        <Plus size={26} />
      </button>

      {adding && workshop && (
        <AddWorker
          workshopId={workshop.id}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  )
}