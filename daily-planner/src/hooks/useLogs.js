import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'

export function useLog(date) {
  return useQuery({
    queryKey: ['log', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('log_date', date)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!date,
  })
}

export function useUpsertLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ log_date, wins, blockers, tomorrow_focus, goal_ratings }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('logs')
        .upsert(
          { user_id: user.id, log_date, wins: wins || null, blockers: blockers || null, tomorrow_focus: tomorrow_focus || null, goal_ratings },
          { onConflict: 'user_id,log_date' },
        )
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_, { log_date }) => qc.invalidateQueries({ queryKey: ['log', log_date] }),
  })
}
