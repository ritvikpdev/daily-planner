import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { currentStreak } from '../src/utils/streakCalculator.js'

const TZ = 'UTC'

// Pin "today" to a fixed date so tests never drift.
const FAKE_TODAY = '2024-06-10'

// Build a Date whose UTC midnight matches the fake today.
const FAKE_NOW = new Date(`${FAKE_TODAY}T12:00:00Z`)

function makeTask(planned_date, done = true) {
  return { planned_date, done, done_at: null }
}

function daysAgo(n) {
  const d = new Date(FAKE_NOW)
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FAKE_NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('currentStreak', () => {
  it('returns 0 for empty task array', () => {
    expect(currentStreak([], TZ)).toBe(0)
  })

  it('returns 1 when one task is done today', () => {
    const tasks = [makeTask(daysAgo(0))]
    expect(currentStreak(tasks, TZ)).toBe(1)
  })

  it('returns 2 when tasks are done today and yesterday', () => {
    const tasks = [makeTask(daysAgo(0)), makeTask(daysAgo(1))]
    expect(currentStreak(tasks, TZ)).toBe(2)
  })

  it('breaks streak on a 1-day gap — returns 1 for today only', () => {
    // Done today and 2 days ago, but NOT yesterday.
    const tasks = [makeTask(daysAgo(0)), makeTask(daysAgo(2))]
    expect(currentStreak(tasks, TZ)).toBe(1)
  })

  it('returns 0 for a task done 8 days ago (outside grace window)', () => {
    const tasks = [makeTask(daysAgo(8))]
    expect(currentStreak(tasks, TZ)).toBe(0)
  })

  it('uses planned_date, not done_at (retroactive completion)', () => {
    // Task planned for yesterday, marked done today — should count as yesterday.
    const task = { planned_date: daysAgo(1), done: true, done_at: FAKE_TODAY }
    expect(currentStreak([task], TZ)).toBe(1)
  })

  it('returns 3 for three consecutive days', () => {
    const tasks = [makeTask(daysAgo(0)), makeTask(daysAgo(1)), makeTask(daysAgo(2))]
    expect(currentStreak(tasks, TZ)).toBe(3)
  })
})
