import { useState } from 'react'
import { GoalBadge } from '../shared/GoalBadge.jsx'

export function StreakBoard({ goals, streakMap, today }) {
  const [resets, setResets] = useState(() =>
    Object.fromEntries(goals.map((g) => [g.id, localStorage.getItem(`streak_reset_${g.id}`) ?? '']))
  )

  function reset(id) {
    localStorage.setItem(`streak_reset_${id}`, today)
    setResets((r) => ({ ...r, [id]: today }))
  }

  return (
    <div className="flex flex-col gap-2">
      {goals.map((g) => {
        const isReset = (resets[g.id] ?? '') >= today
        const count = isReset ? 0 : (streakMap[g.id] ?? 0)
        return (
          <div key={g.id} className="flex items-center gap-3 py-1">
            <GoalBadge color={g.color} label={g.title} />
            <span className="flex-1" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className="text-gray-200 text-sm">{count} day{count !== 1 ? 's' : ''}</span>
            {count > 0
              ? <button onClick={() => reset(g.id)} className="text-xs text-gray-600 hover:text-red-400 w-10 text-right transition-colors">Reset</button>
              : <span className="w-10" />}
          </div>
        )
      })}
    </div>
  )
}
