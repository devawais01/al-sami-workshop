import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, MessageCircle } from 'lucide-react'
import { useWorker } from '../lib/useWorkers'
import { useEntries, useWorkerPending } from '../lib/useEntries'
import { t } from '../lib/strings'
import Photo from '../components/Photo'

function waLink(phone: string) {
  const digits = phone.replace(/\D/g, '')
  const intl = digits.startsWith('0') ? '92' + digits.slice(1) : digits
  return `https://wa.me/${intl}`
}

export default function WorkerProfile() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data: w } = useWorker(id)
  const { data: entries } = useEntries(id)
  const { data: pending } = useWorkerPending(id)

  const issued = entries?.filter((e) => e.kind === 'issue').reduce((s, e) => s + e.qty, 0) ?? 0
  const returned = entries?.filter((e) => e.kind === 'return').reduce((s, e) => s + e.qty, 0) ?? 0

  const rows = [
    { label: t.worker.phone, value: w?.phone },
    { label: t.worker.cnic, value: w?.cnic },
    { label: t.worker.address, value: w?.address },
    { label: t.worker.notes, value: w?.notes },
  ]

  return (
    <div className="min-h-screen bg-chalk pb-10">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
        <button onClick={() => nav(-1)} className="text-muted">
          <ArrowLeft size={22} />
        </button>
        <p className="font-medium text-ink">{t.profile.title}</p>
      </header>

      <div className="p-5">
        <div className="rounded-2xl border border-line bg-surface p-5 text-center">
          <div className="mb-3 flex justify-center"><Photo bucket="worker-photos" path={w?.photo_path ?? null} name={w?.name ?? ''} id={id ?? ''} size={88} /></div>
          <p className="font-display text-2xl text-indigo">{w?.name ?? ''}</p>
          <p className="nums mt-1 text-sm text-muted">{w?.phone ?? ''}</p>

          {w?.phone && (
  <div className="mt-4 flex gap-3">
    <a
      href={`tel:${w.phone}`}
      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line py-2.5 text-sm font-medium text-ink"
    >
      <Phone size={16} /> {t.profile.call}
    </a>

    <a
      href={waLink(w.phone)}
      target="_blank"
      rel="noreferrer"
      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-sabz py-2.5 text-sm font-medium text-white"
    >
      <MessageCircle size={16} /> {t.profile.whatsapp}
    </a>
  </div>
)}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: t.entry.summary, value: issued, color: 'text-indigo' },
            { label: t.entry.summaryReturned, value: returned, color: 'text-sabz' },
            { label: t.entry.summaryPending, value: issued - returned, color: 'text-brass' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-surface p-3 text-center">
              <p className="text-xs text-muted">{s.label}</p>
              <p className={`nums mt-0.5 text-xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm font-medium text-ink">{t.profile.holding}</p>
          {pending?.length ? (
            <ul className="mt-3 space-y-2">
              {pending.map((p) => (
                <li
                  key={p.lot_id}
                  className="flex items-center justify-between rounded-lg bg-chalk px-3 py-2.5"
                >
                  <span className="text-sm text-ink">
                    {p.dress_name} — Lot {p.lot_number}
                  </span>
                  <span className="nums text-sm font-semibold text-brass">{p.pending}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">{t.profile.nothing}</p>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm font-medium text-ink">{t.profile.details}</p>
          <dl className="mt-3 space-y-3">
            {rows.map((r) => (
              <div key={r.label}>
                <dt className="text-xs text-muted">{r.label}</dt>
                <dd className="nums mt-0.5 text-sm text-ink">
                  {r.value || t.profile.noValue}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}