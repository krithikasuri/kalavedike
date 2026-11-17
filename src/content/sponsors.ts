import type { Sponsor } from './types'

export const sponsors: Sponsor[] = [1, 2, 3].map((number) => ({
  id: `sponsor-${number}`,
  name: 'Sponsor name',
  description: 'A short introduction to this sponsor and their support for the arts will appear here.',
  placeholder: true,
}))
