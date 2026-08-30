import { useEffect, useState } from 'react'
import { signedUrl } from '../lib/photo'

const COLORS = ['#263A6B', '#1F6B4D', '#A87A2C', '#6E4B7A', '#2C6E7A']

export function colorFor(id: string) {
  let sum = 0
  for (const ch of id) sum += ch.charCodeAt(0)
  return COLORS[sum % COLORS.length]
}

type Props = { bucket: string; path: string | null; name: string; id: string; size?: number; rounded?: boolean }

export default function Photo({ bucket, path, name, id, size = 48, rounded = true }: Props) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (path) signedUrl(bucket, path).then(setUrl)
    else setUrl('')
  }, [bucket, path])

  const shape = rounded ? 'rounded-full' : 'rounded-lg'
  const style = { width: size, height: size }

  if (url) return <img src={url} alt={name} style={style} className={`${shape} shrink-0 object-cover`} />

  return (
    <div style={{ ...style, backgroundColor: colorFor(id), fontSize: size * 0.4 }} className={`${shape} grid shrink-0 place-items-center font-semibold text-white`}>
      {name.trim().charAt(0).toUpperCase() || '?'}
    </div>
  )
}