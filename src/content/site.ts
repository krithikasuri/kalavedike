import type { ArtForm } from './types'

export const site = {
  name: 'Kalavedhike',
  tagline: 'Bringing the Arts Closer to Home',
  shortTagline: 'Arts closer to home',
  signature: 'Celebrating Tradition. Building Community. Bringing Art Closer to Home.',
  logo: 'assets/branding/instagram-logo.jpg',
  instagram: 'https://www.instagram.com/bellezeakalavedike/',
  instagramHandle: '@bellezeakalavedike',
  email: '',
  vision: 'To create a vibrant cultural space where the richness of Indian classical performing arts is accessible to everyone, right in their neighbourhood.',
  visionCommunity: 'We envision a community where distance is no longer a barrier to experiencing the beauty of music and dance, where artists find an appreciative audience, and where the next generation grows up surrounded by the richness of our artistic heritage.',
  aspiration: 'To bring art closer to people, and people closer to art.',
  contentNotice: 'Program details may change. Dates marked as proposed are not confirmed bookings. Visit our Instagram page for photos and updates.',
}

export const artForms: { name: ArtForm; image: string; note: string; label: string }[] = [
  { name: 'Carnatic music', image: 'carnatic', note: 'Melody, tradition, and expression', label: '01' },
  { name: 'Bharatanatyam', image: 'bharatanatyam', note: 'Stories written in movement', label: '02' },
  { name: 'Hindustani music', image: 'hindustani', note: 'A conversation with the raga', label: '03' },
  { name: 'Kathak', image: 'kathak', note: 'Rhythm that comes full circle', label: '04' },
  { name: 'Odissi', image: 'odissi', note: 'The poetry of stillness and flow', label: '05' },
]

export function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

export function artImage(name: ArtForm) {
  const form = artForms.find((item) => item.name === name)
  if (!form) throw new Error(`Unknown art form: ${name}`)
  return assetUrl(`assets/illustrations/${form.image}.svg`)
}
