import { useState } from 'react'
import { ModeToggle } from './ModeToggle.jsx'
import { validateTitle, validateTimeSlot } from '../../utils/validators.js'

const inp = 'bg-gray-700 text-white text-sm rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-purple-500'

export function TaskEditor({ task, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(task.title)
  const [mode, setMode] = useState(task.mode)
  const [date, setDate] = useState(task.planned_date)
  const [start, setStart] = useState(task.start_time ?? '')
  const [end, setEnd] = useState(task.end_time ?? '')
  const [recurring, setRecurring] = useState(task.is_recurring ?? false)
  const [errors, setErrors] = useState({})

  function save() {
    const errs = {}
    const tv = validateTitle(title); if (!tv.valid) errs.title = tv.error
    if (mode === 'structured') { const sv = validateTimeSlot(start, end); if (!sv.valid) errs.time = sv.error }
    if (Object.keys(errs).length) return setErrors(errs)
    onSave({ ...task, title, mode, planned_date: date,
      start_time: mode === 'structured' ? start : null,
      end_time: mode === 'structured' ? end : null,
      is_recurring: recurring })
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col gap-3 border border-gray-700">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className={`${inp} w-full`} />
      {errors.title && <p className="text-red-400 text-xs -mt-2">{errors.title}</p>}

      <ModeToggle value={mode} onChange={setMode} />

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inp}`} />

      {mode === 'structured' && (
        <div className="flex gap-2">
          <input value={start} onChange={(e) => setStart(e.target.value)} placeholder="09:00" className={`${inp} w-24`} />
          <span className="text-gray-500 self-center">–</span>
          <input value={end} onChange={(e) => setEnd(e.target.value)} placeholder="10:00" className={`${inp} w-24`} />
        </div>
      )}
      {errors.time && <p className="text-red-400 text-xs -mt-2">{errors.time}</p>}

      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
        <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
        Mark as recurring
      </label>

      <div className="flex justify-between pt-1">
        <div className="flex gap-3">
          <button onClick={save} className="text-sm text-purple-400 hover:text-purple-300 transition-colors">Save</button>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Cancel</button>
        </div>
        <button onClick={onDelete} className="text-sm text-red-400 hover:text-red-300 transition-colors">Delete</button>
      </div>
    </div>
  )
}
