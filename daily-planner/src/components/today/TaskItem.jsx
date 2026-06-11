import { useToggleDone } from '../../hooks/useTasks.js'

export function TaskItem({ task }) {
  const { mutate: toggle } = useToggleDone()

  return (
    <div className="flex items-center gap-2 py-1.5"
      style={{
        opacity: task.done ? 0.55 : 1,
        transform: task.done ? 'scale(0.985)' : 'scale(1)',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
      }}>
      <button
        onClick={() => toggle({ id: task.id, planned_date: task.planned_date, currentDone: task.done })}
        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors
          ${task.done ? 'bg-purple-600 border-purple-600' : 'border-gray-500 hover:border-purple-400'}`}>
        {task.done && (
          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2,6 5,9 10,3" />
          </svg>
        )}
      </button>

      <span className={`text-sm flex-1 leading-snug ${task.done ? 'line-through text-gray-500' : 'text-gray-200'}`}>
        {task.title}
      </span>

      {task.mode === 'structured' && task.start_time && task.end_time && (
        <span className="text-xs text-gray-500 bg-gray-700/60 px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {task.start_time}–{task.end_time}
        </span>
      )}
    </div>
  )
}
