import { useState } from 'react'
import { TaskEditor } from './TaskEditor.jsx'
import { useUpdateTask, useDeleteTask } from '../../hooks/useTasks.js'
import { GOAL_HEX } from '../today/TodayView.jsx'

const START_H = 6
const TOTAL_H = 16   // 6 AM to 10 PM
const PX_PER_H = 56

function toMins(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m }

export function DayTimeline({ tasks, goals = [] }) {
  const [editing, setEditing] = useState(null)
  const { mutate: update } = useUpdateTask()
  const { mutate: remove } = useDeleteTask()

  const structured = tasks.filter((t) => t.mode === 'structured' && t.start_time && t.end_time)

  const goalColor = (goalId) => {
    const g = goals.find((g) => g.id === goalId)
    return g ? (GOAL_HEX[g.color] ?? GOAL_HEX.purple) : GOAL_HEX.purple
  }

  return (
    <div className="relative" style={{ height: TOTAL_H * PX_PER_H }}>
      {Array.from({ length: TOTAL_H + 1 }, (_, i) => (
        <div key={i} className="absolute left-0 right-0 flex items-center gap-2"
          style={{ top: i * PX_PER_H }}>
          <span className="text-gray-600 text-xs w-10 text-right flex-shrink-0">
            {String((START_H + i) % 24).padStart(2, '0')}:00
          </span>
          <div className="flex-1 border-t border-gray-800" />
        </div>
      ))}

      {structured.map((t) => {
        const top = (toMins(t.start_time) - START_H * 60) / 60 * PX_PER_H
        const height = Math.max((toMins(t.end_time) - toMins(t.start_time)) / 60 * PX_PER_H, 20)
        return (
          <button key={t.id} onClick={() => setEditing(t)}
            className="absolute left-12 right-2 rounded text-xs text-left px-2 py-1 truncate"
            style={{ top, height, backgroundColor: goalColor(t.goal_id) + '33', borderLeft: `3px solid ${goalColor(t.goal_id)}`, color: goalColor(t.goal_id) }}>
            {t.title}
          </button>
        )
      })}

      {editing && (
        <div className="absolute left-12 right-2 z-10" style={{ top: (toMins(editing.start_time) - START_H * 60) / 60 * PX_PER_H }}>
          <TaskEditor task={editing} onClose={() => setEditing(null)}
            onSave={(changes) => { update({ ...changes, planned_date: editing.planned_date }); setEditing(null) }}
            onDelete={() => { remove({ id: editing.id, planned_date: editing.planned_date }); setEditing(null) }} />
        </div>
      )}
    </div>
  )
}
