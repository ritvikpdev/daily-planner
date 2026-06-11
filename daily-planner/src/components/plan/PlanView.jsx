import { useState } from 'react'
import { useProfile } from '../../hooks/useProfile.js'
import { useGoals } from '../../hooks/useGoals.js'
import { todayLocal, weekBounds, addDays, formatWeekRange } from '../../utils/dateUtils.js'
import { DateSelector } from './DateSelector.jsx'
import { DayDetail } from './DayDetail.jsx'
import { WeekStrip } from './WeekStrip.jsx'

const pill = (on) => `px-3 py-1 rounded-full text-xs font-medium border transition-colors ${on ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-700/50 bg-gray-800 text-gray-400 hover:text-gray-200'}`
const iconBtn = 'w-7 h-7 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700/50 text-gray-400 hover:text-gray-200 transition-colors text-base leading-none'

export function PlanView() {
  const { data: profile } = useProfile()
  const { data: goals = [] } = useGoals()
  const tz = profile?.timezone ?? 'UTC'
  const today = todayLocal(tz)
  const [selected, setSelected] = useState(today)
  const [mode, setMode] = useState('single')
  const [goalFilter, setGoalFilter] = useState(null)
  const [weekAnchor, setWeekAnchor] = useState(today)
  const active = goals.filter((g) => g.status === 'active')
  const { monday, sunday } = weekBounds(weekAnchor)
  const todayMonday = weekBounds(today).monday

  function handleSelect(value) {
    if (value === 'week') { setMode('week'); setWeekAnchor(today) }
    else { setWeekAnchor(weekBounds(value).monday); setMode('single'); setSelected(value) }
  }

  return (
    <div className="p-4 flex flex-col gap-4 max-w-5xl mx-auto">
      <DateSelector selected={selected} mode={mode} onSelect={handleSelect} tz={tz} />

      {mode === 'week' && (
        <div className="flex items-center justify-between">
          <button onClick={() => setWeekAnchor((a) => addDays(a, -7))} className={iconBtn}>‹</button>
          <div className="flex items-center gap-3">
            <span className="text-gray-200 text-sm font-medium">{formatWeekRange(monday, sunday)}</span>
            {todayMonday !== monday && (
              <button onClick={() => setWeekAnchor(today)} className={pill(false)}>This week</button>
            )}
          </div>
          <button onClick={() => setWeekAnchor((a) => addDays(a, 7))} className={iconBtn}>›</button>
        </div>
      )}

      {active.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setGoalFilter(null)} className={pill(!goalFilter)}>All goals</button>
          {active.map((g) => (
            <button key={g.id} onClick={() => setGoalFilter(g.id)} className={pill(goalFilter === g.id)}>{g.title}</button>
          ))}
        </div>
      )}

      {mode === 'week'
        ? <WeekStrip monday={monday} sunday={sunday} tz={tz} goals={goals} goalFilter={goalFilter}
            onDrillDown={(date) => { setMode('single'); setSelected(date); setWeekAnchor(weekBounds(date).monday) }} />
        : <DayDetail date={selected} tz={tz} goals={goals} goalFilter={goalFilter} />}
    </div>
  )
}
