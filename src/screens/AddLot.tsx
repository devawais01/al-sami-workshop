import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { t } from '../lib/strings'

type Props = { workshopId: string; onClose: () => void }

export default function AddLot({ workshopId, onClose }: Props) {
  const qc = useQueryClient()
  const [number, setNumber] = useState('')
  const [title, setTitle] = useState('')
  const [total, setTotal] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const canSave = number.trim() !== ''

  async function save() {
    setBusy(true)
    setError('')
    const { error } = await supabase.from('lot').insert({
      workshop_id: workshopId,
      lot_number: number.trim(),
      title: title.trim() || null,
      total_pieces: total.trim() ? Number(total) : null,
    })
    setBusy(false)
    if (error) {
      setError(error.code === '23505' ? t.lot.duplicate : error.message)
      return
    }
    qc.invalidateQueries({ queryKey: ['lots'] })
    onClose()
  }

  const field =
    'mt-1 w-full rounded-lg border border-line bg-chalk px-3 py-3 text-base outline-none focus:border-indigo'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-chalk">
      <header className="flex items-center justify-between border-b border-line bg-surface px-5 py-4">
        <button onClick={onClose} className="text-sm text-muted">
          {t.worker.cancel}
        </button>
        <h2 className="font-medium text-ink">{t.lot.add}</h2>
        <button
          onClick={save}
          disabled={!canSave || busy}
          className="text-sm font-semibold text-indigo disabled:opacity-30"
        >
          {busy ? t.worker.saving : t.worker.save}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <label className="block text-sm font-medium text-ink">
            {t.lot.number}{' '}
            <span className="font-normal text-brass">{t.lot.required}</span>
          </label>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className={`${field} nums`}
          />

          <label className="mt-4 block text-sm font-medium text-ink">{t.lot.lotName}</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} />

          <label className="mt-4 block text-sm font-medium text-ink">{t.lot.totalPieces}</label>
          <input
            value={total}
            onChange={(e) => setTotal(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            className={`${field} nums`}
          />
        </div>

        {!canSave && <p className="mt-3 text-sm text-muted">{t.lot.needNumber}</p>}
        {error && <p className="mt-3 text-sm text-brass">{error}</p>}
      </div>
    </div>
  )
}