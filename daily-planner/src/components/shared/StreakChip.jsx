import { useRef, useEffect, useState } from 'react'

const COLOR_MAP = {
  purple: 'border-purple-500 text-purple-300',
  teal:   'border-teal-500 text-teal-300',
  amber:  'border-amber-500 text-amber-300',
  blue:   'border-blue-500 text-blue-300',
  coral:  'border-orange-500 text-orange-300',
  green:  'border-green-500 text-green-300',
}

export function StreakChip({ count, color = 'purple' }) {
  const cls = COLOR_MAP[color] ?? COLOR_MAP.purple
  const prevCount = useRef(count)
  const [pulsing, setPulsing] = useState(false)

  useEffect(() => {
    if (count > prevCount.current) {
      setPulsing(true)
      setTimeout(() => setPulsing(false), 300)
    }
    prevCount.current = count
  }, [count])

  return (
    <span
      style={{ animation: pulsing ? 'streak-pulse 300ms ease' : undefined }}
      className={`inline-flex items-center gap-1 border rounded-full px-2 py-0.5 text-xs ${cls}`}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="font-medium">{count}</span>
      <span className="text-gray-400">day streak</span>
    </span>
  )
}
