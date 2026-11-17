import type { Program } from '../content/types'

export const TIME_ZONE = 'Asia/Kolkata'
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
const dayFormatter = new Intl.DateTimeFormat('en-IN', { timeZone: TIME_ZONE, day: 'numeric', month: 'long', year: 'numeric' })
const timeFormatter = new Intl.DateTimeFormat('en-IN', { timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit', hour12: true })

export function dateKey(date: Date | string): string {
  const parts = dateKeyFormatter.formatToParts(new Date(date))
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value
  return `${value('year')}-${value('month')}-${value('day')}`
}

export function formatDate(date: Date | string) {
  return dayFormatter.format(new Date(date))
}

export function formatTime(date: Date | string) {
  return timeFormatter.format(new Date(date))
}

export function programStart(event: Program): string {
  return event.startsAt ?? event.date
}

export function programDate(event: Program): string {
  return event.date ?? dateKey(event.startsAt)
}

export function programEndDate(event: Program): string {
  return event.date ?? dateKey(event.endsAt)
}

function isUpcoming(event: Program, now: Date) {
  return event.date !== undefined
    ? event.date >= dateKey(now)
    : new Date(event.endsAt).getTime() >= now.getTime()
}

export function comparePrograms(a: Program, b: Program) {
  const dateOrder = programDate(a).localeCompare(programDate(b))
  if (dateOrder) return dateOrder
  if (a.startsAt === undefined) return b.startsAt === undefined ? 0 : -1
  if (b.startsAt === undefined) return 1
  return Date.parse(a.startsAt) - Date.parse(b.startsAt)
}

export function formatEventRange(event: Program) {
  if (event.date !== undefined) return `${formatDate(event.date)} | Time to be announced (IST)`
  return dateKey(event.startsAt) === dateKey(event.endsAt)
    ? `${formatDate(event.startsAt)} | ${formatTime(event.startsAt)} - ${formatTime(event.endsAt)} IST`
    : `${formatDate(event.startsAt)}, ${formatTime(event.startsAt)} - ${formatDate(event.endsAt)}, ${formatTime(event.endsAt)} IST`
}

export function upcomingEvents(programs: Program[], now: Date) {
  return programs.filter((event) => isUpcoming(event, now)).sort(comparePrograms)
}

export function pastEvents(programs: Program[], now: Date) {
  return programs.filter((event) => !isUpcoming(event, now)).sort((a, b) => comparePrograms(b, a))
}

export function occursOn(event: Program, key: string) {
  return programDate(event) <= key && programEndDate(event) >= key
}

export function currentMonth(now: Date) {
  const [year, month] = dateKey(now).split('-').map(Number)
  return { year, month: month - 1 }
}

export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(Date.UTC(year, month + delta, 1))
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() }
}

export function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month, 1)))
}

export function calendarDays(year: number, month: number) {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const cells = Math.ceil((firstWeekday + count) / 7) * 7
  return Array.from({ length: cells }, (_, index) => {
    const day = index - firstWeekday + 1
    return day > 0 && day <= count
      ? { day, key: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` }
      : null
  })
}
