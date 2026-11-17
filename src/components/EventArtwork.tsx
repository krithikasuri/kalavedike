import type { Program } from '../content/types'
import { artImage, assetUrl } from '../content/site'
import { Artwork } from './Artwork'

export function EventArtwork({ event }: { event: Program }) {
  return <Artwork src={event.photo ? assetUrl(event.photo) : artImage(event.artForm)} alt={event.photo ? event.photoAlt || `Photo for ${event.title}` : `Face-free ${event.artForm} illustration; sample artwork`} unavailableLabel="Event image unavailable" />
}
