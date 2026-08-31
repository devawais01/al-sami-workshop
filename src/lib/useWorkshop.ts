import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import { t } from './strings'

export function useWorkshop() {
  return useQuery({
    queryKey: ['workshop'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workshop')
        .select('id, name')
                .limit(1)
        .maybeSingle()
      if (error) throw error
      if (!data) throw new Error(t.common.noWorkshop)
      return data
    },
  })
}