import { useEffect, useRef } from 'react'
import type { Program } from '../content/types'
import { artImage } from '../content/site'
import { formatEventRange } from '../lib/dates'
import { Artwork } from './Artwork'
import { ProgramStatus } from './ProgramStatus'

export function EventDetails({ event, focus = false }: { event: Program; focus?: boolean }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (focus) heading.current?.focus()
  }, [event.id, focus])
  return (
    <article className="event-details" aria-labelledby="event-details-title" id="event-details">
      <Artwork src={artImage(event.artForm)} alt="" />
      <div className="details-body">
        <p className="eyebrow">{event.artForm}</p>
        <h2 id="event-details-title" tabIndex={-1} ref={heading}>{event.title}</h2>
        <ProgramStatus event={event} />
        <dl><div><dt>When</dt><dd>{formatEventRange(event)}</dd></div><div><dt>Where</dt><dd>{event.venue}</dd></div></dl>
        <p>{event.description}</p>
      </div>
    </article>
  )
}
