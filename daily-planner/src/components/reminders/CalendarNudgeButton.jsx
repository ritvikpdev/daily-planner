export function CalendarNudgeButton() {
  function open() {
    const base = 'https://calendar.google.com/calendar/render'
    const q = [
      'action=TEMPLATE',
      `text=${encodeURIComponent('Log your daily planner')}`,
      `recur=${encodeURIComponent('RRULE:FREQ=DAILY')}`,
      `details=${encodeURIComponent('Open your daily planner and log your tasks')}`,
    ].join('&')
    window.open(`${base}?${q}`, '_blank', 'noopener')
  }
  return (
    <button onClick={open}
      className="text-sm text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-4 py-2 transition-colors">
      Add 7 AM daily reminder to Google Calendar
    </button>
  )
}
