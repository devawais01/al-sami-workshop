import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useWorker } from '../lib/useWorkers'
import { useWorkshop } from '../lib/useWorkshop'
import PhotoPicker from '../components/PhotoPicker'
import Photo from '../components/Photo'
import { t } from '../lib/strings'

export default function EditWorker() {
  const { id } = useParams()
  const nav = useNavigate()
  const qc = useQueryClient()
  const { data: workshop } = useWorkshop()
  const { data: w } = useWorker(id)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cnic, setCnic] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [photoPath, setPhotoPath] = useState<string | null>(null)
  const [changing, setChanging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!w) return
    setName(w.name ?? '')
    setPhone(w.phone ?? '')
    setCnic(w.cnic ?? '')
    setAddress(w.address ?? '')
    setNotes(w.notes ?? '')
    setPhotoPath(w.photo_path ?? null)
  }, [w])

  const canSave = name.trim() !== '' && phone.trim() !== ''

  async function save() {
    setBusy(true)
    setError('')
    const { error } = await supabase.from('worker').update({
      name: name.trim(),
      phone: phone.trim(),
      cnic: cnic.trim() || null,
      address: address.trim() || null,
      notes: notes.trim() || null,
      photo_path: photoPath,
    }).eq('id', id!)
    setBusy(false)
    if (error) { setError(error.message); return }
    qc.invalidateQueries({ queryKey: ['worker', id] })
    qc.invalidateQueries({ queryKey: ['workers'] })
    nav(-1)
  }
    const field = 'mt-1 w-full rounded-lg border border-line bg-chalk px-3 py-3 text-base outline-none focus:border-indigo'

  return (
    <div className="min-h-screen bg-chalk pb-10">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
        <button onClick={() => nav(-1)} className="text-muted"><ArrowLeft size={22} /></button>
        <p className="font-medium text-ink">{t.edit.worker}</p>
      </header>

      <div className="p-5">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="mb-5 flex flex-col items-center gap-2">
            {changing ? (
              <PhotoPicker bucket="worker-photos" workshopId={workshop?.id ?? ''} onUploaded={(p) => { setPhotoPath(p); setChanging(false) }} />
            ) : (
              <Photo bucket="worker-photos" path={photoPath} name={name} id={id ?? ''} size={88} />
            )}
            <button onClick={() => setChanging(true)} className="text-sm font-medium text-indigo">{t.edit.changePhoto}</button>
          </div>

          <label className="block text-sm font-medium text-ink">{t.worker.name}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={field} />

          <label className="mt-4 block text-sm font-medium text-ink">{t.worker.phone}</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className={`${field} nums`} />

          <label className="mt-4 block text-sm font-medium text-ink">{t.worker.cnic}</label>
          <input value={cnic} onChange={(e) => setCnic(e.target.value)} inputMode="numeric" className={`${field} nums`} />

          <label className="mt-4 block text-sm font-medium text-ink">{t.worker.address}</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className={field} />

          <label className="mt-4 block text-sm font-medium text-ink">{t.worker.notes}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={field} />

          <button onClick={save} disabled={!canSave || busy} className="mt-6 w-full rounded-lg bg-indigo py-3 text-base font-semibold text-white disabled:opacity-30">{busy ? t.worker.saving : t.edit.save}</button>
          <button onClick={() => nav(-1)} className="mt-2 w-full py-2.5 text-sm font-medium text-muted">{t.edit.back}</button>
        </div>

        {error && <p className="mt-3 text-sm text-brass">{error}</p>}
      </div>
    </div>
  )
}