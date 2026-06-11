import { useState, useEffect } from 'react'
import { useProfile, useUpsertProfile } from '../../hooks/useProfile.js'
import { useToast } from '../shared/Toast.jsx'
import { CalendarNudgeButton } from '../reminders/CalendarNudgeButton.jsx'

const inp = 'bg-gray-800 border border-gray-700/50 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-purple-500'
const lbl = 'text-xs text-gray-500 font-medium uppercase tracking-wide'

export function SettingsView() {
  const { data: profile } = useProfile()
  const { mutate: upsert, isPending } = useUpsertProfile()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [tz, setTz] = useState('UTC')

  useEffect(() => {
    if (profile) { setName(profile.display_name ?? ''); setTz(profile.timezone ?? 'UTC') }
  }, [profile])

  function save() {
    upsert({ display_name: name || null, timezone: tz || 'UTC' },
      { onSuccess: () => showToast('Settings saved', 'success') })
  }

  return (
    <div className="p-4 flex flex-col gap-4 max-w-2xl mx-auto">
      <h2 className="text-white text-base font-medium">Settings</h2>
      <div className="flex flex-col gap-1"><p className={lbl}>Display name</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inp} /></div>
      <div className="flex flex-col gap-1"><p className={lbl}>Timezone</p>
        <input value={tz} onChange={(e) => setTz(e.target.value)} placeholder="UTC" className={inp} />
        <p className="text-gray-600 text-xs">e.g. America/New_York, Asia/Kolkata</p></div>
      <button onClick={save} disabled={isPending}
        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2 transition-colors">
        {isPending ? 'Saving…' : 'Save settings'}
      </button>
      <div className="pt-2 border-t border-gray-800 flex flex-col gap-2">
        <p className={lbl}>Reminders</p>
        <CalendarNudgeButton />
      </div>
    </div>
  )
}
