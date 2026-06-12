import { useState } from 'react'
import { useUpdateGoal, useSetGoalStatus } from '../../hooks/useGoals.js'
import { validateTitle } from '../../utils/validators.js'
import { daysBetween, todayLocal, localTz } from '../../utils/dateUtils.js'
import { RecurringTaskList } from './RecurringTaskList.jsx'

const BORDER = { purple:'border-purple-500',teal:'border-teal-500',amber:'border-amber-500',blue:'border-blue-500',coral:'border-orange-500',green:'border-green-500' }
const ICON_MAP = { target:'🎯',briefcase:'💼',heart:'❤️',brain:'🧠',barbell:'🏋️',star:'⭐' }
const Btn = ({ onClick, danger, children }) => (
  <button onClick={onClick} className={`text-xs px-2 py-1 rounded transition-colors ${danger ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-gray-200'}`}>{children}</button>
)

export function GoalCard({ goal }) {
  const { mutate: update } = useUpdateGoal()
  const { mutate: setStatus } = useSetGoalStatus()
  const [mode, setMode] = useState(null)
  const [title, setTitle] = useState(goal.title)
  const [desc, setDesc] = useState(goal.description ?? '')
  const [note, setNote] = useState('')
  const [titleErr, setTitleErr] = useState(null)
  const border = BORDER[goal.color] ?? BORDER.purple
  const daysLeft = goal.target_date ? daysBetween(todayLocal(localTz()), goal.target_date) : null

  function saveEdit() {
    const v = validateTitle(title)
    if (!v.valid) return setTitleErr(v.error)
    update({ id: goal.id, title, description: desc || null }, { onSuccess: () => setMode(null) })
  }

  function archive() {
    if (window.confirm(`Archive "${goal.title}"?`)) setStatus({ id: goal.id, status: 'archived' })
  }

  return (
    <div className={`bg-gray-800 rounded-xl border-l-4 ${border} p-4 flex flex-col gap-3`}>
      <div className="flex items-start gap-2">
        <span className="text-lg mt-0.5">{ICON_MAP[goal.icon] ?? '🎯'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm">{goal.title}</p>
          {goal.description && <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{goal.description}</p>}
          {daysLeft !== null && <p className={`text-xs mt-1 ${daysLeft < 0 ? 'text-red-400' : 'text-gray-500'}`}>{daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}</p>}
          {goal.status === 'paused' && <span className="text-xs text-amber-400">Paused</span>}
        </div>
      </div>

      <RecurringTaskList goalId={goal.id} />

      {mode === 'edit' && (
        <div className="flex flex-col gap-2 pt-1 border-t border-gray-700">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-gray-700 text-white text-sm rounded px-2 py-1 outline-none focus:ring-1 focus:ring-purple-500" />
          {titleErr && <p className="text-red-400 text-xs">{titleErr}</p>}
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className="bg-gray-700 text-white text-sm rounded px-2 py-1 outline-none focus:ring-1 focus:ring-purple-500 resize-none" />
          <div className="flex gap-3">
            <button onClick={saveEdit} className="text-xs text-purple-400 hover:text-purple-300">Save</button>
            <button onClick={() => setMode(null)} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
          </div>
        </div>
      )}

      {mode === 'complete' && (
        <div className="flex flex-col gap-2 pt-1 border-t border-gray-700">
          <p className="text-gray-300 text-xs">Add a completion note?</p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional…" rows={2} className="bg-gray-700 text-white text-sm rounded px-2 py-1 outline-none focus:ring-1 focus:ring-purple-500 resize-none" />
          <div className="flex gap-3">
            <button onClick={() => setStatus({ id: goal.id, status: 'completed', completion_note: note || null }, { onSuccess: () => setMode(null) })} className="text-xs text-green-400 hover:text-green-300">Confirm</button>
            <button onClick={() => setMode(null)} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
          </div>
        </div>
      )}

      {mode === null && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-700">
          <Btn onClick={() => setMode('edit')}>Edit</Btn>
          <Btn onClick={() => update({ id: goal.id, status: goal.status === 'paused' ? 'active' : 'paused' })}>{goal.status === 'paused' ? 'Resume' : 'Pause'}</Btn>
          <Btn onClick={() => setMode('complete')}>Complete</Btn>
          <Btn danger onClick={archive}>Remove</Btn>
        </div>
      )}
    </div>
  )
}
