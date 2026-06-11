import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useProfile } from '../../hooks/useProfile.js'
import { MissedDayBanner } from '../reminders/MissedDayBanner.jsx'
import { CheckInCard } from '../reminders/CheckInCard.jsx'
import { useGoals } from '../../hooks/useGoals.js'
import { supabase } from '../../lib/supabase.js'
import { todayLocal, formatDisplay } from '../../utils/dateUtils.js'
import { currentStreak } from '../../utils/streakCalculator.js'
import { GoalSection } from './GoalSection.jsx'
import { OverdueBanner } from './OverdueBanner.jsx'
import { StreakChip } from '../shared/StreakChip.jsx'
import { EmptyState } from '../shared/EmptyState.jsx'
import { SkeletonRow } from '../shared/SkeletonRow.jsx'
import { useTasksForDate } from '../../hooks/useTasks.js'

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

export function TodayView({ missedDays = 0, lastActivityDate, onGoToReview, onNavigate = () => {} }) {
  const { data: profile } = useProfile()
  const { data: goals = [], isLoading: goalsLoading, isError: goalsError, refetch: refetchGoals } = useGoals()
  const tz = profile?.timezone ?? 'UTC'
  const today = todayLocal(tz)
  const { data: todayTasks = [] } = useTasksForDate(today, tz)
  const active = goals.filter((g) => g.status === 'active')
  const { data: streaks = {} } = useStreaks(active.map((g) => g.id), tz)
  const name = profile?.display_name
  const [cardDone, setCardDone] = useState(() => sessionStorage.getItem('checkin_done') === 'true')

  return (
    <div className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
      {missedDays >= 3 && !cardDone && (
        <CheckInCard missedDays={missedDays} onDismiss={() => { sessionStorage.setItem('checkin_done', 'true'); setCardDone(true) }} />
      )}
      {(missedDays === 1 || missedDays === 2) && (
        <MissedDayBanner missedDays={missedDays} lastDate={lastActivityDate} onGoToReview={onGoToReview} />
      )}
      <div>
        <h2 className="text-white text-lg font-medium">{greet()}{name ? `, ${name}` : ''}</h2>
        <p className="text-gray-400 text-sm mt-0.5">{formatDisplay(today)}</p>
      </div>

      <OverdueBanner tz={tz} today={today} />

      {goalsError && <p className="text-red-400 text-sm">Couldn't load your goals. <button onClick={refetchGoals} className="underline">Retry</button></p>}
      {!goalsLoading && !goalsError && active.length === 0 && <EmptyState message="Add a goal to start planning" action={{ label: 'Go to Goals', onClick: () => onNavigate('Goals') }} />}
      {goalsLoading ? [1,2,3].map((i) => <SkeletonRow key={i} height="80px" />) :
        active.map((g) => <GoalSection key={g.id} goal={g} date={today} tz={tz} goalHex={GOAL_HEX[g.color] ?? GOAL_HEX.purple} />)}
      {!goalsLoading && active.length > 0 && todayTasks.length === 0 && <p className="text-gray-600 text-sm text-center py-1">Nothing planned. <button onClick={() => onNavigate('Plan')} className="text-purple-400 hover:text-purple-300">Plan your day →</button></p>}

      {active.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700">
          {active.map((g) => <StreakChip key={g.id} count={streaks[g.id] ?? 0} color={g.color} />)}
        </div>
      )}
    </div>
  )
}
