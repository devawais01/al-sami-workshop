import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Minus, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLots } from '../lib/useLots'
import { useWorkerPending } from '../lib/useEntries'
import { t } from '../lib/strings'
import Photo from '../components/Photo'

type Props = {
  workshopId: string
  workerId: string
  kind: 'issue' | 'return'
  onClose: () => void
}

type Option = {
  id: string
  photo: string | null
  dressId: string
  dressName: string
  label: string
  max: number | null
  total: number | null
  store: number | null
}

export default function EntrySheet({ workshopId, workerId, kind, onClose }: Props) {
  const qc = useQueryClient()
  const { data: lots } = useLots(workshopId)
  const { data: pending } = useWorkerPending(workerId)

  const [lotId, setLotId] = useState('')
  const [qtyText, setQtyText] = useState('1')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const isReturn = kind === 'return'
  const qty = Number(qtyText) || 0

  const options: Option[] = isReturn
    ? (pending ?? []).map((p) => ({
      id: p.lot_id,
      label: `${p.dress_name} — Lot ${p.lot_number}`,
      photo: p.dress_photo,
      dressId: p.lot_id,
      dressName: p.dress_name,
      max: p.pending,
      total: null,
      store: null,
    }))
    : (lots ?? [])
      .filter((l) => l.status === 'chalu')
      .map((l) => ({
        id: l.id,
        label: `${l.dress_name} — Lot ${l.lot_number}`,
        photo: l.dress_photo,
        dressId: l.dress_id,
        dressName: l.dress_name,
        max: l.store,
        total: l.total_pieces,
        store: l.store,
      }))

  const selected = options.find((o) => o.id === lotId)
  const overMax = selected?.max != null && qty > selected.max
  const canSave = lotId !== '' && qty >= 1 && !overMax

  function pick(o: Option) {
    setLotId(o.id)
    if (isReturn && o.max != null) setQtyText(String(o.max))
  }

  function bump(delta: number) {
    const next = Math.max(1, qty + delta)
    setQtyText(String(selected?.max != null ? Math.min(next, selected.max) : next))
  }

  async function save() {
    setBusy(true)
    setError('')
    const { error } = await supabase.from('entry').insert({
      workshop_id: workshopId,
      worker_id: workerId,
      lot_id: lotId,
      kind,
      qty,
      note: note.trim() || null,
    })
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    qc.invalidateQueries({ queryKey: ['entries', workerId] })
    qc.invalidateQueries({ queryKey: ['pending', workerId] })
    qc.invalidateQueries({ queryKey: ['workers'] })
    qc.invalidateQueries({ queryKey: ['lots'] })
    onClose()
  }

  const accent = isReturn ? 'bg-sabz' : 'bg-indigo'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-chalk">
      <header className="border-b border-line bg-surface px-5 py-4">
        <h2 className="text-center font-medium text-ink">
          {isReturn ? t.entry.return : t.entry.issue}
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm font-medium text-ink">{t.entry.pickLot}</p>

          {options.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              {isReturn ? t.entry.nothingPending : t.entry.noLots}
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {options.map((o) => (
                <button
                  key={o.id}
                  onClick={() => pick(o)}
                  className={`w-full rounded-lg border px-3 py-3 text-left ${lotId === o.id
                      ? 'border-indigo bg-indigo-soft'
                      : 'border-line bg-chalk'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Photo bucket="design-photos" path={o.photo} name={o.dressName} id={o.dressId} size={40} rounded={false} />
                    <div className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink">{o.label}</span>
                      <span className="nums mt-0.5 flex gap-3 text-xs text-muted">
                        {isReturn ? <span className="text-brass">{o.max} {t.entry.pendingLabel}</span> : <><span>{t.lot.total} {o.total ?? '—'}</span><span className={o.store === 0 ? 'text-brass' : 'text-sabz'}>{t.lot.store} {o.store ?? '—'}</span></>}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {lotId && (
            <>
              <p className="mt-5 text-sm font-medium text-ink">{t.entry.qty}</p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => bump(-1)}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line bg-chalk"
                >
                  <Minus size={20} />
                </button>
                <input
                  value={qtyText}
                  onChange={(e) => setQtyText(e.target.value.replace(/\D/g, ''))}
                  onFocus={(e) => e.target.select()}
                  onBlur={() => { if (qty < 1) setQtyText('1') }}
                  inputMode="numeric"
                  className="nums w-24 rounded-lg border border-line bg-chalk py-3 text-center text-2xl font-semibold outline-none focus:border-indigo"
                />
                <button
                  onClick={() => bump(1)}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line bg-chalk"
                >
                  <Plus size={20} />
                </button>
                <span className="text-sm text-muted">{t.entry.dress}</span>
              </div>

              {overMax && (
                <p className="nums mt-2 text-sm text-brass">
                  {isReturn ? t.entry.overReturn : `${t.lot.store} ${selected?.max}`}
                </p>
              )}

              <label className="mt-5 block text-sm font-medium text-ink">
                {t.entry.note}
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t.entry.notePlaceholder}
                className="mt-1 w-full rounded-lg border border-line bg-chalk px-3 py-3 text-base outline-none focus:border-indigo placeholder:text-muted/50"
              />
            </>
          )}

          <button
            onClick={save}
            disabled={!canSave || busy}
            className={`mt-6 w-full rounded-lg ${accent} py-3 text-base font-semibold text-white disabled:opacity-30`}
          >
            {busy ? t.worker.saving : t.entry.save}
          </button>

          <button
            onClick={onClose}
            className="mt-2 w-full py-2.5 text-sm font-medium text-muted"
          >
            {t.entry.back}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-brass">{error}</p>}
      </div>
    </div>
  )
}