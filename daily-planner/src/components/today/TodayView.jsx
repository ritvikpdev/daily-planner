import { useQuery } from '@tanstack/react-query'
import { useProfile } from '../../hooks/useProfile.js'
import { useGoals } from '../../hooks/useGoals.js'
import { supabase } from '../../lib/supabase.js'
import { todayLocal, formatDisplay } from '../../utils/dateUtils.js'
import { currentStreak } from '../../utils/streakCalculator.js'
import { GoalSection } from './GoalSection.jsx'
import { OverdueBanner } from './OverdueBanner.jsx'
import { StreakChip } from '../shared/StreakChip.jsx'

export const GOAL_HEX = { purple:'#a855f7', teal:'#14b8a6', amber:'#f59e0b', blue:'#3b82f6', coral:'#f97316', green:'#22c55e' }

function greet() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function useStreaks(goalIds, tz) {
  return useQuery({
    queryKey: ['streaks', goalIds.join(',')],
    queryFn: async () => {
      if (!goalIds.length) return {}
      const { data = [] } = await supabase.from('tasks')
        .select('goal_id, planned_date, done').in('goal_id', goalIds)
      return Object.fromEntries(
        goalIds.map((id) => [id, currentStreak(data.filter((t) => t.goal_id === id), tz)])
      )
    },
    enabled: goalIds.length > 0,
  })
}

export function TodayView() {
  const { data: profile } = useProfile()
  const { data: goals = [] } = useGoals()
  const tz = profile?.timezone ?? 'UTC'
  const today = todayLocal(tz)
  const active = goals.filter((g) => g.status === 'active')
  const { data: streaks = {} } = useStreaks(active.map((g) => g.id), tz)
  const name = profile?.display_name

  return (
    <div className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
      <div>
        <h2 className="text-white text-lg font-medium">{greet()}{name ? `, ${name}` : ''}</h2>
        <p className="text-gray-400 text-sm mt-0.5">{formatDisplay(today)}</p>
      </div>

      <OverdueBanner tz={tz} today={today} />

      {active.map((g) => (
        <GoalSection key={g.id} goal={g} date={today} tz={tz} goalHex={GOAL_HEX[g.color] ?? GOAL_HEX.purple} />
      ))}

      {active.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700">
          {active.map((g) => <StreakChip key={g.id} count={streaks[g.id] ?? 0} color={g.color} />)}
        </div>
      )}
    </div>
  )
}
