import { useEffect, useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { uploadPhoto, signedUrl } from '../lib/photo'

type Props = {
  bucket: string
  workshopId: string
  onUploaded: (path: string) => void
  current?: string | null
  rounded?: boolean
  size?: number
}

export default function PhotoPicker({ bucket, workshopId, onUploaded, current, rounded = true, size = 96 }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (current) signedUrl(bucket, current).then(setPreview)
  }, [bucket, current])

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
    e.target.value = ''
  }

  const shape = rounded ? 'rounded-full' : 'rounded-lg'

  return (
    <div className="flex justify-center">
      <input ref={ref} type="file" accept="image/*" onChange={handle} className="hidden" />
      <button onClick={() => ref.current?.click()} disabled={busy} style={{ width: size, height: size }} className={`relative grid place-items-center overflow-hidden border-2 border-dashed border-line bg-chalk ${shape}`}>
        {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <Camera size={26} className="text-muted" />}
        {busy && <div className="absolute inset-0 grid place-items-center bg-black/40 text-xs text-white">...</div>}
      </button>
    </div>
  )
}