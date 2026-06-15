import { TaskEditor } from './TaskEditor.jsx'

const LBAR = { purple:'border-l-purple-500',teal:'border-l-teal-500',amber:'border-l-amber-500',blue:'border-l-blue-500',coral:'border-l-orange-500',green:'border-l-green-500' }

const RepeatSvg = () => (
  <svg aria-label="Recurring task" width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" className="text-gray-500 flex-shrink-0">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 014-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 01-4 4H3"/>
  </svg>
)

const PencilSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

export function TaskRow({ task, goalColor, isEditing, onEdit, onToggle, onDelete, onSave, onStop, onMakeRecurring }) {
  const bar = `border-l-2 ${LBAR[goalColor] ?? LBAR.purple}`
  return (
    <div className={`${bar} border-b border-gray-700/30`}>
      <div className="flex items-center gap-2 py-2 px-3 group">
        <button onClick={onToggle}
          className={`w-3.5 h-3.5 border rounded flex-shrink-0 transition-colors
            ${task.done ? 'bg-purple-600 border-purple-600' : 'border-gray-600 hover:border-purple-400'}`} />
        <span className={`text-sm flex-1 leading-snug ${task.done ? 'line-through text-gray-600' : 'text-gray-200'}`}>
          {task.title}
        </span>
        {task.is_recurring && <RepeatSvg />}
        {task.mode === 'structured' && task.start_time && (
          <span className="text-xs text-gray-500 flex-shrink-0"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {task.start_time}–{task.end_time}
          </span>
        )}
        <button onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-200 transition-opacity flex-shrink-0">
          <PencilSvg />
        </button>
        <button onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-400 text-xs flex-shrink-0">
          ×
        </button>
      </div>
      {isEditing && (
        <div className="px-3 pb-3">
          <TaskEditor task={task} onSave={onSave} onClose={onEdit}
            onDelete={() => { onDelete(); onEdit() }}
            onStop={onStop} onMakeRecurring={onMakeRecurring} />
        </div>
      )}
    </div>
  )
}
