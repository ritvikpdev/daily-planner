import { useState } from 'react'

const REASONS = ['Travelling', 'Busy', 'Sick', 'Needed a break', 'Forgot', 'Other']

export function CheckInCard({ missedDays, onDismiss }) {
  const [selected, setSelected] = useState(null)
  const [other, setOther] = useState('')

  if (missedDays < 3) return null

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/80 p-4 flex flex-col gap-3">
      <p className="text-gray-200 text-sm">
        You've been away <span className="text-white font-medium">{missedDays}</span> days — no worries. What happened?
      </p>
      <div className="flex flex-wrap gap-2">
        {REASONS.map((r) => (
          <button key={r} onClick={() => setSelected(selected === r ? null : r)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
              ${selected === r ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-600 text-gray-400 hover:text-gray-200'}`}>
            {r}
          </button>
        ))}
      </div>
      {selected === 'Other' && (
        <input value={other} onChange={(e) => setOther(e.target.value)} placeholder="Tell us more…"
          className="bg-gray-700 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-purple-500" />
      )}
      <div className="flex justify-end">
        <button onClick={onDismiss} className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
          Continue
        </button>
      </div>
    </div>
  )
}
