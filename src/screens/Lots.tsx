import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useWorkshop } from '../lib/useWorkshop'
import { useLots } from '../lib/useLots'
import { t } from '../lib/strings'
import AddLot from './AddLot'
import Photo from '../components/Photo'

export default function Lots() {
  const { data: workshop } = useWorkshop()
  const { data: lots, isLoading, error } = useLots(workshop?.id)
  const [tab, setTab] = useState<'chalu' | 'band'>('chalu')
  const [adding, setAdding] = useState(false)

  const shown = lots?.filter((l) => l.status === tab) ?? []

  return (
    <div className="min-h-screen bg-chalk pb-24">
      <header className="sticky top-0 z-10 border-b border-line bg-surface px-5 pt-4">
        <div>
          <h1 className="font-display text-2xl text-ink">{t.lot.title}</h1>
          <div className="mt-3 flex gap-6">
            {(['chalu', 'band'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`border-b-2 pb-2 text-sm font-medium ${
                  tab === k
                    ? 'border-ink text-ink'
                    : 'border-transparent text-muted'
                }`}
              >
                {k === 'chalu' ? t.lot.active : t.lot.closed}
              </button>
            ))}
          </div>
        </div>
      </header>

      {isLoading && (
        <p className="p-5 text-sm text-muted">{t.common.loading}</p>
      )}

      {error && (
        <p className="m-5 rounded-lg bg-out-soft p-3 text-sm text-out">
          {(error as Error).message}
        </p>
      )}

      {!isLoading && !error && shown.length === 0 && (
        <p className="p-5 text-sm text-muted">
          {tab === 'chalu' ? t.lot.noActive : t.lot.noClosed}
        </p>
      )}

      <ul className="space-y-3 p-5">
        {shown.map((l) => {
          const base = l.total_pieces ?? l.issued
          const pct = (n: number) => (base > 0 ? (n / base) * 100 : 0)

          const stats = [
            { label: t.lot.total, value: l.total_pieces },
            { label: t.lot.store, value: l.store },
            { label: t.lot.issued, value: l.issued },
            { label: t.lot.returned, value: l.returned },
          ]

          return (
            <li
              key={l.id}
              className="flex gap-3 rounded-2xl border border-line bg-surface p-4"
            >
              <Link to={`/dress/${l.dress_id}/edit`}>
                <Photo
                  bucket="design-photos"
                  path={l.dress_photo}
                  name={l.dress_name}
                  id={l.dress_id}
                  size={52}
                  rounded={false}
                />
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 truncate font-semibold text-ink">
                    {l.dress_name}
                  </p>

                  {l.pending > 0 && (
                    <span className="nums shrink-0 rounded-full bg-brass-soft px-2 py-0.5 text-xs font-semibold text-brass">
                      {l.pending} {t.lot.pending.toLowerCase()}
                    </span>
                  )}
                </div>

                <p className="nums mt-0.5 text-sm text-muted">
                  Lot {l.lot_number}
                </p>

                <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-line">
                  <div
                    className="bg-sabz"
                    style={{ width: `${pct(l.returned)}%` }}
                  />
                  <div
                    className="bg-out"
                    style={{ width: `${pct(l.pending)}%` }}
                  />
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <p className="text-[11px] text-muted">{s.label}</p>
                      <p className="nums text-base font-semibold text-ink">
                        {s.value ?? '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
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
        <AddLot
          workshopId={workshop.id}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  )
}