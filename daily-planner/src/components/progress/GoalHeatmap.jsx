import { todayLocal, previousDay } from '../../utils/dateUtils.js'

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function GoalHeatmap({ goalId, tasks, tz }) {
  const today = todayLocal(tz)
  const days = []
  let d = today
  for (let i = 0; i < 7; i++) { days.unshift(d); d = previousDay(d) }

  return (
    <div className="flex gap-1.5">
      {days.map((day) => {
        const dt = tasks.filter((t) => t.planned_date === day)
        const total = dt.length
        const done = dt.filter((t) => t.done).length
        const color = total === 0 ? 'bg-gray-700/50' : done === total ? 'bg-green-500' : done > 0 ? 'bg-amber-400' : 'bg-gray-700/50'
        return (
          <div key={day} className="flex flex-col items-center gap-1">
            <span className="text-gray-600 text-[10px]">{DOW[new Date(day + 'T12:00:00Z').getUTCDay()]}</span>
            <div className={`w-7 h-7 rounded-md ${color}`} title={`${day}: ${done}/${total}`} />
          </div>
        )
      })}
    </div>
  )
}
