import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'
import { useArchiveOldTasks } from './hooks/useTasks.js'
import { Toaster } from './components/shared/Toast.jsx'
import { GoalsView } from './components/goals/GoalsView.jsx'

const TABS = ['Today', 'Plan', 'Goals', 'Progress', 'Review']

const NAV_ICONS = { Today: '◉', Plan: '⊞', Goals: '⊙', Progress: '▦', Review: '≡' }

function TabView({ tab }) {
  if (tab === 'Goals') return <GoalsView />
  return <div className="p-4 text-white">{tab}</div>
}

function MainApp() {
  const [active, setActive] = useState('Today')
  const { mutate: archiveOld } = useArchiveOldTasks()
  useEffect(() => { archiveOld('UTC') }, [])

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-20 bg-gray-800 border-r border-gray-700 pt-6 gap-1">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActive(tab)}
            className={`flex flex-col items-center gap-1 py-3 text-xs transition-colors
              ${active === tab ? 'text-purple-400' : 'text-gray-400 hover:text-gray-200'}`}>
            <span className="text-lg">{NAV_ICONS[tab]}</span>
            <span>{tab}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <TabView tab={active} />
      </main>

      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 flex md:hidden bg-gray-800 border-t border-gray-700">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActive(tab)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors
              ${active === tab ? 'text-purple-400' : 'text-gray-400 hover:text-gray-200'}`}>
            <span className="text-base">{NAV_ICONS[tab]}</span>
            <span>{tab}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  async function handle(action) {
    setError(null)
    const fn = action === 'signin' ? supabase.auth.signInWithPassword : supabase.auth.signUp
    const { error: err } = await fn.call(supabase.auth, { email, password })
    if (err) setError(err.message)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-sm bg-gray-800 rounded-xl p-8 flex flex-col gap-4">
        <h1 className="text-white text-xl font-medium">Daily Planner</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input value={email} onChange={(e) => setEmail(e.target.value)}
          type="email" placeholder="Email"
          className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
        <input value={password} onChange={(e) => setPassword(e.target.value)}
          type="password" placeholder="Password"
          className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
        <div className="flex gap-2">
          <button onClick={() => handle('signin')}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 text-sm font-medium transition-colors">
            Sign In
          </button>
          <button onClick={() => handle('signup')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 text-sm transition-colors">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  return (
    <>
      {session ? <MainApp /> : <LoginForm />}
      <Toaster />
    </>
  )
}
