import { useProfile } from '../../hooks/useProfile.js'
import { useGoals } from '../../hooks/useGoals.js'
import { useStreaks, useAllTasks } from '../../hooks/useStreaks.js'
import { todayLocal, weekBounds, formatDisplay } from '../../utils/dateUtils.js'
import { StreakBoard } from './StreakBoard.jsx'
import { GoalHeatmap } from './GoalHeatmap.jsx'
import { SkeletonRow } from '../shared/SkeletonRow.jsx'

const sec = 'flex flex-col gap-3'
const sh = 'text-xs text-gray-500 font-medium uppercase tracking-wide border-b border-gray-800 pb-1'
const HEX = { purple:'#a855f7', teal:'#14b8a6', amber:'#f59e0b', blue:'#3b82f6', coral:'#f97316', green:'#22c55e' }

export function ProgressView() {
  const { data: profile } = useProfile()
  const { data: goals = [] } = useGoals()
  const tz = profile?.timezone ?? 'UTC'
  const today = todayLocal(tz)
  const { data: streaks = {} } = useStreaks(tz)
  const { data: allTasks = [], isLoading } = useAllTasks()
  const active = goals.filter((g) => g.status === 'active')
  const completed = goals.filter((g) => g.status === 'completed' || g.status === 'archived')
  const { monday, sunday } = weekBounds(today)

  if (isLoading) return (
    <div className="p-4 flex flex-col gap-3 max-w-2xl mx-auto">
      {[1, 2, 3].map((i) => <SkeletonRow key={i} height="40px" />)}
    </div>
  )

  return (
    <div className="p-4 flex flex-col gap-6 max-w-2xl mx-auto">
      <div className={sec}>
        <p className={sh}>This week</p>
        {active.map((g) => {
          const wt = allTasks.filter((t) => t.goal_id === g.id && t.planned_date >= monday && t.planned_date <= sunday)
          const done = wt.filter((t) => t.done).length
          const total = wt.length
          const pct = total ? Math.round((done / total) * 100) : 0
          return (
            <div key={g.id} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">{g.title}</span>
                <span className="text-gray-500">{done}/{total}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: HEX[g.color] ?? HEX.purple }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className={sec}>
        <p className={sh}>Streaks</p>
        <StreakBoard goals={active} streakMap={streaks} today={today} />
      </div>
      <div className={sec}>
        <p className={sh}>Last 7 days</p>
        {active.map((g) => (
          <div key={g.id} className="flex flex-col gap-1">
            <span className="text-gray-400 text-xs">{g.title}</span>
            <GoalHeatmap goalId={g.id} tasks={allTasks.filter((t) => t.goal_id === g.id)} tz={tz} />
          </div>
        ))}
      </div>
      <div className={sec}>
        <p className={sh}>Completed goals</p>
        {completed.length === 0
          ? <p className="text-gray-600 text-sm">No completed goals yet.</p>
          : completed.map((g) => (
            <div key={g.id} className="rounded-lg bg-gray-800/60 border border-gray-700/40 px-3 py-2">
              <p className="text-gray-300 text-sm font-medium">{g.title}</p>
              {g.completed_at && <p className="text-gray-600 text-xs">{formatDisplay(g.completed_at.slice(0, 10))}</p>}
              {g.completion_note && <p className="text-gray-500 text-xs mt-0.5">{g.completion_note}</p>}
            </div>
          ))}
      </div>
    </div>
  )
}
