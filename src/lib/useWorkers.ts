import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'

export type Worker = {
  id: string
  name: string
  phone: string
  photo_path: string | null
  pending: number
}

export function useWorkers(workshopId: string | undefined) {
  return useQuery({
    queryKey: ['workers', workshopId],
    enabled: !!workshopId,
    queryFn: async (): Promise<Worker[]> => {
      const { data: workers, error } = await supabase
        .from('worker')
        .select('id, name, phone, photo_path')
        .eq('workshop_id', workshopId!)
        .eq('is_active', true)
        .order('name')
      if (error) throw error

      const { data: pending, error: pErr } = await supabase
        .from('worker_pending')
        .select('worker_id, pending')
      if (pErr) throw pErr

      const map = new Map(pending?.map((p) => [p.worker_id, p.pending]) ?? [])
      return (workers ?? []).map((w) => ({ ...w, pending: map.get(w.id) ?? 0 }))
    },
  })
}