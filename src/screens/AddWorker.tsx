import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { t } from '../lib/strings'
import PhotoPicker from '../components/PhotoPicker'

type Props = { workshopId: string; onClose: () => void }

export default function AddWorker({ workshopId, onClose }: Props) {
    const qc = useQueryClient()
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [cnic, setCnic] = useState('')
    const [address, setAddress] = useState('')
    const [notes, setNotes] = useState('')
    const [photoPath, setPhotoPath] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    const canSave = name.trim() !== '' && phone.trim() !== ''

    async function save() {
        setBusy(true)
        setError('')
        const { error } = await supabase.from('worker').insert({
            workshop_id: workshopId,
            name: name.trim(),
            phone: phone.trim(),
            cnic: cnic.trim() || null,
            address: address.trim() || null,
            notes: notes.trim() || null,
            photo_path: photoPath,
        })
        setBusy(false)
        if (error) {
            setError(error.message)
            return
        }
        qc.invalidateQueries({ queryKey: ['workers'] })
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
                <h2 className="font-medium text-ink">{t.worker.add}</h2>
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
                    <div className="mb-5">
                        <PhotoPicker bucket="worker-photos" workshopId={workshopId} onUploaded={setPhotoPath} />
                    </div>
                    <label className="block text-sm font-medium text-ink">
                        {t.worker.name}{' '}
                        <span className="font-normal text-brass">{t.worker.required}</span>
                    </label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className={field} />

                    <label className="mt-4 block text-sm font-medium text-ink">
                        {t.worker.phone}{' '}
                        <span className="font-normal text-brass">{t.worker.required}</span>
                    </label>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        inputMode="tel"
                        className={`${field} nums`}
                    />

                    <label className="mt-4 block text-sm font-medium text-ink">{t.worker.cnic}</label>
                    <input
                        value={cnic}
                        onChange={(e) => setCnic(e.target.value)}
                        inputMode="numeric"
                        className={`${field} nums`}
                    />

                    <label className="mt-4 block text-sm font-medium text-ink">{t.worker.address}</label>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={2}
                        className={field}
                    />

                    <label className="mt-4 block text-sm font-medium text-ink">{t.worker.notes}</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className={field}
                    />
                </div>

                {!canSave && (
                    <p className="mt-3 text-sm text-muted">{t.worker.needNameAndPhone}</p>
                )}
                {error && <p className="mt-3 text-sm text-brass">{error}</p>}
            </div>
        </div>
    )
}