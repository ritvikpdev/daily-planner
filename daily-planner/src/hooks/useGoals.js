import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase.from('goals').select('*').order('sort_order')
      if (error) throw error
      return data
    },
  })
}

export function useAddGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ title, description, color, icon, target_date }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('goals')
        .insert({ user_id: user.id, title, description, color, icon, target_date })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useUpdateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...changes }) => {
      const { data, error } = await supabase
        .from('goals')
        .update(changes)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useSetGoalStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, completion_note }) => {
      const patch = { status, completion_note: completion_note ?? null }
      if (status === 'completed') patch.completed_at = new Date().toISOString()
      const { data, error } = await supabase.from('goals').update(patch).eq('id', id).select().single()
      if (error) throw error
      if (status === 'archived' || status === 'completed') {
        await supabase.from('tasks').update({ archived: true }).eq('goal_id', id).eq('archived', false)
      }
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useReorderGoals() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (orderedItems) => {
      const updates = orderedItems.map(({ id, sort_order }) =>
        supabase.from('goals').update({ sort_order }).eq('id', id),
      )
      const failed = (await Promise.all(updates)).find((r) => r.error)
      if (failed) throw failed.error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}