import { useState } from 'react'
import { useAddGoal } from '../../hooks/useGoals.js'
import { useAddRecurring } from '../../hooks/useRecurring.js'
import { validateTitle, validateTimeSlot } from '../../utils/validators.js'
import { MODE_LABELS } from '../../utils/labels.js'

const COLORS = ['purple','teal','amber','blue','coral','green']
const HEX = { purple:'#a855f7',teal:'#14b8a6',amber:'#f59e0b',blue:'#3b82f6',coral:'#f97316',green:'#22c55e' }
const ICONS = ['🎯','💼','❤️','🧠','🏋️','⭐']
const KEYS = ['target','briefcase','heart','brain','barbell','star']
const ET = () => ({ title:'', structured:false, start:'', end:'' })
const inp = 'bg-gray-700 text-white rounded px-2 py-1 outline-none focus:ring-1 focus:ring-purple-500'

export function AddGoalFlow({ onDone }) {
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [color, setColor] = useState('purple')
  const [icon, setIcon] = useState(0)
  const [tasks, setTasks] = useState([ET()])
  const [errors, setErrors] = useState({})
  const { mutate: addGoal, isPending } = useAddGoal()
  const { mutate: addRecurring } = useAddRecurring()
  const upd = (i, p) => setTasks((prev) => prev.map((t, idx) => idx === i ? { ...t, ...p } : t))

  function nextStep() {
    if (step === 1) { const v = validateTitle(title); if (!v.valid) return setErrors({ title: v.error }) }
    setErrors({}); setStep((s) => s + 1)
  }

  function submit() {
    const errs = {}
    tasks.forEach((t, i) => {
      if (!t.title.trim()) return
      const tv = validateTitle(t.title); if (!tv.valid) errs[`t${i}`] = tv.error
      if (t.structured) { const sv = validateTimeSlot(t.start, t.end); if (!sv.valid) errs[`s${i}`] = sv.error }
    })
    if (Object.keys(errs).length) return setErrors(errs)
    addGoal({ title, description: desc || null, color, icon: KEYS[icon] }, {
      onSuccess: (goal) => {
        tasks.filter((t) => t.title.trim()).forEach((t) => addRecurring({
          goal_id: goal.id, title: t.title,
          default_mode: t.structured ? 'structured' : 'freeform',
          default_start: t.structured ? t.start : null,
          default_end: t.structured ? t.end : null,
        }))
        onDone()
      },
    })
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col gap-4">
      <div className="flex gap-1">{[1,2,3].map((s) => <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-purple-500' : 'bg-gray-700'}`} />)}</div>

      {step === 1 && <div className="flex flex-col gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title *" className={`${inp} text-sm`} />
        {errors.title && <p className="text-red-400 text-xs">{errors.title}</p>}
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" rows={2} className={`${inp} text-sm resize-none`} />
      </div>}

      {step === 2 && <div className="flex flex-col gap-3">
        <div><p className="text-gray-400 text-xs mb-1">Color</p>
          <div className="flex gap-2">{COLORS.map((c) => <button key={c} onClick={() => setColor(c)} title={c} style={{ backgroundColor: HEX[c] }} className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'ring-2 ring-white scale-110' : ''}`} />)}</div>
        </div>
        <div><p className="text-gray-400 text-xs mb-1">Icon</p>
          <div className="flex gap-2">{ICONS.map((ic, i) => <button key={i} onClick={() => setIcon(i)} className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center ${icon === i ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}>{ic}</button>)}</div>
        </div>
      </div>}

      {step === 3 && <div className="flex flex-col gap-2">
        <p className="text-gray-400 text-xs">Recurring tasks (optional)</p>
        {tasks.map((t, i) => <div key={i} className="flex flex-col gap-1">
          <input value={t.title} onChange={(e) => upd(i, { title: e.target.value })} placeholder={`Task ${i + 1} title`} className={`${inp} text-sm`} />
          {errors[`t${i}`] && <p className="text-red-400 text-xs">{errors[`t${i}`]}</p>}
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={t.structured} onChange={(e) => upd(i, { structured: e.target.checked })} /> {MODE_LABELS.structured}
          </label>
          {t.structured && <div className="flex gap-2">
            <input value={t.start} onChange={(e) => upd(i, { start: e.target.value })} placeholder="09:00" className={`${inp} text-xs w-20`} />
            <input value={t.end} onChange={(e) => upd(i, { end: e.target.value })} placeholder="10:00" className={`${inp} text-xs w-20`} />
          </div>}
          {errors[`s${i}`] && <p className="text-red-400 text-xs">{errors[`s${i}`]}</p>}
        </div>)}
        {tasks.length < 3 && <button onClick={() => setTasks((p) => [...p, ET()])} className="text-xs text-gray-500 hover:text-purple-400 self-start mt-1">+ Add another</button>}
      </div>}

      <div className="flex justify-between">
        <button onClick={step === 1 ? onDone : () => setStep((s) => s - 1)} className="text-sm text-gray-400 hover:text-gray-200">
          {step === 1 ? 'Cancel' : '← Back'}
        </button>
        {step < 3
          ? <button onClick={nextStep} className="text-sm text-purple-400 hover:text-purple-300">Next →</button>
          : <button onClick={submit} disabled={isPending} className="text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50">{isPending ? 'Saving…' : 'Create goal'}</button>}
      </div>
    </div>
  )
}
