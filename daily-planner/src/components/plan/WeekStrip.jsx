import { useState } from 'react'
import { useTasksForDate, useAddTask, useToggleDone } from '../../hooks/useTasks.js'
import { todayLocal, dateRange } from '../../utils/dateUtils.js'

const DOT = { purple:'bg-purple-500',teal:'bg-teal-500',amber:'bg-amber-500',blue:'bg-blue-500',coral:'bg-orange-500',green:'bg-green-500' }
const DAY = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })

function DayCell({ date, today, goals, goalFilter, tz, onDrillDown }) {
  const { data: all = [] } = useTasksForDate(date, tz)
  const { mutate: addTask } = useAddTask()
  const { mutate: toggle } = useToggleDone()
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const tasks = goalFilter ? all.filter((t) => t.goal_id === goalFilter) : all
  const isToday = date === today
  const firstGoalId = goalFilter ?? goals.find((g) => g.status === 'active')?.id
  const dot = (goalId) => DOT[goals.find((g) => g.id === goalId)?.color] ?? DOT.purple

  function add() {
    if (!newTitle.trim() || !firstGoalId) return
    addTask({ goal_id: firstGoalId, title: newTitle, mode: 'freeform', planned_date: date },
      { onSuccess: () => { setAdding(false); setNewTitle('') } })
  }

  return (
    <div className={`flex flex-col gap-1.5 p-2.5 rounded-xl border ${isToday ? 'border-purple-600/50 bg-purple-900/10' : 'border-gray-700/50 bg-gray-800/40'}`}>
      <button onClick={() => onDrillDown(date)} className="text-left">
        <p className="text-gray-500 text-xs leading-none">{DAY(date)}</p>
        <p className={`text-sm font-semibold mt-0.5 ${isToday ? 'text-purple-400' : 'text-gray-200'}`}>{date.slice(8)}</p>
      </button>
      <div className="flex flex-col gap-0.5 min-h-[20px]">
        {tasks.length === 0 && !adding && <p className="text-gray-700 text-xs select-none">—</p>}
        {tasks.map((t) => (
          <button key={t.id} onClick={() => toggle({ id: t.id, planned_date: t.planned_date, currentDone: t.done })}
            className="flex items-center gap-1 text-left w-full">
            <span className={`w-1.5 h-1.5 rounded-sm flex-shrink-0 ${dot(t.goal_id)}`} />
            <span className={`text-xs leading-tight flex-1 truncate ${t.done ? 'line-through text-gray-600' : 'text-gray-300'}`}>{t.title}</span>
          </button>
        ))}
      </div>
      {adding
        ? <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus placeholder="Task…"
            className="text-xs bg-gray-700/80 text-white rounded px-1.5 py-1 outline-none focus:ring-1 focus:ring-purple-500 w-full"
            onKeyDown={(e) => { if (e.key === 'Enter') add(); if (e.key === 'Escape') { setAdding(false); setNewTitle('') } }}
            onBlur={() => { if (!newTitle.trim()) setAdding(false) }} />
        : firstGoalId && <button onClick={() => setAdding(true)} className="text-gray-700 hover:text-gray-400 text-xs text-left transition-colors">+ add</button>}
    </div>
  )
}

export function WeekStrip({ monday, sunday, tz, goals, goalFilter, onDrillDown }) {
  const today = todayLocal(tz)
  const week = dateRange(monday, sunday)
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="grid grid-cols-7 gap-2 min-w-[560px]">
        {week.map((d) => <DayCell key={d} date={d} today={today} goals={goals} goalFilter={goalFilter} tz={tz} onDrillDown={onDrillDown} />)}
      </div>
    </div>
  )
}
