import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'
import { todayLocal, daysBetween } from '../utils/dateUtils.js'

export function useAppOpenCheck(tz) {
  return useQuery({
    queryKey: ['tasks', 'last-activity'],
    queryFn: async () => {
      const [{ data: t }, { data: l }] = await Promise.all([
        supabase.from('tasks').select('done_at').eq('done', true)
          .not('done_at', 'is', null).order('done_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('logs').select('submitted_at')
          .not('submitted_at', 'is', null).order('submitted_at', { ascending: false }).limit(1).maybeSingle(),
      ])
      const ts = [t?.done_at, l?.submitted_at].filter(Boolean).sort().pop()
      if (!ts) return { missedDays: 0 }
      const lastActivityDate = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date(ts))
      return { missedDays: daysBetween(lastActivityDate, todayLocal(tz)), lastActivityDate }
    },
  })
}
