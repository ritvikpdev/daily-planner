import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'
import { currentStreak } from '../utils/streakCalculator.js'

const queryKey = ['tasks', 'all-for-streaks']
const queryFn = async () => {
  const { data, error } = await supabase.from('tasks').select('goal_id, planned_date, done')
  if (error) throw error
  return data ?? []
}

export function useStreaks(tz) {
  return useQuery({
    queryKey, queryFn,
    select: (tasks) => {
      const m = {}
      for (const t of tasks) (m[t.goal_id] ??= []).push(t)
      return Object.fromEntries(Object.entries(m).map(([id, ts]) => [id, currentStreak(ts, tz)]))
    },
  })
}

export function useAllTasks() {
  return useQuery({ queryKey, queryFn })
}
