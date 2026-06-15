import { useState } from 'react'
import { useTasksForDate, useToggleDone, useUpdateTask } from '../../hooks/useTasks.js'
import { useStopRecurringFrom, useAddRecurring } from '../../hooks/useRecurring.js'
import { useToast } from '../shared/Toast.jsx'
import { isoToLocalDate } from '../../utils/dateUtils.js'
import { DayTimeline } from './DayTimeline.jsx'
import { TaskRow } from './TaskRow.jsx'
import { AddTaskForm } from './AddTaskForm.jsx'

const DOT = { purple:'bg-purple-500',teal:'bg-teal-500',amber:'bg-amber-500',blue:'bg-blue-500',coral:'bg-orange-500',green:'bg-green-500' }

function GoalBlock({ goal, date, tz }) {
  const { data: all = [] } = useTasksForDate(date, tz)
  const { mutate: toggle } = useToggleDone()
  const { mutate: update } = useUpdateTask()
  const { mutate: stopFrom } = useStopRecurringFrom()
  const { mutate: makeRec } = useAddRecurring()
  const { showToast } = useToast()
  const [editId, setEditId] = useState(null)
  const tasks = all.filter((t) => t.goal_id === goal.id)

  const toggleEdit = (id) => setEditId((p) => (p === id ? null : id))
  const save = (ch) => { update(ch); setEditId(null) }
  const stop = (t) => stopFrom({ id: t.recurring_id, goal_id: t.goal_id, from_date: t.planned_date },
    { onSuccess: () => { showToast('Stopped — won\'t generate from tomorrow.', 'success'); setEditId(null) } })
  const promote = (t, ch) => makeRec(
    { goal_id: t.goal_id, title: ch.title, default_mode: ch.mode, default_start: ch.start_time ?? null,
      default_end: ch.end_time ?? null, start_date: ch.start_date ?? null, end_date: ch.end_date ?? null },
    { onSuccess: (tpl) => { update({ ...ch, id: t.id, recurring_id: tpl.id, is_recurring: true }); setEditId(null) } })

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/60 overflow-hidden">
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT[goal.color] ?? DOT.purple}`} />
        <span className="text-white text-sm font-medium">{goal.title}</span>
      </div>
      <div>
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} goalColor={goal.color} isEditing={editId === t.id}
            onEdit={() => toggleEdit(t.id)}
            onToggle={() => toggle({ id: t.id, planned_date: t.planned_date, currentDone: t.done })}
            onDelete={() => update({ id: t.id, archived: true })}
            onSave={save} onStop={() => stop(t)} onMakeRecurring={(ch) => promote(t, ch)} />
        ))}
      </div>
      <AddTaskForm goal={goal} date={date} />
    </div>
  )
}

export function DayDetail({ date, tz, goals, goalFilter }) {
  const { data: all = [], isLoading } = useTasksForDate(date, tz)
  const active = goals.filter((g) =>
    g.status === 'active' && (!goalFilter || g.id === goalFilter) && isoToLocalDate(g.created_at, tz) <= date
  )
  const structured = all.filter((t) => t.mode === 'structured' && t.start_time && t.end_time
    && (!goalFilter || t.goal_id === goalFilter) && active.some((g) => g.id === t.goal_id))
  return (
    <div className="flex flex-col gap-3">
      {active.map((g) => <GoalBlock key={g.id} goal={g} date={date} tz={tz} />)}
      {!isLoading && active.length > 0 && all.length === 0 && (
        <p className="text-gray-600 text-sm text-center py-2">Nothing planned. Add a task above.</p>
      )}
      {structured.length > 0 && (
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/60 p-3 overflow-y-auto" style={{ maxHeight: 480 }}>
          <p className="text-gray-500 text-xs mb-3">Timeline</p>
          <DayTimeline tasks={structured} goals={goals} />
        </div>
      )}
    </div>
  )
}
