import { useOverdueTasks, useToggleDone, useUpdateTask } from '../../hooks/useTasks.js'
import { useGoals } from '../../hooks/useGoals.js'
import { formatDisplay } from '../../utils/dateUtils.js'

export function OverdueBanner({ tz, today }) {
  const { data: rawTasks = [] } = useOverdueTasks(tz)
  const { data: goals = [] } = useGoals()
  const activeIds = new Set(goals.filter((g) => g.status === 'active').map((g) => g.id))
  const tasks = rawTasks.filter((t) => activeIds.has(t.goal_id))
  const { mutate: toggle } = useToggleDone()
  const { mutate: update } = useUpdateTask()

  if (!tasks.length) return null

  return (
    <div className="bg-amber-950/40 border border-amber-800/30 rounded-xl px-4 py-3 flex flex-col gap-2">
      <p className="text-amber-400/70 text-xs font-medium tracking-wide">From earlier</p>
      {tasks.map((t) => (
        <div key={t.id} className="flex items-center gap-2">
          <button
            onClick={() => toggle({ id: t.id, planned_date: t.planned_date, currentDone: t.done })}
            title={t.done ? 'Mark undone' : 'Mark done'}
            className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors
              ${t.done ? 'bg-purple-600 border-purple-600' : 'border-gray-500 hover:border-amber-500'}`}>
            {t.done && (
              <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,6 5,9 10,3" />
              </svg>
            )}
          </button>
          <span className={`text-sm flex-1 ${t.done ? 'line-through text-gray-500' : 'text-gray-300'}`}>{t.title}</span>
          <span className="text-xs text-gray-500 flex-shrink-0">{formatDisplay(t.planned_date)}</span>
          <button
            onClick={() => update({ id: t.id, planned_date: today })}
            title="Move to today"
            className="text-xs text-amber-500/60 hover:text-amber-400 transition-colors flex-shrink-0">
            Move →
          </button>
          <button
            onClick={() => update({ id: t.id, archived: true })}
            title="Dismiss"
            className="text-gray-600 hover:text-red-400 text-base leading-none transition-colors flex-shrink-0">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
