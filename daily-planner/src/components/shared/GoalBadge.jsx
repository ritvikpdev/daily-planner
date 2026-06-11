const COLOR_MAP = {
  purple: 'bg-purple-900 text-purple-200',
  teal:   'bg-teal-900 text-teal-200',
  amber:  'bg-amber-900 text-amber-200',
  blue:   'bg-blue-900 text-blue-200',
  coral:  'bg-orange-900 text-orange-200',
  green:  'bg-green-900 text-green-200',
}

export function GoalBadge({ color, label }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${COLOR_MAP[color] ?? COLOR_MAP.purple}`}>
      {label}
    </span>
  )
}
