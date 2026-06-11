import { useState } from 'react'
import { useRecurring, useAddRecurring, useUpdateRecurring, useDeleteRecurring } from '../../hooks/useRecurring.js'
import { validateTitle, validateTimeSlot } from '../../utils/validators.js'
import { MODE_LABELS } from '../../utils/labels.js'

const inp = 'bg-gray-700 text-white rounded px-2 py-1 outline-none focus:ring-1 focus:ring-purple-500'

function RecurringRow({ task }) {
  const { mutate: update } = useUpdateRecurring()
  const { mutate: remove } = useDeleteRecurring()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [structured, setStructured] = useState(task.default_mode === 'structured')
  const [start, setStart] = useState(task.default_start ?? '')
  const [end, setEnd] = useState(task.default_end ?? '')
  const [err, setErr] = useState({})

  function save() {
    const te = validateTitle(title); if (!te.valid) return setErr({ title: te.error })
    if (structured) { const ts = validateTimeSlot(start, end); if (!ts.valid) return setErr({ time: ts.error }) }
    update({ id: task.id, title, default_mode: structured ? 'structured' : 'freeform',
      default_start: structured ? start : null, default_end: structured ? end : null },
      { onSuccess: () => { setEditing(false); setErr({}) } })
  }

  if (!editing) return (
    <div className="flex items-center gap-2 py-1 text-sm">
      <span className="flex-1 text-gray-300">{task.title}</span>
      {task.default_mode === 'structured' && <span className="text-gray-500 text-xs">{task.default_start}–{task.default_end}</span>}
      <button onClick={() => setEditing(true)} className="text-gray-500 hover:text-gray-300 text-xs">✎</button>
      <button onClick={() => window.confirm('Delete?') && remove(task.id)} className="text-gray-500 hover:text-red-400 text-xs">×</button>
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
      <div className="flex gap-2">
        <button onClick={save} className="text-xs text-purple-400 hover:text-purple-300">Save</button>
        <button onClick={() => setEditing(false)} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
      </div>
    </div>
  )
}

export function RecurringTaskList({ goalId }) {
  const { data: tasks = [] } = useRecurring(goalId)
  const { mutate: add } = useAddRecurring()
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [err, setErr] = useState(null)

  function addTask() {
    const v = validateTitle(newTitle); if (!v.valid) return setErr(v.error)
    add({ goal_id: goalId, title: newTitle, default_mode: 'freeform' },
      { onSuccess: () => { setAdding(false); setNewTitle(''); setErr(null) } })
  }

  return (
    <div className="mt-2 pl-1">
      {tasks.map((t) => <RecurringRow key={t.id} task={t} />)}
      {adding ? (
        <div className="flex flex-col gap-1 mt-1">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Task title" autoFocus className={`${inp} text-sm`} />
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
