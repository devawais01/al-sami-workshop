import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'

export type Entry = {
  id: string
  kind: 'issue' | 'return'
  qty: number
  note: string | null
  happened_at: string
  lot_id: string
  lot_number: string
  dress_name: string
}

export type Pending = {
  lot_id: string
  lot_number: string
  dress_name: string
  dress_photo: string | null
  pending: number
}

export function useEntries(workerId: string | undefined) {
  return useQuery({
    queryKey: ['entries', workerId],
    enabled: !!workerId,
    queryFn: async (): Promise<Entry[]> => {
      const { data, error } = await supabase
        .from('entry')
        .select('id, kind, qty, note, happened_at, lot_id, lot:lot_id(lot_number, dress:dress_id(name))')
        .eq('worker_id', workerId!)
        .is('deleted_at', null)
        .order('happened_at')
      if (error) throw error

      return (data ?? []).map((e) => {
        const lot = e.lot as unknown as { lot_number: string; dress: { name: string } }
        return {
          id: e.id,
          kind: e.kind,
          qty: e.qty,
          note: e.note,
          happened_at: e.happened_at,
          lot_id: e.lot_id,
          lot_number: lot?.lot_number ?? '',
          dress_name: lot?.dress?.name ?? '',
        }
      })
    },
  })
}

export function useWorkerPending(workerId: string | undefined) {
  return useQuery({
    queryKey: ['pending', workerId],
    enabled: !!workerId,
    queryFn: async (): Promise<Pending[]> => {
      const { data, error } = await supabase
        .from('worker_balance')
        .select(
          'lot_id, pending, lot:lot_id(lot_number, dress:dress_id(name, photo_path))'
        )
        .eq('worker_id', workerId!)
        .gt('pending', 0)

      if (error) throw error

      return (data ?? []).map((r) => {
        const lot = r.lot as unknown as {
          lot_number: string
          dress: {
            name: string
            photo_path: string | null
          }
        }

        return {
          lot_id: r.lot_id,
          pending: r.pending,
          lot_number: lot?.lot_number ?? '',
          dress_name: lot?.dress?.name ?? '',
          dress_photo: lot?.dress?.photo_path ?? null,
        }
      })
    },
  })
}