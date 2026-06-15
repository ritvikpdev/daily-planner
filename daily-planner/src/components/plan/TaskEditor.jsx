import { useState } from 'react'
import { ModeToggle } from './ModeToggle.jsx'
import { validateTitle, validateTimeSlot } from '../../utils/validators.js'
import { formatDisplay, addDays } from '../../utils/dateUtils.js'

const inp = 'bg-gray-700 text-white text-sm rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-purple-500'
const qbtn = 'text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 px-2 py-0.5 rounded transition-colors flex-shrink-0'

export function TaskEditor({ task, onSave, onDelete, onClose, onStop, onMakeRecurring }) {
  const [title, setTitle] = useState(task.title)
  const [mode, setMode] = useState(task.mode)
  const [date, setDate] = useState(task.planned_date)
  const [start, setStart] = useState(task.start_time ?? '')
  const [end, setEnd] = useState(task.end_time ?? '')
  const [makeRecurring, setMakeRecurring] = useState(false)
  const [recStart, setRecStart] = useState(task.planned_date)
  const [recEnd, setRecEnd] = useState('')
  const [stopConfirm, setStopConfirm] = useState(false)
  const [errors, setErrors] = useState({})

  function save() {
    const errs = {}
    const tv = validateTitle(title); if (!tv.valid) errs.title = tv.error
    if (mode === 'structured') { const sv = validateTimeSlot(start, end); if (!sv.valid) errs.time = sv.error }
    if (makeRecurring) {
      if (!recEnd) errs.rec = 'End date is required'
      else if (recEnd < recStart) errs.rec = 'End date must be after start date'
    }
    if (Object.keys(errs).length) return setErrors(errs)
    const changes = { ...task, title, mode, planned_date: date,
      start_time: mode === 'structured' ? start : null, end_time: mode === 'structured' ? end : null }
    if (makeRecurring && onMakeRecurring) onMakeRecurring({ ...changes, start_date: recStart, end_date: recEnd })
    else onSave(changes)
  }

  return (
    <div className="bg-gray-800/80 rounded-xl p-3 flex flex-col gap-3 border border-gray-700/60 mt-1">
      {task.is_recurring && (
        <div className="flex flex-col gap-1.5 text-xs text-gray-500 border-b border-gray-700/40 pb-2">
          <p>This is a recurring task. Changes here only apply to <span className="text-gray-400">{formatDisplay(task.planned_date)}</span>.</p>
          {!stopConfirm
            ? <button onClick={() => setStopConfirm(true)}
                className="self-start text-amber-400/70 hover:text-amber-400 transition-colors">
                ■ Stop recurring
              </button>
            : <div className="flex flex-col gap-1">
                <p className="text-gray-400">Stop recurring? Today's instance stays; all future ones will be removed.</p>
                <div className="flex gap-3">
                  <button onClick={onStop} className="text-red-400 hover:text-red-300">Confirm</button>
                  <button onClick={() => setStopConfirm(false)} className="text-gray-500 hover:text-gray-300">Cancel</button>
                </div>
              </div>}
        </div>
      )}

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title"
        className={`${inp} w-full`} />
      {errors.title && <p className="text-red-400 text-xs -mt-2">{errors.title}</p>}

      <ModeToggle value={mode} onChange={setMode} />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} />

      {mode === 'structured' && (
        <div className="flex gap-2">
          <input value={start} onChange={(e) => setStart(e.target.value)} placeholder="09:00" className={`${inp} w-24`} />
          <span className="text-gray-500 self-center">–</span>
          <input value={end} onChange={(e) => setEnd(e.target.value)} placeholder="10:00" className={`${inp} w-24`} />
        </div>
      )}
      {errors.time && <p className="text-red-400 text-xs -mt-2">{errors.time}</p>}

      {!task.is_recurring && (
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={makeRecurring} onChange={(e) => setMakeRecurring(e.target.checked)} />
            Repeat this daily
          </label>
          {makeRecurring && (
            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={() => { setRecStart(task.planned_date); setRecEnd(addDays(task.planned_date, 6)) }} className={qbtn}>Week</button>
              <button type="button" onClick={() => { setRecStart(task.planned_date); setRecEnd(addDays(task.planned_date, 29)) }} className={qbtn}>Month</button>
              <input type="date" value={recStart} onChange={(e) => setRecStart(e.target.value)} className={`${inp} text-xs`} />
              <span className="text-gray-500 text-xs">→</span>
              <input type="date" value={recEnd} onChange={(e) => setRecEnd(e.target.value)} className={`${inp} text-xs`} />
            </div>
          )}
          {errors.rec && <p className="text-red-400 text-xs">{errors.rec}</p>}
        </div>
      )}

      <div className="flex justify-between pt-0.5">
        <div className="flex gap-3">
          <button onClick={save} className="text-sm text-purple-400 hover:text-purple-300 transition-colors">Save</button>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Cancel</button>
        </div>
        <button onClick={onDelete} className="text-sm text-red-400 hover:text-red-300 transition-colors">Delete</button>
      </div>
    </div>
  )
}
