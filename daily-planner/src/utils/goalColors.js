export const GOAL_COLORS = {
  purple: '#7F77DD',
  teal:   '#1D9E75',
  amber:  '#BA7517',
  blue:   '#378ADD',
  coral:  '#D85A30',
  green:  '#639922',
}

export function goalColor(color) {
  return GOAL_COLORS[color] ?? GOAL_COLORS.purple
}
