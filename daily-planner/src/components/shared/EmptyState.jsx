export function EmptyState({ message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-gray-400 text-sm">{message}</p>
      {action && (
        <button onClick={action.onClick}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
          {action.label}
        </button>
      )}
    </div>
  )
}
