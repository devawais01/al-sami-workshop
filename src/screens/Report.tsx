import { useState } from 'react'
import { useWorkshop } from '../lib/useWorkshop'
import { useReport, type Row } from '../lib/useReport'
import { t } from '../lib/strings'

const iso = (d: Date) => d.toISOString().slice(0, 10)
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d) }

const PRESETS = [
  { key: 'd0', label: t.report.today, days: 0 },
  { key: 'w1', label: t.report.week1, days: 7 },
  { key: 'w2', label: t.report.week2, days: 14 },
  { key: 'm1', label: t.report.month1, days: 30 },
]

function Section({ title, rows }: { title: string; rows: Row[] }) {
  const [open, setOpen] = useState(true)
  if (!rows.length) return null
  return (
    <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between">
        <span className="text-sm font-medium text-ink">{title}</span>
        <span className="text-xs text-muted">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <ul className="mt-3 space-y-2">
          {rows.map((r) => (
            <li key={r.key} className="flex items-center justify-between gap-3 rounded-lg bg-chalk px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">{r.label}</p>
                {r.sub && <p className="nums text-xs text-muted">{r.sub}</p>}
              </div>
              <p className="nums shrink-0 text-xs text-muted"><span className="font-semibold text-indigo">{r.issued}</span> {t.lot.issued} · <span className="font-semibold text-sabz">{r.returned}</span> {t.lot.returned}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Report() {
  const { data: workshop } = useWorkshop()
  const [preset, setPreset] = useState('m1')
  const [from, setFrom] = useState(daysAgo(30))
  const [to, setTo] = useState(iso(new Date()))
  const { data, isLoading } = useReport(workshop?.id, from, to)

  function choose(key: string, days?: number) {
    setPreset(key)
    if (days != null) { setFrom(daysAgo(days)); setTo(iso(new Date())) }
  }

  const field = 'mt-1 w-full rounded-lg border border-line bg-chalk px-3 py-2.5 text-sm outline-none focus:border-indigo'

  return (
    <div className="min-h-screen bg-chalk pb-24">
      <header className="sticky top-0 z-10 border-b border-line bg-surface px-5 py-4">
        <h1 className="font-display text-2xl text-indigo">{t.report.title}</h1>
      </header>

      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.key} onClick={() => choose(p.key, p.days)} className={`rounded-full border px-3 py-1.5 text-sm ${preset === p.key ? 'border-indigo bg-indigo text-white' : 'border-line bg-surface text-ink'}`}>{p.label}</button>
          ))}
          <button onClick={() => choose('custom')} className={`rounded-full border px-3 py-1.5 text-sm ${preset === 'custom' ? 'border-indigo bg-indigo text-white' : 'border-line bg-surface text-ink'}`}>{t.report.custom}</button>
        </div>

        {preset === 'custom' && (
          <div className="mt-3 flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted">{t.report.from}</label>
               <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={field} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted">{t.report.to}</label>
              <input type="date" value={to} min={from} max={iso(new Date())} onChange={(e) => setTo(e.target.value)} className={field} />
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-line bg-surface p-4 text-center">
            <p className="text-xs text-muted">{t.report.totalIssued}</p>
            <p className="nums mt-0.5 text-2xl font-semibold text-indigo">{data?.issued ?? 0}</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4 text-center">
            <p className="text-xs text-muted">{t.report.totalReturned}</p>
            <p className="nums mt-0.5 text-2xl font-semibold text-sabz">{data?.returned ?? 0}</p>
          </div>
        </div>

        {isLoading && <p className="mt-4 text-sm text-muted">{t.common.loading}</p>}
        {!isLoading && !data?.byWorker.length && <p className="mt-4 text-sm text-muted">{t.report.empty}</p>}

        <Section title={t.report.byWorker} rows={data?.byWorker ?? []} />
        <Section title={t.report.byDress} rows={data?.byDress ?? []} />
      </div>
    </div>
  )
}