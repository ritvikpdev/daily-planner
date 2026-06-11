import { useState } from 'react'

export function MissedDayBanner({ missedDays, lastDate, onGoToReview }) {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(`missed_banner_${lastDate}`) === 'true'
  )

  if (dismissed || (missedDays !== 1 && missedDays !== 2)) return null

  function dismiss() {
    sessionStorage.setItem(`missed_banner_${lastDate}`, 'true')
    setDismissed(true)
  }

  const msg = missedDays === 1 ? "You didn't log yesterday." : "You've been away 2 days."
  const cta = missedDays === 1 ? 'Fill it in →' : 'Catch up →'

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-amber-900/40 border border-amber-700/50 rounded-lg text-sm">
      <span className="flex-1 text-amber-200">{msg}</span>
      <button onClick={() => onGoToReview(lastDate)}
        className="text-amber-300 hover:text-amber-100 font-medium whitespace-nowrap transition-colors">
        {cta}
      </button>
      <button onClick={dismiss} className="text-amber-600 hover:text-amber-300 transition-colors leading-none">×</button>
    </div>
  )
}
