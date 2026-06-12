import { useState } from 'react'
import { useTasksForDate, useAddTask, useToggleDone, useDeleteTask } from '../../hooks/useTasks.js'
import { validateTitle, validateTimeSlot } from '../../utils/validators.js'
import { DayTimeline } from './DayTimeline.jsx'
import { ModeToggle } from './ModeToggle.jsx'

const DOT = { purple:'bg-purple-500',teal:'bg-teal-500',amber:'bg-amber-500',blue:'bg-blue-500',coral:'bg-orange-500',green:'bg-green-500' }
const inp = 'border border-gray-700/50 bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-purple-500'

function GoalBlock({ goal, date, tz }) {
  const { data: all = [] } = useTasksForDate(date, tz)
  const { mutate: addTask } = useAddTask()
  const { mutate: toggle } = useToggleDone()
  const { mutate: remove } = useDeleteTask()
  const [title, setTitle] = useState('')
  const [mode, setMode] = useState('freeform')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [err, setErr] = useState({})
  const tasks = all.filter((t) => t.goal_id === goal.id)

  function submit() {
    const tv = validateTitle(title); if (!tv.valid) return setErr({ t: tv.error })
    if (mode === 'structured') { const sv = validateTimeSlot(start, end); if (!sv.valid) return setErr({ s: sv.error }) }
    addTask({ goal_id: goal.id, title, mode, planned_date: date,
      start_time: mode === 'structured' ? start : null, end_time: mode === 'structured' ? end : null },
      { onSuccess: () => { setTitle(''); setStart(''); setEnd(''); setErr({}) } })
  }

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/60 p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT[goal.color] ?? DOT.purple}`} />
        <span className="text-white text-sm font-medium">{goal.title}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-2 py-0.5 group">
            <button onClick={() => toggle({ id: t.id, planned_date: t.planned_date, currentDone: t.done })}
              className={`w-3.5 h-3.5 border rounded flex-shrink-0 transition-colors ${t.done ? 'bg-purple-600 border-purple-600' : 'border-gray-600 hover:border-purple-400'}`} />
            <span className={`text-sm flex-1 leading-snug ${t.done ? 'line-through text-gray-600' : 'text-gray-200'}`}>{t.title}</span>
            {t.mode === 'structured' && t.start_time && <span className="text-xs text-gray-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.start_time}–{t.end_time}</span>}
            <button onClick={() => remove({ id: t.id, planned_date: t.planned_date })} className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-400 text-xs">×</button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-gray-700/40 flex-wrap">
        <ModeToggle value={mode} onChange={setMode} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task…"
          className={`${inp} flex-1 min-w-0`} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        {mode === 'structured' && <>
          <input value={start} onChange={(e) => setStart(e.target.value)} placeholder="09:00" className={`${inp} w-20`} />
          <input value={end} onChange={(e) => setEnd(e.target.value)} placeholder="10:00" className={`${inp} w-20`} />
        </>}
        <button onClick={submit} className="text-xs text-purple-400 hover:text-purple-300 font-medium flex-shrink-0">Add</button>
      </div>
      {(err.t || err.s) && <p className="text-red-400 text-xs">{err.t ?? err.s}</p>}
    </div>
  )
}

export function DayDetail({ date, tz, goals, goalFilter }) {
  const { data: all = [], isLoading } = useTasksForDate(date, tz)
  const active = goals.filter((g) => g.status === 'active' && (!goalFilter || g.id === goalFilter))
  const structured = all.filter((t) => t.mode === 'structured' && t.start_time && t.end_time
    && (!goalFilter || t.goal_id === goalFilter) && active.some((g) => g.id === t.goal_id))
  return (
    <div className="flex flex-col gap-3">
      {active.map((g) => <GoalBlock key={g.id} goal={g} date={date} tz={tz} />)}
      {!isLoading && active.length > 0 && all.length === 0 && <p className="text-gray-600 text-sm text-center py-2">Nothing planned. Add a task above.</p>}
      {structured.length > 0 && (
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/60 p-3 overflow-y-auto" style={{ maxHeight: 480 }}>
          <p className="text-gray-500 text-xs mb-3">Timeline</p>
          <DayTimeline tasks={structured} goals={goals} />
        </div>
      )}
    </div>
  )
}
