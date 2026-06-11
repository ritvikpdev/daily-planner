import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'

export function useRecurring(goalId) {
  return useQuery({
    queryKey: ['recurring', goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at')
      if (error) throw error
      return data
    },
    enabled: Boolean(goalId),
  })
}

export function useAddRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ goal_id, title, default_mode, default_start, default_end }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('recurring_tasks')
        .insert({ user_id: user.id, goal_id, title, default_mode, default_start, default_end })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ['recurring', data.goal_id] }),
  })
}

export function useUpdateRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...changes }) => {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .update(changes)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ['recurring', data.goal_id] }),
  })
}

export function useDeleteRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .delete()
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ['recurring', data.goal_id] }),
  })
}
