import { useState } from 'react'
import type { Program } from '../content/types'
import { comparePrograms, dateKey, formatEventRange, formatTime, pastEvents, programDate, programEndDate, programStart, TIME_ZONE, upcomingEvents } from '../lib/dates'
import { ProgramStatus } from './ProgramStatus'

interface EventScheduleProps {
  programs: Program[]
  now: Date
  selectedId?: string
  initialEvent?: Program
  onSelect: (event: Program) => void
}

type Category = 'all' | 'music' | 'dance'
const categories: { id: Category; label: string }[] = [
  { id: 'all', label: 'All programs' },
  { id: 'music', label: 'Music' },
  { id: 'dance', label: 'Dance' },
]
const monthFormatter = new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: TIME_ZONE })

function isCategory(event: Program, category: Category) {
  const music = event.artForm === 'Carnatic music' || event.artForm === 'Hindustani music'
  return category === 'all' || (category === 'music' ? music : !music)
}

export function EventSchedule({ programs, now, selectedId, initialEvent, onSelect }: EventScheduleProps) {
  const years = [...new Set(programs.flatMap((event) => {
    const first = Number(programDate(event).slice(0, 4))
    const last = Number(programEndDate(event).slice(0, 4))
    return Array.from({ length: last - first + 1 }, (_, index) => first + index)
  }))].sort((a, b) => a - b)
  const next = upcomingEvents(programs, now)[0]
  const [preferredYear, setYear] = useState(() => {
    const initial = initialEvent ?? next
    return initial ? Number(programDate(initial).slice(0, 4)) : years.at(-1) ?? Number(dateKey(now).slice(0, 4))
  })
  const year = years.includes(preferredYear) || years.length === 0 ? preferredYear : years[0]
  const [category, setCategory] = useState<Category>('all')
  const season = programs.filter((event) => programDate(event) <= `${year}-12-31` && programEndDate(event) >= `${year}-01-01`).sort(comparePrograms)
  const visible = season.filter((event) => isCategory(event, category))
  const passed = new Set(pastEvents(programs, now).map((event) => event.id))

  return (
    <section className="season-calendar" aria-labelledby="season-title" id="program-schedule">
      <div className="season-toolbar">
        <div className="season-heading">
          <h2 id="season-title" tabIndex={-1}>{year} <em>season</em></h2>
          <p>Music, dance, and a year of shared experiences.</p>
        </div>
        {years.length > 1 && <div className="season-year"><label htmlFor="program-year">Program year</label><select id="program-year" value={year} onChange={(event) => setYear(Number(event.target.value))}>{years.map((option) => <option key={option}>{option}</option>)}</select></div>}
      </div>
      {season.length > 0 && <div className="season-filterbar">
        <div className="season-filters" role="group" aria-label="Filter programs">
          {categories.map((item) => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label} <span>{season.filter((event) => isCategory(event, item.id)).length}</span></button>)}
        </div>
        <p className="season-count" role="status">{visible.length} {visible.length === 1 ? 'program' : 'programs'}<span> &middot; Dates in IST</span></p>
      </div>}
      {visible.length > 0 ? <ul className="season-programs" aria-label={`Programs for ${year}`}>
        {visible.map((event) => {
          const date = programDate(event)
          const multiDay = date !== programEndDate(event)
          const music = isCategory(event, 'music')
          return (
            <li key={event.id}>
              <button id={`program-${event.id}`} type="button" className={`program-tile ${music ? 'program-music' : 'program-dance'}`} aria-pressed={selectedId === event.id} aria-controls={selectedId === event.id ? 'event-details' : undefined} aria-label={`${event.title}, ${formatEventRange(event)}${event.tentative ? ', proposed date' : event.sample ? ', sample program' : ''}`} onClick={() => onSelect(event)}>
                <time dateTime={programStart(event)} className="program-date"><span>{monthFormatter.format(new Date(programStart(event)))}</span><strong>{date.slice(8)}</strong>{date.slice(0, 4) !== String(year) && <small>{date.slice(0, 4)}</small>}</time>
                <span className="program-tile-content">
                  <span className="program-artform">{event.artForm}</span>
                  <strong className="program-title">{event.title}</strong>
                  <span className="program-time">{multiDay ? formatEventRange(event) : event.startsAt ? `${formatTime(event.startsAt)} IST` : 'Time to be announced'}</span>
                  <span className="program-tile-bottom"><ProgramStatus event={event} /><span className="program-open" aria-hidden="true">&#8599;</span></span>
                </span>
                {passed.has(event.id) ? <span className="program-date-note">Date passed</span> : next?.id === event.id && <span className="program-date-note next-program">Next up</span>}
              </button>
            </li>
          )
        })}
      </ul> : <div className="empty-state season-empty">
        <h3>{season.length ? 'A different rhythm awaits.' : 'The next season is taking shape.'}</h3>
        <p>{season.length ? `No ${category} programs are listed for ${year}.` : 'No programs have been listed yet. Please check back for future announcements.'}</p>
        {season.length > 0 && <button type="button" className="text-link" onClick={() => setCategory('all')}>Show all programs &rarr;</button>}
      </div>}
    </section>
  )
}
