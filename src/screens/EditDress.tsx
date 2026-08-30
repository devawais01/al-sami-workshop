import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useDress } from '../lib/useDresses'
import { useWorkshop } from '../lib/useWorkshop'
import { useLots } from '../lib/useLots'
import PhotoPicker from '../components/PhotoPicker'
import Photo from '../components/Photo'
import { t } from '../lib/strings'

function LotRow({ lot }: { lot: { id: string; lot_number: string; total_pieces: number | null; issued: number; returned: number; pending: number } }) {
  const qc = useQueryClient()
  const [total, setTotal] = useState(String(lot.total_pieces ?? ''))
  const [err, setErr] = useState('')

  async function commit() {
    const n = total.trim() === '' ? null : Number(total)
    if (n !== null && n < lot.issued) { setErr(t.dress.minTotal); setTotal(String(lot.total_pieces ?? '')); return }
    setErr('')
    if (n === lot.total_pieces) return
    await supabase.from('lot').update({ total_pieces: n }).eq('id', lot.id)
    qc.invalidateQueries({ queryKey: ['lots'] })
  }

  return (
    <li className="rounded-lg bg-chalk px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="nums text-sm font-medium text-ink">Lot {lot.lot_number}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{t.lot.total}</span>
          <input value={total} onChange={(e) => setTotal(e.target.value.replace(/\D/g, ''))} onBlur={commit} inputMode="numeric" className="nums w-16 rounded border border-line bg-surface px-2 py-1 text-center text-sm outline-none focus:border-indigo" />
        </div>
      </div>
      <p className="nums mt-1 text-xs text-muted">{t.lot.issued} {lot.issued} · {t.lot.returned} {lot.returned} · <span className="font-semibold text-brass">{t.lot.pending} {lot.pending}</span></p>
      {err && <p className="mt-1 text-xs text-brass">{err}</p>}
    </li>
  )
}

export default function EditDress() {
  const { id } = useParams()
  const nav = useNavigate()
  const qc = useQueryClient()
  const { data: workshop } = useWorkshop()
  const { data: d } = useDress(id)
  const { data: lots } = useLots(workshop?.id)

  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [photoPath, setPhotoPath] = useState<string | null>(null)
  const [changing, setChanging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!d) return
    setName(d.name ?? '')
    setNotes(d.notes ?? '')
    setPhotoPath(d.photo_path ?? null)
  }, [d])

  const myLots = lots?.filter((l) => l.dress_id === id) ?? []
  const canSave = name.trim() !== ''

  async function save() {
    setBusy(true)
    setError('')
    const { error } = await supabase.from('dress').update({
      name: name.trim(),
      notes: notes.trim() || null,
      photo_path: photoPath,
    }).eq('id', id!)
    setBusy(false)
    if (error) { setError(error.code === '23505' ? t.dress.exists : error.message); return }
    qc.invalidateQueries({ queryKey: ['dress', id] })
    qc.invalidateQueries({ queryKey: ['dresses'] })
    qc.invalidateQueries({ queryKey: ['lots'] })
    nav(-1)
  }
    const field = 'mt-1 w-full rounded-lg border border-line bg-chalk px-3 py-3 text-base outline-none focus:border-indigo'

  return (
    <div className="min-h-screen bg-chalk pb-10">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
        <button onClick={() => nav(-1)} className="text-muted"><ArrowLeft size={22} /></button>
        <p className="font-medium text-ink">{t.dress.edit}</p>
      </header>

      <div className="p-5">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="mb-5 flex flex-col items-center gap-2">
            {changing ? (
              <PhotoPicker bucket="design-photos" workshopId={workshop?.id ?? ''} onUploaded={(p) => { setPhotoPath(p); setChanging(false) }} />
            ) : (
              <Photo bucket="design-photos" path={photoPath} name={name} id={id ?? ''} size={96} rounded={false} />
            )}
            <button onClick={() => setChanging(true)} className="text-sm font-medium text-indigo">{t.edit.changePhoto}</button>
          </div>

          <label className="block text-sm font-medium text-ink">{t.dress.name}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={field} />

          <label className="mt-4 block text-sm font-medium text-ink">{t.worker.notes}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={field} />

          <button onClick={save} disabled={!canSave || busy} className="mt-6 w-full rounded-lg bg-indigo py-3 text-base font-semibold text-white disabled:opacity-30">{busy ? t.worker.saving : t.edit.save}</button>
          <button onClick={() => nav(-1)} className="mt-2 w-full py-2.5 text-sm font-medium text-muted">{t.edit.back}</button>
        </div>

        {error && <p className="mt-3 text-sm text-brass">{error}</p>}

        <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm font-medium text-ink">{t.dress.lotsOf}</p>
          <ul className="mt-3 space-y-2">
            {myLots.map((l) => <LotRow key={l.id} lot={l} />)}
          </ul>
        </div>
      </div>
    </div>
  )
}