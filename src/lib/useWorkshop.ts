import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'

export function useWorkshop() {
  return useQuery({
    queryKey: ['workshop'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workshop')
        .select('id, name')
        .limit(1)
        .single()
      if (error) throw error
      return data
    },
  })
}