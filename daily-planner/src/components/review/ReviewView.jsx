import { useState, useEffect } from 'react'
import { useProfile } from '../../hooks/useProfile.js'
import { useGoals } from '../../hooks/useGoals.js'
import { useLog, useUpsertLog } from '../../hooks/useLogs.js'
import { useToast } from '../shared/Toast.jsx'
import { SkeletonRow } from '../shared/SkeletonRow.jsx'
import { todayLocal, addDays } from '../../utils/dateUtils.js'

const ta = 'w-full bg-gray-800 border border-gray-700/50 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-purple-500 resize-none placeholder:text-gray-600'
const lbl = 'text-xs text-gray-500 font-medium uppercase tracking-wide'

export function ReviewView() {
  const { data: profile } = useProfile()
  const { data: goals = [] } = useGoals()
  const { showToast } = useToast()
  const tz = profile?.timezone ?? 'UTC'
  const today = todayLocal(tz)
  const [date, setDate] = useState(today)
  const { data: log, isLoading } = useLog(date)
  const { mutate: upsert, isPending } = useUpsertLog()
  const active = goals.filter((g) => g.status === 'active')
  const [form, setForm] = useState({ wins: '', blockers: '', focus: '', ratings: {} })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    setForm({ wins: log?.wins ?? '', blockers: log?.blockers ?? '', focus: log?.tomorrow_focus ?? '', ratings: log?.goal_ratings ?? {} })
  }, [log])

  function save() {
    upsert({ log_date: date, wins: form.wins, blockers: form.blockers, tomorrow_focus: form.focus, goal_ratings: form.ratings },
      { onSuccess: () => showToast('Review saved', 'success') })
  }

  const rate = (id, val) => setForm((f) => ({ ...f, ratings: { ...f.ratings, [id]: f.ratings[id] === val ? null : val } }))

  if (isLoading) return (
    <div className="p-4 flex flex-col gap-3 max-w-2xl mx-auto">
      {[1, 2, 3].map((i) => <SkeletonRow key={i} height="56px" />)}
    </div>
  )

  return (
    <div className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
      <input type="date" value={date} max={today} min={addDays(today, -30)}
        onChange={(e) => e.target.value && setDate(e.target.value)}
        className="bg-gray-800 border border-gray-700/50 text-gray-300 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-purple-500 self-start" />
      <div className="flex flex-col gap-1"><p className={lbl}>Wins</p>
        <textarea value={form.wins} onChange={set('wins')} placeholder="What went well today?" rows={3} className={ta} /></div>
      <div className="flex flex-col gap-1"><p className={lbl}>Blockers</p>
        <textarea value={form.blockers} onChange={set('blockers')} placeholder="What got in the way?" rows={3} className={ta} /></div>
      <div className="flex flex-col gap-1"><p className={lbl}>Tomorrow's focus</p>
        <textarea value={form.focus} onChange={set('focus')} placeholder="One thing to prioritize tomorrow" rows={2} className={ta} /></div>
      {active.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className={lbl}>Goal check-in</p>
          {active.map((g) => (
            <div key={g.id} className="flex items-center justify-between bg-gray-800/60 border border-gray-700/40 rounded-lg px-3 py-2">
              <span className="text-gray-300 text-sm">{g.title}</span>
              <div className="flex gap-3">
                {['up', 'down'].map((v) => (
                  <button key={v} onClick={() => rate(g.id, v)}
                    className={`text-lg transition-opacity ${form.ratings[g.id] === v ? 'opacity-100' : 'opacity-25 hover:opacity-60'}`}>
                    {v === 'up' ? '👍' : '👎'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={save} disabled={isPending}
        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2 transition-colors">
        {isPending ? 'Saving…' : 'Save review'}
      </button>
      <p className="text-gray-600 text-xs text-center">You can log for any past day — no pressure to do it nightly.</p>
    </div>
  )
}
