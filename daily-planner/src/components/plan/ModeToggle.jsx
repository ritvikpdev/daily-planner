import { MODE_LABELS } from '../../utils/labels.js'

export function ModeToggle({ value, onChange }) {
  const btn = (v, label) => (
    <button onClick={() => onChange(v)}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
        ${value === v ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
      {label}
    </button>
  )
  return (
    <div className="flex gap-1 bg-gray-700 rounded-full p-0.5 self-start">
      {btn('freeform', MODE_LABELS.freeform)}
      {btn('structured', MODE_LABELS.structured)}
    </div>
  )
}
