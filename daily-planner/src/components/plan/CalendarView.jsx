import { useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar-overrides.css'
import { useProfile } from '../../hooks/useProfile.js'
import { useGoals } from '../../hooks/useGoals.js'
import { useTasksForRange, useAddTask, useUpdateTask, useDeleteTask } from '../../hooks/useTasks.js'
import { weekBounds, localTz } from '../../utils/dateUtils.js'
import { goalColor } from '../../utils/goalColors.js'
import { TaskEditor } from './TaskEditor.jsx'

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { 'en-US': enUS } })
const ymd = (d) => format(d, 'yyyy-MM-dd')
const hm = (d) => format(d, 'HH:mm')

function CustomToolbar({ label, onNavigate, onView, view }) {
  const btn = 'px-2 py-1 rounded-md text-xs border border-gray-700/50 bg-gray-800 text-gray-300 hover:text-white transition-colors leading-none'
  const seg = (on) => `px-3 py-1 text-xs rounded-md transition-colors ${on ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'}`
  return (
    <div className="flex items-center justify-between mb-3 gap-2">
      <div className="flex items-center gap-1.5">
        <button className={btn} onClick={() => onNavigate('TODAY')}>Today</button>
        <button className={btn} onClick={() => onNavigate('PREV')}>‹</button>
        <button className={btn} onClick={() => onNavigate('NEXT')}>›</button>
      </div>
      <span className="text-gray-200 text-sm font-medium truncate">{label}</span>
      <div className="flex gap-1 bg-gray-800 border border-gray-700/50 rounded-lg p-0.5">
        <button className={seg(view === 'week')} onClick={() => onView('week')}>Week</button>
        <button className={seg(view === 'day')} onClick={() => onView('day')}>Day</button>
      </div>
    </div>
  )
}

export function CalendarView() {
  const { data: profile } = useProfile()
  const { data: goals = [] } = useGoals()
  const tz = profile?.timezone ?? localTz()
  const active = goals.filter((g) => g.status === 'active')
  const [view, setView] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'day' : 'week'))
  const [date, setDate] = useState(() => new Date())
  const [editing, setEditing] = useState(null)
  const { mutate: add } = useAddTask()
  const { mutate: update } = useUpdateTask()
  const { mutate: remove } = useDeleteTask()

  const { monday, sunday } = weekBounds(ymd(date))
  const { data: tasks = [] } = useTasksForRange(monday, sunday, tz)
  const colorOf = (goalId) => goalColor(goals.find((g) => g.id === goalId)?.color)

  const events = useMemo(() => tasks.map((t) => {
    const allDay = t.mode !== 'structured' || !t.start_time || !t.end_time
    const start = allDay ? new Date(`${t.planned_date}T00:00:00`) : new Date(`${t.planned_date}T${t.start_time}`)
    const end = allDay ? new Date(`${t.planned_date}T00:00:00`) : new Date(`${t.planned_date}T${t.end_time}`)
    return { title: t.title, start, end, allDay,
      resource: { taskId: t.id, goalId: t.goal_id, goalColor: colorOf(t.goal_id), done: t.done } }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [tasks, goals])

  const eventPropGetter = (event) => ({
    style: {
      backgroundColor: event.resource.goalColor,
      opacity: event.resource.done ? 0.45 : 1,
      textDecoration: event.resource.done ? 'line-through' : 'none',
    },
  })

  const min = useMemo(() => { const d = new Date(); d.setHours(5, 0, 0, 0); return d }, [])
  const max = useMemo(() => { const d = new Date(); d.setHours(23, 0, 0, 0); return d }, [])
  const scrollToTime = useMemo(() => new Date(), [])

  function openNew({ start, end }) {
    setEditing({ id: null, title: '', mode: 'structured', planned_date: ymd(start),
      start_time: hm(start), end_time: hm(end), goal_id: active[0]?.id, is_recurring: false, done: false })
  }

  function handleSave(changes) {
    if (changes.id) update(changes)
    else { const { id, done, ...fields } = changes; add(fields) }
    setEditing(null)
  }

  function handleDelete() {
    if (editing?.id) remove({ id: editing.id, planned_date: editing.planned_date })
    setEditing(null)
  }

  return (
    <div>
      <Calendar localizer={localizer} events={events} date={date} view={view}
        views={['week', 'day']} onView={setView} onNavigate={setDate}
        startAccessor="start" endAccessor="end"
        min={min} max={max} scrollToTime={scrollToTime}
        selectable onSelectSlot={openNew}
        onSelectEvent={(e) => setEditing(tasks.find((t) => t.id === e.resource.taskId))}
        eventPropGetter={eventPropGetter}
        components={{ toolbar: CustomToolbar }}
        style={{ height: 640 }} />

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <TaskEditor task={editing} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)} />
          </div>
        </div>
      )}
    </div>
  )
}
