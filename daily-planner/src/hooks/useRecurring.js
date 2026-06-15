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
    mutationFn: async ({ goal_id, title, default_mode, default_start, default_end, start_date, end_date }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('recurring_tasks')
        .insert({ user_id: user.id, goal_id, title, default_mode, default_start, default_end,
                  start_date: start_date ?? null, end_date: end_date ?? null })
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

// Deactivates a recurring template. The current day's task is kept as a one-off
// (is_recurring cleared). All future instances (planned_date > from_date) are archived
// so they vanish from every view immediately.
export function useStopRecurringFrom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, from_date }) => {
      const { error: tErr } = await supabase
        .from('recurring_tasks').update({ active: false }).eq('id', id)
      if (tErr) throw tErr
      // Keep today's instance but strip its recurring link
      const { error: pErr } = await supabase.from('tasks')
        .update({ is_recurring: false, recurring_id: null })
        .eq('recurring_id', id).eq('planned_date', from_date)
      if (pErr) throw pErr
      // Archive every future instance so they disappear from the plan
      const { error: aErr } = await supabase.from('tasks')
        .update({ archived: true })
        .eq('recurring_id', id).gt('planned_date', from_date)
      if (aErr) throw aErr
    },
    onSuccess: (_, { goal_id }) => {
      qc.invalidateQueries({ queryKey: ['recurring', goal_id] })
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
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
