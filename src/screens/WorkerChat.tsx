import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useWorkshop } from '../lib/useWorkshop'
import { useWorker } from '../lib/useWorkers'
import { useEntries } from '../lib/useEntries'
import { t } from '../lib/strings'
import EntrySheet from './EntrySheet'
import Photo from '../components/Photo'

function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function stamp(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${date}, ${time}`
}

export default function WorkerChat() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data: workshop } = useWorkshop()
  const { data: worker } = useWorker(id)
  const { data: entries, isLoading } = useEntries(id)
  const [sheet, setSheet] = useState<'issue' | 'return' | null>(null)

  const issued = entries?.filter((e) => e.kind === 'issue').reduce((s, e) => s + e.qty, 0) ?? 0
  const returned = entries?.filter((e) => e.kind === 'return').reduce((s, e) => s + e.qty, 0) ?? 0
  const pending = issued - returned

  let lastDay = ''

  return (
    <div className="min-h-screen bg-chalk pb-28">
      <header className="sticky top-0 z-10 border-b border-line bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => nav('/')} className="text-muted">
            <ArrowLeft size={22} />
          </button>
          <Photo bucket="worker-photos" path={worker?.photo_path ?? null} name={worker?.name ?? ''} id={id ?? ''} size={38} />
          <button
            onClick={() => nav(`/karigar/${id}/profile`)}
            className="min-w-0 flex-1 text-left"
          >
            <p className="truncate font-medium text-ink">{worker?.name ?? ''}</p>
            <p className="nums text-xs text-muted">
              {pending > 0
                ? `${pending} dress ${t.entry.summaryPending.toLowerCase()}`
                : t.entry.headerClear}
            </p>
          </button>
        </div>

        <div className="nums mt-3 flex gap-4 text-xs text-muted">
          <span>{t.entry.summary} {issued}</span>
          <span>{t.entry.summaryReturned} {returned}</span>
          <span className="font-semibold text-brass">
            {t.entry.summaryPending} {pending}
          </span>
        </div>
      </header>

      <div className="space-y-2 p-4">
        {isLoading && <p className="text-sm text-muted">{t.common.loading}</p>}
        {!isLoading && !entries?.length && (
          <p className="text-sm text-muted">{t.entry.empty}</p>
        )}

        {entries?.map((e) => {
          const label = dayLabel(e.happened_at)
          const showDay = label !== lastDay
          lastDay = label
          const out = e.kind === 'issue'

          return (
            <div key={e.id}>
              {showDay && (
                <p className="my-4 text-center text-xs text-muted">{label}</p>
              )}
              <div
                className={`flex items-stretch overflow-hidden rounded-xl bg-surface ${
                  out ? 'border-l-4 border-indigo' : 'border-r-4 border-sabz'
                }`}
              >
                <div className="flex-1 px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className={`text-xs font-medium ${out ? 'text-indigo' : 'text-sabz'}`}>
                      {e.dress_name} — Lot {e.lot_number}
                    </p>
                    <p className="nums shrink-0 text-[11px] text-muted">
                      {stamp(e.happened_at)}
                    </p>
                  </div>
                  <p className="nums mt-1 text-lg font-semibold text-ink">
                    {e.qty} dress {out ? t.chat.diye : t.chat.wapis}
                  </p>
                  {e.note && <p className="mt-1 text-sm text-muted">{e.note}</p>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex gap-3 border-t border-line bg-surface p-4">
        <button
          onClick={() => setSheet('issue')}
          className="flex-1 rounded-lg bg-indigo py-3.5 text-base font-semibold text-white"
        >
          {t.entry.issue}
        </button>
        <button
          onClick={() => setSheet('return')}
          className="flex-1 rounded-lg bg-sabz py-3.5 text-base font-semibold text-white"
        >
          {t.entry.return}
        </button>
      </div>

      {sheet && workshop && id && (
        <EntrySheet
          workshopId={workshop.id}
          workerId={id}
          kind={sheet}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  )
}