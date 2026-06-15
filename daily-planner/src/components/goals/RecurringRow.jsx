import { useState } from 'react'
import { useUpdateRecurring, useDeleteRecurring } from '../../hooks/useRecurring.js'
import { validateTitle, validateTimeSlot } from '../../utils/validators.js'
import { MODE_LABELS } from '../../utils/labels.js'
import { addDays } from '../../utils/dateUtils.js'

const inp = 'bg-gray-700 text-white rounded px-2 py-1 outline-none focus:ring-1 focus:ring-purple-500'
const qbtn = 'text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 px-2 py-0.5 rounded transition-colors flex-shrink-0'

function fmtShort(d) {
  return new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function RecurringRow({ task }) {
  const { mutate: update } = useUpdateRecurring()
  const { mutate: remove } = useDeleteRecurring()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [structured, setStructured] = useState(task.default_mode === 'structured')
  const [start, setStart] = useState(task.default_start ?? '')
  const [end, setEnd] = useState(task.default_end ?? '')
  const [recStart, setRecStart] = useState(task.start_date ?? '')
  const [recEnd, setRecEnd] = useState(task.end_date ?? '')
  const [err, setErr] = useState({})

  function save() {
    const te = validateTitle(title); if (!te.valid) return setErr({ title: te.error })
    if (structured) { const ts = validateTimeSlot(start, end); if (!ts.valid) return setErr({ time: ts.error }) }
    if (recEnd && recEnd < recStart) return setErr({ rec: 'End date must be after start date' })
    update({ id: task.id, title, default_mode: structured ? 'structured' : 'freeform',
      default_start: structured ? start : null, default_end: structured ? end : null,
      start_date: recStart || null, end_date: recEnd || null },
      { onSuccess: () => { setEditing(false); setErr({}) } })
  }

  const baseStart = recStart || new Date().toISOString().slice(0, 10)

  if (!editing) return (
    <div className="flex items-center gap-2 py-1 text-sm">
      <span className="flex-1 text-gray-300">{task.title}</span>
      {task.default_mode === 'structured' && (
        <span className="text-gray-500 text-xs">{task.default_start}–{task.default_end}</span>
      )}
      {task.start_date && (
        <span className="text-gray-600 text-xs">{fmtShort(task.start_date)} → {task.end_date ? fmtShort(task.end_date) : '…'}</span>
      )}
      <button onClick={() => setEditing(true)} className="text-gray-500 hover:text-gray-300 text-xs" title="Edit">✎</button>
      <button onClick={() => window.confirm('Delete this recurring task?') && remove(task.id)}
        className="text-gray-500 hover:text-red-400 text-xs" title="Delete">×</button>
    </div>
  )

  return (
    <div className="flex flex-col gap-1 py-1">
      <input value={title} onChange={(e) => setTitle(e.target.value)} className={`${inp} text-sm`} />
      {err.title && <p className="text-red-400 text-xs">{err.title}</p>}
      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
        <input type="checkbox" checked={structured} onChange={(e) => setStructured(e.target.checked)} /> {MODE_LABELS.structured}
      </label>
      {structured && <div className="flex gap-2">
        <input value={start} onChange={(e) => setStart(e.target.value)} placeholder="09:00" className={`${inp} text-xs w-20`} />
        <input value={end} onChange={(e) => setEnd(e.target.value)} placeholder="10:00" className={`${inp} text-xs w-20`} />
      </div>}
      {err.time && <p className="text-red-400 text-xs">{err.time}</p>}
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={() => setRecEnd(addDays(baseStart, 6))} className={qbtn}>Week</button>
        <button type="button" onClick={() => setRecEnd(addDays(baseStart, 29))} className={qbtn}>Month</button>
        <input type="date" value={recStart} onChange={(e) => setRecStart(e.target.value)} className={`${inp} text-xs`} />
        <span className="text-gray-500 text-xs">→</span>
        <input type="date" value={recEnd} onChange={(e) => setRecEnd(e.target.value)} className={`${inp} text-xs`} />
      </div>
      {err.rec && <p className="text-red-400 text-xs">{err.rec}</p>}
      <div className="flex gap-2">
        <button onClick={save} className="text-xs text-purple-400 hover:text-purple-300">Save</button>
        <button onClick={() => { setEditing(false); setErr({}) }} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
      </div>
    </div>
  )
}
