import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'

export type Lot = {
  id: string
  dress_id: string
  dress_name: string
  dress_photo: string | null
  lot_number: string
  status: 'chalu' | 'band'
  total_pieces: number | null
  store: number | null
  issued: number
  returned: number
  pending: number
}

export function useLots(workshopId: string | undefined) {
  return useQuery({
    queryKey: ['lots', workshopId],
    enabled: !!workshopId,
    queryFn: async (): Promise<Lot[]> => {
      const { data, error } = await supabase
        .from('lot_summary')
        .select(
          'lot_id, dress_id, dress_name, dress_photo, lot_number, status, total_pieces, issued, returned, pending',
        )
        .eq('workshop_id', workshopId!)
        .order('dress_name')
      if (error) throw error
      return (data ?? []).map((l) => ({
        id: l.lot_id,
        dress_id: l.dress_id,
        dress_name: l.dress_name,
        dress_photo: l.dress_photo,
        lot_number: l.lot_number,
        status: l.status,
        total_pieces: l.total_pieces,
        store: l.total_pieces == null ? null : l.total_pieces - l.issued,
        issued: l.issued,
        returned: l.returned,
        pending: l.pending,
      }))
    },
  })
}