import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EventSchedule } from '../components/EventSchedule'
import { EventDetails } from '../components/EventDetails'
import { events, eventSource } from '../content/events'
import type { Program } from '../content/types'
import { useNow } from '../lib/useNow'
import { formatDate } from '../lib/dates'

export function EventsPage() {
  const [params, setParams] = useSearchParams()
  const requestedId = params.get('event')
  const requestedEvent = events.find((event) => event.id === requestedId)
  const [shouldFocus, setShouldFocus] = useState(false)
  const returnToProgram = useRef<string | null>(null)
  const now = useNow()
  const select = (event: Program) => {
    setShouldFocus(true)
    setParams({ event: event.id }, { replace: true })
  }
  useEffect(() => {
    if (!requestedId && returnToProgram.current) {
      const target = document.getElementById(`program-${returnToProgram.current}`) ?? document.getElementById('season-title')
      target?.focus()
      returnToProgram.current = null
    }
  }, [requestedId])
  const closeDetails = () => {
    returnToProgram.current = requestedEvent?.id ?? null
    const nextParams = new URLSearchParams(params)
    nextParams.delete('event')
    setParams(nextParams, { replace: true })
  }

  return (
    <>
      <section className="events-hero container">
        <div><p className="eyebrow">Bringing the arts closer to home</p><h1>Make time for <em>the arts.</em></h1></div>
        <p>Browse the whole season at a glance. Find the music and dance you love, closer to our neighbourhood.</p>
      </section>
      <section className="container events-section">
        <div className="season-notice"><span className="sample-badge">Proposed dates / Not confirmed bookings</span><p>Artists, times, and venues to be announced.</p></div>
        {requestedId && !requestedEvent && <p role="status" className="inline-notice">That program could not be found. Browse the calendar for available listings.</p>}
        {requestedEvent && <div className="selected-program"><button type="button" className="text-link" onClick={closeDetails}>&larr; Back to all programs</button><EventDetails event={requestedEvent} focus={shouldFocus} /></div>}
        <EventSchedule programs={events} now={now} selectedId={requestedEvent?.id} initialEvent={requestedEvent} onSelect={select} />
        <p className="schedule-source">From our {eventSource.label}. Last imported {formatDate(eventSource.importedAt)}; this is a snapshot, not a live feed.</p>
      </section>
    </>
  )
}
