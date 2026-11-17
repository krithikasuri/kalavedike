import { describe, expect, it } from 'vitest'
import { calendarDays, currentMonth, dateKey, formatEventRange, formatTime, monthLabel, occursOn, pastEvents, programDate, programStart, shiftMonth, upcomingEvents } from './dates'
import type { Program } from '../content/types'

const program = {
  id: 'test',
  title: 'Test',
  artForm: 'Carnatic music',
  startsAt: '2026-12-31T23:00:00+05:30',
  endsAt: '2027-01-02T01:00:00+05:30',
  venue: 'Test venue',
  description: 'Test description',
  sample: true,
} satisfies Program

describe('IST dates', () => {
  it('uses the India calendar date at a UTC day/month/year boundary', () => {
    expect(dateKey('2026-12-31T19:00:00Z')).toBe('2027-01-01')
    expect(currentMonth(new Date('2026-12-31T19:00:00Z'))).toEqual({ year: 2027, month: 0 })
    expect(formatTime('2026-12-31T19:00:00Z')).toMatch(/12:30\s*am/i)
  })

  it('includes a multi-day event on every occupied IST date', () => {
    expect(occursOn(program, '2026-12-30')).toBe(false)
    expect(occursOn(program, '2026-12-31')).toBe(true)
    expect(occursOn(program, '2027-01-01')).toBe(true)
    expect(occursOn(program, '2027-01-02')).toBe(true)
    expect(occursOn(program, '2027-01-03')).toBe(false)
    expect(formatEventRange(program)).toContain('31 December 2026')
    expect(formatEventRange(program)).toContain('2 January 2027')
    expect(formatEventRange(program)).toContain('IST')
  })

  it('formats a same-day event without repeating the date', () => {
    const text = formatEventRange({ ...program, endsAt: '2026-12-31T23:30:00+05:30' })
    expect(text.match(/31 December 2026/g)).toHaveLength(1)
  })
})

describe('program collections', () => {
  const first = { ...program, id: 'earlier', startsAt: '2026-10-01T10:00:00+05:30', endsAt: '2026-10-01T11:00:00+05:30' }
  const last = { ...program, id: 'later', startsAt: '2027-12-01T10:00:00+05:30', endsAt: '2027-12-01T11:00:00+05:30' }
  const now = new Date('2027-01-01T12:00:00+05:30')

  it('sorts upcoming events and retains ongoing multi-day programs', () => {
    const source = [last, first, program]
    expect(upcomingEvents(source, now).map((event) => event.id)).toEqual(['test', 'later'])
    expect(source.map((event) => event.id)).toEqual(['later', 'earlier', 'test'])
  })

  it('uses complementary end-time boundaries for past/upcoming', () => {
    const end = new Date(program.endsAt)
    expect(upcomingEvents([program], end)).toHaveLength(1)
    expect(pastEvents([program], end)).toHaveLength(0)
    expect(pastEvents([program], new Date(end.getTime() + 1))).toHaveLength(1)
    expect(pastEvents([first, program], new Date('2028-01-01')).map((event) => event.id)).toEqual(['test', 'earlier'])
  })

  it('returns honest empty collections', () => {
    expect(upcomingEvents([], now)).toEqual([])
    expect(pastEvents([], now)).toEqual([])
  })

  it('keeps date-only programs upcoming through the entire IST date', () => {
    const dateOnly: Program = { id: 'date-only', title: 'Proposed concert', artForm: 'Carnatic music', date: '2027-01-23', description: 'Proposed', venue: 'TBA', sample: false, tentative: true }
    expect(upcomingEvents([dateOnly], new Date('2027-01-23T18:29:59Z'))).toHaveLength(1)
    expect(pastEvents([dateOnly], new Date('2027-01-23T18:30:00Z'))).toHaveLength(1)
    expect(programStart(dateOnly)).toBe('2027-01-23')
    expect(programDate(dateOnly)).toBe('2027-01-23')
    expect(formatEventRange(dateOnly)).toBe('23 January 2027 | Time to be announced (IST)')
    expect(occursOn(dateOnly, '2027-01-23')).toBe(true)
    expect(occursOn(dateOnly, '2027-01-22')).toBe(false)
    expect(occursOn(dateOnly, '2027-01-24')).toBe(false)
  })

  it('sorts mixed date-only and timed programs consistently without inventing times', () => {
    const dateOnly: Program = { id: 'date-only', title: 'Date only', artForm: 'Carnatic music', date: '2026-12-31', description: '', venue: 'TBA', sample: false }
    expect(upcomingEvents([program, dateOnly], new Date('2026-12-01T00:00:00Z')).map((event) => event.id)).toEqual(['date-only', 'test'])
  })
})

describe('month calendar calculations', () => {
  it('handles leap years and pads complete weeks', () => {
    const days = calendarDays(2028, 1)
    expect(days.filter(Boolean)).toHaveLength(29)
    expect(days).toHaveLength(35)
    expect(days[0]).toBeNull()
    expect(days[2]).toEqual({ day: 1, key: '2028-02-01' })
    expect(calendarDays(2027, 1).filter(Boolean)).toHaveLength(28)
    expect(calendarDays(2026, 7)).toHaveLength(42)
  })

  it('handles December/January navigation', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 })
    expect(shiftMonth(2027, 0, -1)).toEqual({ year: 2026, month: 11 })
    expect(monthLabel(2026, 11)).toBe('December 2026')
  })
})
