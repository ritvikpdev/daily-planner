import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'
import { todayLocal, previousDay, dateRange } from '../utils/dateUtils.js'

const cutoffDate = (tz) => previousDay(previousDay(previousDay(todayLocal(tz))))

function createdAtLocalDate(isoString, tz) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date(isoString))
}

async function generateRecurring(date, tasks, tz) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data: tpl = [] } = await supabase.from('recurring_tasks').select('*').eq('user_id', user.id).eq('active', true)
  const seen = new Set(tasks.map((t) => t.recurring_id).filter(Boolean))
  // Only generate an instance for a template if the template existed on `date`
  // (i.e. its created_at local date is on or before `date`).
  const missing = tpl.filter((t) => !seen.has(t.id) && createdAtLocalDate(t.created_at, tz) <= date)
  if (!missing.length) return tasks
  const { data: added = [] } = await supabase.from('tasks').insert(missing.map((t) => ({
    user_id: user.id, goal_id: t.goal_id, title: t.title, mode: t.default_mode,
    planned_date: date, start_time: t.default_start ?? null, end_time: t.default_end ?? null,
    done: false, is_recurring: true, recurring_id: t.id,
  }))).select()
  return [...tasks, ...added]
}

export function useTasksForDate(date, tz) {
  return useQuery({
    queryKey: ['tasks', date],
    queryFn: async () => {
      const { data: tasks, error } = await supabase.from('tasks').select('*').eq('planned_date', date).eq('archived', false)
      if (error) throw error
      return generateRecurring(date, tasks ?? [], tz)
    },
    enabled: Boolean(date),
  })
}

export function useTasksForRange(startDate, endDate, tz) {
  return useQuery({
    queryKey: ['tasks', 'range', startDate, endDate],
    queryFn: async () => {
      const { data: tasks, error } = await supabase.from('tasks').select('*')
        .gte('planned_date', startDate).lte('planned_date', endDate).eq('archived', false)
      if (error) throw error
      const today = todayLocal(tz)
      let all = tasks ?? []
      for (const date of dateRange(startDate, endDate)) {
        if (date > today) continue
        const forDate = all.filter((t) => t.planned_date === date)
        const generated = await generateRecurring(date, forDate, tz)
        all = [...all, ...generated.slice(forDate.length)]
      }
      return all
    },
    enabled: Boolean(startDate && endDate),
  })
}

export function useAddTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (fields) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase.from('tasks').insert({ user_id: user.id, ...fields }).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...changes }) => {
      const { data, error } = await supabase.from('tasks').update(changes).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useToggleDone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, currentDone }) => {
      const done = !currentDone
      const { data, error } = await supabase.from('tasks')
        .update({ done, done_at: done ? new Date().toISOString() : null })
        .eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onMutate: async ({ id, planned_date, currentDone }) => {
      await qc.cancelQueries({ queryKey: ['tasks', planned_date] })
      const prev = qc.getQueryData(['tasks', planned_date])
      qc.setQueryData(['tasks', planned_date], (old) =>
        old?.map((t) => t.id === id ? { ...t, done: !currentDone, done_at: !currentDone ? new Date().toISOString() : null } : t))
      return { prev }
    },
    onError: (_, { planned_date }, ctx) => qc.setQueryData(['tasks', planned_date], ctx.prev),
    onSettled: (_, __, { planned_date }) => qc.invalidateQueries({ queryKey: ['tasks', planned_date] }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useOverdueTasks(tz) {
  return useQuery({
    queryKey: ['tasks', 'overdue'],
    queryFn: async () => {
      const today = todayLocal(tz)
      const cutoff = cutoffDate(tz)
      const { data, error } = await supabase.from('tasks').select('*')
        .eq('done', false).eq('archived', false).lt('planned_date', today).gte('planned_date', cutoff)
      if (error) throw error
      supabase.from('tasks').update({ archived: true })
        .eq('done', false).eq('archived', false).lt('planned_date', cutoff).then(() => {})
      return data ?? []
    },
  })
}

export function useArchiveOldTasks() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (tz) => {
      const { error } = await supabase.from('tasks').update({ archived: true })
        .eq('done', false).eq('archived', false).lt('planned_date', cutoffDate(tz))
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', 'overdue'] }),
  })
}
