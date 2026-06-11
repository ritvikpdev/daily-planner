import { todayLocal, daysBetween, previousDay } from './dateUtils.js'

const GRACE_DAYS = 7

/**
 * Returns the current streak length for a single goal's task array.
 *
 * A day is "active" when at least one task with that planned_date has done === true.
 * The streak counts consecutive calendar days ending at the most recent active day,
 * but only within the last GRACE_DAYS days from today.
 */
export function currentStreak(goalTasks, tz) {
  if (!goalTasks || goalTasks.length === 0) return 0

  const today = todayLocal(tz)

  // Collect the unique active dates within the grace window.
  const activeDates = new Set()
  for (const task of goalTasks) {
    if (!task.done) continue
    const daysAgo = daysBetween(task.planned_date, today)
    if (daysAgo >= 0 && daysAgo < GRACE_DAYS) {
      activeDates.add(task.planned_date)
    }
  }

  if (activeDates.size === 0) return 0

  // Find the most recent active date to start counting backwards from.
  const sorted = [...activeDates].sort().reverse()
  const anchor = sorted[0]

  // Walk backwards day by day from the anchor, counting consecutive active days.
  let streak = 0
  let cursor = anchor
  while (activeDates.has(cursor)) {
    streak++
    cursor = previousDay(cursor)
  }

  return streak
}
