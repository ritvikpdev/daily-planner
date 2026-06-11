import { useState } from 'react'
import { useTasksForDate, useAddTask } from '../../hooks/useTasks.js'
import { validateTitle } from '../../utils/validators.js'
import { TaskItem } from './TaskItem.jsx'
import { ProgressRing } from '../shared/ProgressRing.jsx'
import { SkeletonRow } from '../shared/SkeletonRow.jsx'

const BORDER = { purple:'border-purple-500', teal:'border-teal-500', amber:'border-amber-500',
  blue:'border-blue-500', coral:'border-orange-500', green:'border-green-500' }
const inp = 'bg-gray-700 text-white text-sm rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-purple-500 w-full'

export function GoalSection({ goal, date, tz, goalHex }) {
  const { data: allTasks = [], isLoading } = useTasksForDate(date, tz)
  const { mutate: addTask } = useAddTask()
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [err, setErr] = useState(null)

  const tasks = allTasks.filter((t) => t.goal_id === goal.id)
  const done = tasks.filter((t) => t.done).length

  function add() {
    const v = validateTitle(newTitle); if (!v.valid) return setErr(v.error)
    addTask({ goal_id: goal.id, title: newTitle, mode: 'freeform', planned_date: date },
      { onSuccess: () => { setAdding(false); setNewTitle(''); setErr(null) } })
  }

  return (
    <div className={`border-l-4 ${BORDER[goal.color] ?? BORDER.purple} pl-3 flex flex-col gap-1`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-white text-sm font-medium flex-1 truncate">{goal.title}</span>
        <ProgressRing value={tasks.length ? done / tasks.length : 0} size={36} strokeWidth={3} color={goalHex} />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 py-1"><SkeletonRow height="20px" /><SkeletonRow height="20px" /></div>
      ) : (
        tasks.map((t) => <TaskItem key={t.id} task={t} />)
      )}

      {adding ? (
        <div className="flex flex-col gap-1 mt-1">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Task title"
            autoFocus className={inp} onKeyDown={(e) => e.key === 'Enter' && add()} />
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <div className="flex gap-3">
            <button onClick={add} className="text-xs text-purple-400 hover:text-purple-300">Add</button>
            <button onClick={() => { setAdding(false); setErr(null) }} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="text-xs text-gray-600 hover:text-gray-400 mt-1 self-start transition-colors">+ Add task</button>
      )}
    </div>
  )
}
