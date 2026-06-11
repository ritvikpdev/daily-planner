/**
 * All date computations go through this file.
 * new Date() is only called here.
 */

// Returns a 'YYYY-MM-DD' string from a Date object interpreted in the given timezone.
function toLocalDateStr(date, tz) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(date)
}

// Parses a 'YYYY-MM-DD' string into { year, month, day } (all numbers).
function parseDateStr(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return { year, month, day }
}

// Builds a UTC noon Date from a 'YYYY-MM-DD' string to avoid DST edge cases.
function toNoonUTC(dateStr) {
  const { year, month, day } = parseDateStr(dateStr)
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
}

export function todayLocal(tz) {
  return toLocalDateStr(new Date(), tz)
}

export function yesterdayLocal(tz) {
  const now = new Date()
  now.setUTCDate(now.getUTCDate() - 1)
  // Shift by a full day then re-localise so timezone offsets don't drift us further.
  return toLocalDateStr(new Date(Date.now() - 864e5), tz)
}

export function daysBetween(dateA, dateB) {
  const msPerDay = 864e5
  return Math.round((toNoonUTC(dateB) - toNoonUTC(dateA)) / msPerDay)
}

export function previousDay(dateStr) {
  const d = toNoonUTC(dateStr)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function nextDay(dateStr) {
  const d = toNoonUTC(dateStr)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function formatDisplay(dateStr) {
  const { year, month, day } = parseDateStr(dateStr)
  // Use UTC so the display isn't shifted by the local machine timezone.
  const d = new Date(Date.UTC(year, month - 1, day))
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return { hours, minutes }
}

export function isTimeAfter(timeA, timeB) {
  const a = parseTime(timeA)
  const b = parseTime(timeB)
  return a.hours * 60 + a.minutes > b.hours * 60 + b.minutes
}

export function dateRange(startDate, endDate) {
  const result = []
  let current = startDate
  while (daysBetween(current, endDate) >= 0) {
    result.push(current)
    current = nextDay(current)
  }
  return result
}

export function addDays(dateStr, n) {
  const d = toNoonUTC(dateStr)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export function formatWeekRange(monday, sunday) {
  const fmt = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  return `${fmt(monday)} – ${fmt(sunday)}`
}

export function weekBounds(dateStr) {
  const d = toNoonUTC(dateStr)
  // getUTCDay(): 0 = Sunday … 6 = Saturday; ISO week starts Monday (1).
  const dow = d.getUTCDay()
  const offsetToMonday = dow === 0 ? -6 : 1 - dow
  const monday = new Date(d)
  monday.setUTCDate(d.getUTCDate() + offsetToMonday)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  return {
    monday: monday.toISOString().slice(0, 10),
    sunday: sunday.toISOString().slice(0, 10),
  }
}
