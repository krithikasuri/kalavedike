import { Link } from 'react-router-dom'
import type { Program } from '../content/types'
import { artImage } from '../content/site'
import { formatDate, formatTime, programStart } from '../lib/dates'
import { Artwork } from './Artwork'
import { ProgramStatus } from './ProgramStatus'

export function EventCard({ event }: { event: Program }) {
  return (
    <article className="event-card">
      <Link to={`/events?event=${encodeURIComponent(event.id)}`} className="event-art-link" aria-label={`View ${event.title}`}>
        <Artwork src={artImage(event.artForm)} alt={`Face-free ${event.artForm} illustration; sample artwork`} />
        <span className="art-category">{event.artForm}</span>
      </Link>
      <div className="event-card-body">
        <p className="event-card-date"><time dateTime={programStart(event)}>{formatDate(programStart(event))}</time><span aria-hidden="true"> / </span>{event.startsAt ? `${formatTime(event.startsAt)} IST` : 'Time TBA'}</p>
        <h3><Link to={`/events?event=${encodeURIComponent(event.id)}`}>{event.title}</Link></h3>
        <p>{event.venue}</p>
        <div className="card-bottom"><ProgramStatus event={event} /><Link to={`/events?event=${encodeURIComponent(event.id)}`} aria-label={`Details for ${event.title}`} className="round-link">&#8599;</Link></div>
      </div>
    </article>
  )
}
