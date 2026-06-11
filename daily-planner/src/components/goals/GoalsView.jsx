import { useState } from 'react'
import { useGoals } from '../../hooks/useGoals.js'
import { GoalCard } from './GoalCard.jsx'
import { AddGoalFlow } from './AddGoalFlow.jsx'
import { EmptyState } from '../shared/EmptyState.jsx'
import { SkeletonRow } from '../shared/SkeletonRow.jsx'

export function GoalsView() {
  const { data: goals = [], isLoading } = useGoals()
  const [adding, setAdding] = useState(false)
  const [completedOpen, setCompletedOpen] = useState(false)

  const active = goals.filter((g) => g.status === 'active' || g.status === 'paused')
  const completed = goals.filter((g) => g.status === 'completed')

  if (isLoading) return (
    <div className="p-4 flex flex-col gap-3">
      <SkeletonRow height="72px" />
      <SkeletonRow height="72px" />
      <SkeletonRow height="72px" />
    </div>
  )

  return (
    <div className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-medium text-lg">Goals</h2>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            + Add goal
          </button>
        )}
      </div>

      {adding && <AddGoalFlow onDone={() => setAdding(false)} />}

      {!adding && active.length === 0 && (
        <EmptyState message="No goals yet"
          action={{ label: 'Add your first goal', onClick: () => setAdding(true) }} />
      )}

      {active.map((g) => <GoalCard key={g.id} goal={g} />)}

      {completed.length > 0 && (
        <div className="border-t border-gray-700 pt-3">
          <button onClick={() => setCompletedOpen((v) => !v)}
            className="text-sm text-gray-400 hover:text-gray-200 transition-colors mb-2">
            {completedOpen ? '▾' : '▸'} Completed ({completed.length})
          </button>
          {completedOpen && completed.map((g) => (
            <div key={g.id} className="py-2 px-3 rounded-lg bg-gray-800 mb-2">
              <p className="text-gray-300 text-sm font-medium">{g.title}</p>
              {g.completed_at && (
                <p className="text-gray-500 text-xs mt-0.5">
                  {new Date(g.completed_at).toLocaleDateString()}
                  {g.completion_note && ` · ${g.completion_note}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
