import { useState } from 'react'
import { useRecurring, useAddRecurring } from '../../hooks/useRecurring.js'
import { validateTitle } from '../../utils/validators.js'
import { addDays, todayLocal, localTz } from '../../utils/dateUtils.js'
import { RecurringRow } from './RecurringRow.jsx'

const inp = 'bg-gray-700 text-white rounded px-2 py-1 outline-none focus:ring-1 focus:ring-purple-500'
const qbtn = 'text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 px-2 py-0.5 rounded transition-colors flex-shrink-0'

export function RecurringTaskList({ goalId }) {
  const { data: tasks = [] } = useRecurring(goalId)
  const { mutate: add } = useAddRecurring()
  const today = todayLocal(localTz())
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [recStart, setRecStart] = useState(today)
  const [recEnd, setRecEnd] = useState('')
  const [err, setErr] = useState(null)

  function addTask() {
    const v = validateTitle(newTitle); if (!v.valid) return setErr(v.error)
    if (!recEnd) return setErr('End date is required')
    if (recEnd < recStart) return setErr('End date must be after start date')
    add({ goal_id: goalId, title: newTitle, default_mode: 'freeform', start_date: recStart, end_date: recEnd },
      { onSuccess: () => { setAdding(false); setNewTitle(''); setRecStart(today); setRecEnd(''); setErr(null) } })
  }

  return (
    <div className="mt-2 pl-1">
      {tasks.map((t) => <RecurringRow key={t.id} task={t} />)}
      {adding ? (
        <div className="flex flex-col gap-1 mt-1">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Task title" autoFocus
            className={`${inp} text-sm`} onKeyDown={(e) => e.key === 'Enter' && addTask()} />
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={() => { setRecStart(today); setRecEnd(addDays(today, 6)) }} className={qbtn}>Week</button>
            <button type="button" onClick={() => { setRecStart(today); setRecEnd(addDays(today, 29)) }} className={qbtn}>Month</button>
            <input type="date" value={recStart} onChange={(e) => setRecStart(e.target.value)} className={`${inp} text-xs`} />
            <span className="text-gray-500 text-xs">→</span>
            <input type="date" value={recEnd} onChange={(e) => setRecEnd(e.target.value)} className={`${inp} text-xs`} />
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <div className="flex gap-2">
            <button onClick={addTask} className="text-xs text-purple-400 hover:text-purple-300">Add</button>
            <button onClick={() => { setAdding(false); setErr(null) }} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="text-xs text-gray-500 hover:text-purple-400 mt-1">+ Add recurring task</button>
      )}
    </div>
  )
}
