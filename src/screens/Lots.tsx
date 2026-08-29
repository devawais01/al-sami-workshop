import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useWorkshop } from '../lib/useWorkshop'
import { useLots } from '../lib/useLots'
import { t } from '../lib/strings'
import AddLot from './AddLot'

export default function Lots() {
  const { data: workshop } = useWorkshop()
  const { data: lots, isLoading } = useLots(workshop?.id)
  const [tab, setTab] = useState<'chalu' | 'band'>('chalu')
  const [adding, setAdding] = useState(false)

  const shown = lots?.filter((l) => l.status === tab) ?? []

  return (
    <div className="min-h-screen bg-chalk pb-24">
      <header className="sticky top-0 z-10 border-b border-line bg-surface px-5 pt-4">
        <h1 className="font-display text-2xl text-indigo">{t.lot.title}</h1>
        <div className="mt-3 flex gap-6">
          {(['chalu', 'band'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`border-b-2 pb-2 text-sm font-medium ${
                tab === k
                  ? 'border-indigo text-indigo'
                  : 'border-transparent text-muted'
              }`}
            >
              {k === 'chalu' ? t.lot.active : t.lot.closed}
            </button>
          ))}
        </div>
      </header>

      {isLoading && <p className="p-5 text-sm text-muted">{t.common.loading}</p>}

      {!isLoading && shown.length === 0 && (
        <p className="p-5 text-sm text-muted">
          {tab === 'chalu' ? t.lot.noActive : t.lot.noClosed}
        </p>
      )}

      <ul className="space-y-3 p-5">
        {shown.map((l) => {
          const pct = l.issued > 0 ? Math.round((l.returned / l.issued) * 100) : 0
          return (
            <li key={l.id} className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-baseline justify-between">
                <p className="nums font-semibold text-ink">Lot {l.lot_number}</p>
                {l.pending > 0 && (
                  <span className="nums rounded-full bg-brass-soft px-2 py-0.5 text-xs font-semibold text-brass">
                    {l.pending} {t.lot.pending.toLowerCase()}
                  </span>
                )}
              </div>
              {l.title && <p className="mt-0.5 text-sm text-muted">{l.title}</p>}

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-chalk">
                <div className="h-full bg-sabz" style={{ width: `${pct}%` }} />
              </div>

              <p className="nums mt-2 text-xs text-muted">
                {t.lot.issued} {l.issued} · {t.lot.returned} {l.returned}
              </p>
            </li>
          )
        })}
      </ul>

      <button
        onClick={() => setAdding(true)}
        aria-label={t.lot.add}
        className="fixed bottom-24 right-6 z-20 grid h-14 w-14 place-items-center rounded-full bg-indigo text-white shadow-lg"
      >
        <Plus size={26} />
      </button>

      {adding && workshop && (
        <AddLot workshopId={workshop.id} onClose={() => setAdding(false)} />
      )}
    </div>
  )
}