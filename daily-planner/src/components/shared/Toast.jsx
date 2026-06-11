import { useState, useCallback, useRef } from 'react'

let _showToast = null

export const showToastGlobal = (msg, type = 'error') => _showToast?.(msg, type)

export function useToast() {
  const showToast = useCallback((message, type = 'success') => {
    _showToast?.(message, type)
  }, [])
  return { showToast }
}

export function Toaster() {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  _showToast = useCallback((message, type) => {
    const id = nextId.current++
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map(({ id, message, type }) => (
        <div key={id}
          className={`px-4 py-2 rounded-lg text-sm font-medium shadow-lg
            ${type === 'error' ? 'bg-red-600 text-white' : 'bg-green-700 text-white'}`}>
          {message}
        </div>
      ))}
    </div>
  )
}
