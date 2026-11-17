export type ArtForm = 'Carnatic music' | 'Bharatanatyam' | 'Hindustani music' | 'Kathak' | 'Odissi'

interface ProgramDetails {
  id: string
  title: string
  artForm: ArtForm
  venue: string
  description: string
  sample: boolean
  tentative?: boolean
}

export type Program = ProgramDetails & (
  | { startsAt: string; endsAt: string; date?: never }
  | { date: string; startsAt?: never; endsAt?: never }
)

export interface GalleryImage {
  id: string
  src: string
  alt: string
  caption: string
}

export interface Album {
  id: string
  eventId: string
  images: GalleryImage[]
}

export interface Trustee {
  id: string
  name: string
  role: string
  bio: string
  sample: boolean
}

export type Sponsor = {
  id: string
  name: string
  description: string
} & (
  | { placeholder: true; website?: never; logo?: never }
  | { placeholder: false; website: `https://${string}`; logo: string }
)

export interface Testimonial {
  id: string
  quote: string
  name: string
  context: string
  placeholder: boolean
}
