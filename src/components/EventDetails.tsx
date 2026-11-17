import { useEffect, useRef } from 'react'
import type { Program } from '../content/types'
import { formatEventRange } from '../lib/dates'
import { EventArtwork } from './EventArtwork'
import { ProgramStatus } from './ProgramStatus'

export function EventDetails({ event, focus = false }: { event: Program; focus?: boolean }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (focus) heading.current?.focus()
  }, [event.id, focus])
  return (
    <article className="event-details" aria-labelledby="event-details-title" id="event-details">
      <EventArtwork event={event} />
      <div className="details-body">
        <p className="eyebrow">{event.artForm}</p>
        <h2 id="event-details-title" tabIndex={-1} ref={heading}>{event.title}</h2>
        <ProgramStatus event={event} />
        <dl>
          <div><dt>When</dt><dd>{formatEventRange(event)}</dd></div>
          <div><dt>Where</dt><dd>{event.venue}</dd></div>
          <div><dt>Artists</dt><dd>{event.artists?.length ? <ul className="event-artists">{event.artists.map((artist, index) => <li key={`${artist.name}-${index}`}>{artist.url ? <a href={artist.url} target="_blank" rel="noopener noreferrer">{artist.name}<span aria-hidden="true"> &#8599;</span><span className="sr-only"> (opens in a new tab)</span></a> : artist.name}</li>)}</ul> : 'To be announced'}</dd></div>
        </dl>
        <p>{event.description}</p>
      </div>
    </article>
  )
}
