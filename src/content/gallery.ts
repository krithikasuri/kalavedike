import { archiveEvents } from './sampleArchive'
import { artImage } from './site'
import type { Album } from './types'

const sampleAlbumEvents = ['strings-of-tradition', 'the-dancing-line', 'monsoon-melodies', 'rhythm-in-bloom', 'temple-lines']

export const albums: Album[] = sampleAlbumEvents.map((eventId) => {
  const event = archiveEvents.find((item) => item.id === eventId)
  if (!event) throw new Error(`Gallery references missing event: ${eventId}`)
  return {
    id: `album-${eventId}`,
    eventId,
    images: [
      {
        id: `${eventId}-artwork`,
        src: artImage(event.artForm),
        alt: `Original face-free illustration inspired by ${event.artForm}`,
        caption: `${event.artForm}: an original illustrative study, not a photograph of an actual event.`,
      },
    ],
  }
})
