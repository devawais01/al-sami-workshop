import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'

export type Dress = {
  id: string
  name: string
  photo_path: string | null
}

export function useDresses(workshopId: string | undefined) {
  return useQuery({
    queryKey: ['dresses', workshopId],
    enabled: !!workshopId,
    queryFn: async (): Promise<Dress[]> => {
      const { data, error } = await supabase
        .from('dress')
        .select('id, name, photo_path')
        .eq('workshop_id', workshopId!)
        .order('name')
      if (error) throw error
      return data ?? []
    },
  })
}
export function useDress(id: string | undefined) {
  return useQuery({
    queryKey: ['dress', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dress')
        .select('id, name, photo_path, notes')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data
    },
  })
}