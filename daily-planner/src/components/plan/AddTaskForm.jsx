import { useState } from 'react'
import { useAddTask } from '../../hooks/useTasks.js'
import { useAddRecurring } from '../../hooks/useRecurring.js'
import { validateTitle, validateTimeSlot } from '../../utils/validators.js'
import { ModeToggle } from './ModeToggle.jsx'
import { addDays } from '../../utils/dateUtils.js'

const inp = 'border border-gray-700/50 bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-purple-500'
const chk = 'flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer select-none'
const qbtn = 'text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors flex-shrink-0'

export function AddTaskForm({ goal, date }) {
  const { mutate: add } = useAddTask()
  const { mutate: makeRec } = useAddRecurring()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [mode, setMode] = useState('freeform')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [recStart, setRecStart] = useState(date)
  const [recEnd, setRecEnd] = useState('')
  const [more, setMore] = useState(false)
  const [err, setErr] = useState({})

  function submit() {
    const tv = validateTitle(title); if (!tv.valid) return setErr({ t: tv.error })
    if (mode === 'structured') { const sv = validateTimeSlot(start, end); if (!sv.valid) return setErr({ s: sv.error }) }
    if (recurring) {
      if (!recEnd) return setErr({ rec: 'End date is required for recurring tasks' })
      if (recEnd < recStart) return setErr({ rec: 'End date must be after start date' })
    }
    const fields = { goal_id: goal.id, title, mode, planned_date: date,
      start_time: mode === 'structured' ? start : null, end_time: mode === 'structured' ? end : null }
    const done = () => { setTitle(''); setErr({}); if (!more) setOpen(false) }
    if (recurring) {
      makeRec({ goal_id: goal.id, title, default_mode: mode, default_start: fields.start_time,
                default_end: fields.end_time, start_date: recStart, end_date: recEnd },
        { onSuccess: (tpl) => add({ ...fields, is_recurring: true, recurring_id: tpl.id }, { onSuccess: done }) })
    } else {
      add(fields, { onSuccess: done })
    }
  }

  if (!open) return (
    <div className="px-3 py-2 border-t border-gray-700/40">
      <button onClick={() => setOpen(true)}
        className="text-xs text-gray-500 hover:text-purple-400 transition-colors">+ Add task</button>
    </div>
  )

  return (
    <div className="flex flex-col gap-2 px-3 py-2 border-t border-gray-700/40">
      <div className="flex items-center gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title…"
          className={`${inp} flex-1 min-w-0`} onKeyDown={(e) => e.key === 'Enter' && submit()} autoFocus />
        <button onClick={submit} className="text-xs text-purple-400 hover:text-purple-300 font-medium flex-shrink-0">Add</button>
        <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-400 text-base leading-none flex-shrink-0">×</button>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <ModeToggle value={mode} onChange={setMode} />
        {mode === 'structured' && <>
          <input value={start} onChange={(e) => setStart(e.target.value)} placeholder="09:00" className={`${inp} w-20`} />
          <input value={end} onChange={(e) => setEnd(e.target.value)} placeholder="10:00" className={`${inp} w-20`} />
        </>}
        <label className={chk}>
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="accent-purple-500" />
          Recurring
        </label>
        <label className={chk}>
          <input type="checkbox" checked={more} onChange={(e) => setMore(e.target.checked)} className="accent-purple-500" />
          Create more
        </label>
      </div>
      {recurring && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={() => { setRecStart(date); setRecEnd(addDays(date, 6)) }} className={qbtn}>Week</button>
            <button type="button" onClick={() => { setRecStart(date); setRecEnd(addDays(date, 29)) }} className={qbtn}>Month</button>
            <input type="date" value={recStart} onChange={(e) => setRecStart(e.target.value)} className={`${inp} text-xs py-1`} />
            <span className="text-gray-500 text-xs">→</span>
            <input type="date" value={recEnd} onChange={(e) => setRecEnd(e.target.value)} className={`${inp} text-xs py-1`} />
          </div>
          {err.rec && <p className="text-red-400 text-xs">{err.rec}</p>}
        </div>
      )}
      {(err.t || err.s) && <p className="text-red-400 text-xs">{err.t ?? err.s}</p>}
    </div>
  )
}
