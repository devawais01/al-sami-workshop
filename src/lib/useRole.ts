import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'

export type Member = { id: string; user_id: string; role: string; email: string }

export function useMyRole() {
  return useQuery({
    queryKey: ['myRole'],
    staleTime: 60_000,
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return null
      const { data } = await supabase
        .from('workshop_member')
        .select('role')
        .eq('user_id', u.user.id)
        .maybeSingle()
      return data?.role ?? null
    },
  })
}

export function useMembers(enabled: boolean) {
  return useQuery({
    queryKey: ['members'],
    enabled,
    queryFn: async (): Promise<Member[]> => {
      const { data, error } = await supabase.rpc('list_members')
      if (error) throw error
      return (data ?? []) as Member[]
    },
  })
}