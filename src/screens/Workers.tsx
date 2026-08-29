import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useWorkshop } from '../lib/useWorkshop'
import { useWorkers } from '../lib/useWorkers'
import { t } from '../lib/strings'
import AddWorker from './AddWorker'

const AVATAR_COLORS = ['#263A6B', '#1F6B4D', '#A87A2C', '#6E4B7A', '#2C6E7A']

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?'
}

function colorFor(id: string) {
  let sum = 0
  for (const ch of id) sum += ch.charCodeAt(0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

export default function Workers() {
  const { data: workshop } = useWorkshop()
  const { data: workers, isLoading } = useWorkers(workshop?.id)
  const [adding, setAdding] = useState(false)

  return (
    <div className="min-h-screen bg-chalk pb-24">
      <header className="sticky top-0 z-10 border-b border-line bg-surface px-5 py-4">
        <h1 className="font-display text-2xl text-indigo">{t.app.name}</h1>
        <p className="text-xs text-muted">{workshop?.name ?? ''}</p>
      </header>

      {isLoading && <p className="p-5 text-sm text-muted">{t.common.loading}</p>}

      {!isLoading && !workers?.length && (
        <p className="p-5 text-sm text-muted">{t.worker.empty}</p>
      )}

      <ul className="divide-y divide-line bg-surface">
        {workers?.map((w) => (
          <li key={w.id} className="flex items-center gap-3 px-5 py-3">
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg font-semibold text-white"
              style={{ backgroundColor: colorFor(w.id) }}
            >
              {initial(w.name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{w.name}</p>
              <p className="nums truncate text-sm text-muted">{w.phone}</p>
            </div>

            {w.pending > 0 && (
              <span className="nums shrink-0 rounded-full bg-brass px-2.5 py-1 text-xs font-semibold text-white">
                {w.pending}
              </span>
            )}
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
        <AddWorker workshopId={workshop.id} onClose={() => setAdding(false)} />
      )}
    </div>
  )
}