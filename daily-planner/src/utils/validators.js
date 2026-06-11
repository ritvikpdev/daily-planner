const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

function ok() {
  return { valid: true, error: null }
}

function fail(error) {
  return { valid: false, error }
}

export function validateTitle(title) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    return fail('Title must not be empty.')
  }
  if (title.trim().length > 120) {
    return fail('Title must be 120 characters or fewer.')
  }
  return ok()
}

export function validateTimeSlot(start, end) {
  if (!TIME_RE.test(start)) return fail('Start time must be in HH:MM format.')
  if (!TIME_RE.test(end)) return fail('End time must be in HH:MM format.')

  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  if (eh * 60 + em <= sh * 60 + sm) {
    return fail('End time must be after start time.')
  }
  return ok()
}

/**
 * Returns true if [newStart, newEnd) overlaps any task in existingTasks
 * that has mode === 'structured' and valid start_time / end_time values.
 */
export function hasOverlap(newStart, newEnd, existingTasks) {
  const toMins = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const ns = toMins(newStart)
  const ne = toMins(newEnd)

  return existingTasks.some((task) => {
    if (task.mode !== 'structured') return false
    if (!task.start_time || !task.end_time) return false
    const ts = toMins(task.start_time)
    const te = toMins(task.end_time)
    // Overlap when one interval starts before the other ends.
    return ns < te && ne > ts
  })
}
