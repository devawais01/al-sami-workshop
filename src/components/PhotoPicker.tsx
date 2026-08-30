import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { uploadPhoto } from '../lib/photo'

type Props = { bucket: string; workshopId: string; onUploaded: (path: string) => void; current?: string | null }

export default function PhotoPicker({ bucket, workshopId, onUploaded, current }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setBusy(true)
    try {
      const path = await uploadPhoto(file, bucket, workshopId)
      onUploaded(path)
    } catch {
      setPreview(null)
    }
    setBusy(false)
  }

  return (
    <div className="flex justify-center">
      <input ref={ref} type="file" accept="image/*" capture="environment" onChange={handle} className="hidden" />
      <button onClick={() => ref.current?.click()} disabled={busy} className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-full border-2 border-dashed border-line bg-chalk">
        {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <Camera size={26} className="text-muted" />}
        {busy && <div className="absolute inset-0 grid place-items-center bg-black/40 text-xs text-white">...</div>}
      </button>
    </div>
  )
}