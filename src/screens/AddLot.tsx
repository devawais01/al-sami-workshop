import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useDresses } from '../lib/useDresses'
import { t } from '../lib/strings'

type Props = { workshopId: string; onClose: () => void }

const norm = (s: string) => s.trim().toLowerCase()

export default function AddLot({ workshopId, onClose }: Props) {
  const qc = useQueryClient()
  const { data: dresses } = useDresses(workshopId)
  const [dressName, setDressName] = useState('')
  const [number, setNumber] = useState('')
  const [total, setTotal] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const canSave = dressName.trim() !== '' && number.trim() !== ''

  const existing = dresses?.find((d) => norm(d.name) === norm(dressName))

  async function findOrCreateDress(): Promise<string> {
    const name = dressName.trim()

    const { data: found } = await supabase
      .from('dress')
      .select('id')
      .eq('workshop_id', workshopId)
      .ilike('name', name)
      .maybeSingle()

    if (found) return found.id

    const { data, error } = await supabase
      .from('dress')
      .insert({ workshop_id: workshopId, name })
      .select('id')
      .single()

    if (error) {
      // Someone created it between our check and insert — fetch theirs.
      if (error.code === '23505') {
        const { data: retry } = await supabase
          .from('dress')
          .select('id')
          .eq('workshop_id', workshopId)
          .ilike('name', name)
          .single()
        if (retry) return retry.id
      }
      throw error
    }
    return data.id
  }

  async function save() {
    setBusy(true)
    setError('')
    try {
      const dressId = await findOrCreateDress()

      const { error } = await supabase.from('lot').insert({
        workshop_id: workshopId,
        dress_id: dressId,
        lot_number: number.trim(),
        total_pieces: total.trim() ? Number(total) : null,
      })
      if (error) throw error

      qc.invalidateQueries({ queryKey: ['lots'] })
      qc.invalidateQueries({ queryKey: ['dresses'] })
      onClose()
    } catch (e) {
      const err = e as { code?: string; message: string }
      setError(err.code === '23505' ? t.lot.duplicate : err.message)
    } finally {
      setBusy(false)
    }
  }

  const field =
    'mt-1 w-full rounded-lg border border-line bg-chalk px-3 py-3 text-base outline-none focus:border-indigo placeholder:text-muted/50'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-chalk">
      <header className="border-b border-line bg-surface px-5 py-4">
        <h2 className="text-center font-medium text-ink">{t.lot.add}</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="rounded-2xl border border-line bg-surface p-5">
          {dresses && dresses.length > 0 && (
            <div className="mb-5">
              <p className="text-xs text-muted">{t.dress.recent}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {dresses.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDressName(d.name)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      norm(dressName) === norm(d.name)
                        ? 'border-indigo bg-indigo text-white'
                        : 'border-line bg-chalk text-ink'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="block text-sm font-medium text-ink">
            {t.dress.name}{' '}
            <span className="font-normal text-brass">{t.lot.required}</span>
          </label>
          <input
            value={dressName}
            onChange={(e) => setDressName(e.target.value)}
            placeholder={t.dress.placeholder}
            className={field}
          />
          {existing && <p className="mt-1.5 text-xs text-sabz">{t.dress.exists}</p>}

          <label className="mt-5 block text-sm font-medium text-ink">
            {t.lot.number}{' '}
            <span className="font-normal text-brass">{t.lot.required}</span>
          </label>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder={t.lot.numberPlaceholder}
            className={`${field} nums`}
          />

          <label className="mt-5 block text-sm font-medium text-ink">
            {t.lot.totalPieces}
          </label>
          <input
            value={total}
            onChange={(e) => setTotal(e.target.value.replace(/\D/g, ''))}
            placeholder={t.lot.totalPlaceholder}
            inputMode="numeric"
            className={`${field} nums`}
          />

          <button
            onClick={save}
            disabled={!canSave || busy}
            className="mt-6 w-full rounded-lg bg-indigo py-3 text-base font-semibold text-white disabled:opacity-30"
          >
            {busy ? t.worker.saving : t.lot.save}
          </button>

          <button
            onClick={onClose}
            className="mt-2 w-full py-2.5 text-sm font-medium text-muted"
          >
            {t.lot.back}
          </button>
        </div>

        {!canSave && <p className="mt-3 text-sm text-muted">{t.lot.needFields}</p>}
        {error && <p className="mt-3 text-sm text-brass">{error}</p>}
      </div>
    </div>
  )
}