import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { t } from '../lib/strings'

type Props = {
  label: string
  confirm: string
  count?: number
  onDelete: () => Promise<void>
}

export default function DeleteButton({ label, confirm, count, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function go() {
    setBusy(true)
    setErr('')
    try {
      await onDelete()
    } catch (e) {
      setErr((e as Error).message)
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-out py-2.5 text-sm font-medium text-out">
        <Trash2 size={16} /> {label}
      </button>
    )
  }

  return (
    <div className="mt-3 rounded-lg border border-out bg-out-soft p-4">
      <p className="text-sm text-ink">{confirm}</p>
      {count !== undefined && count > 0 && (
        <p className="nums mt-1 text-sm font-semibold text-out">{count} {t.del.warnEntries}</p>
      )}

      {err && <p className="mt-2 text-sm text-out">{err}</p>}

      <div className="mt-4 flex gap-2">
        <button onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-line bg-surface py-2.5 text-sm font-medium text-muted">
          {t.edit.back}
        </button>
        <button onClick={go} disabled={busy} className="flex-1 rounded-lg bg-out py-2.5 text-sm font-semibold text-white disabled:opacity-40">
          {busy ? t.del.deleting : t.del.yes}
        </button>
      </div>
    </div>
  )
}