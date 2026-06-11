import { todayLocal, nextDay } from '../../utils/dateUtils.js'

const base = 'px-3 py-1 rounded-full text-xs font-medium transition-colors border'
const on = `${base} bg-purple-600 border-purple-600 text-white`
const off = `${base} border-gray-700/50 bg-gray-800 text-gray-400 hover:text-gray-200`

export function DateSelector({ selected, mode, onSelect, tz = 'UTC' }) {
  const today = todayLocal(tz)
  const tomorrow = nextDay(today)

  const Pill = ({ value, label, active }) => (
    <button onClick={() => onSelect(value)} className={active ? on : off}>{label}</button>
  )

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Pill value={today} label="Today" active={mode === 'single' && selected === today} />
      <Pill value={tomorrow} label="Tomorrow" active={mode === 'single' && selected === tomorrow} />
      <Pill value="week" label="This week" active={mode === 'week'} />
      <input type="date" value={mode === 'week' ? '' : selected}
        onChange={(e) => e.target.value && onSelect(e.target.value)}
        className="border border-gray-700/50 bg-gray-800 text-gray-400 text-xs rounded-full px-3 py-1 outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer" />
    </div>
  )
}
