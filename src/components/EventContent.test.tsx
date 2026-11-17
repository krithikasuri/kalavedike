import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it } from 'vitest'
import { parseEvents, parseSponsors } from '../content/parseContent'
import { EventCard } from './EventCard'
import { EventDetails } from './EventDetails'
import { SponsorCard } from './SponsorCard'

const data = {
  id: 'test-concert', title: 'Test concert', artForm: 'Carnatic music', date: '2027-01-23',
  time: '18:30', venue: 'Neighbourhood community hall', description: 'Approved program introduction.',
  artists: [{ name: 'Test artist', url: 'https://example.com/performer' }, { name: 'Accompanying artist' }],
  photo: 'assets/illustrations/carnatic.svg', photoAlt: 'Stage prepared with musical instruments',
}

it('renders JSON-only event updates in Home cards and complete event details', () => {
  const [event] = parseEvents([data])
  render(<MemoryRouter><EventCard event={event} /><EventDetails event={event} /></MemoryRouter>)
  const details = screen.getByRole('article', { name: data.title })
  expect(details).toHaveTextContent('23 January 2027')
  expect(details).toHaveTextContent(/6:30\s*pm IST/i)
  expect(details).toHaveTextContent(data.venue)
  expect(details).toHaveTextContent(data.description)
  expect(details).toHaveTextContent('Accompanying artist')
  expect(within(details).getByRole('link', { name: /Test artist/ })).toHaveAttribute('href', data.artists[0].url)
  expect(within(details).getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer')
  expect(screen.getAllByRole('img', { name: data.photoAlt })).toHaveLength(2)
  for (const photo of screen.getAllByRole('img')) expect(photo).toHaveAttribute('src', expect.stringContaining(data.photo))
  expect(screen.queryByText('Proposed date')).not.toBeInTheDocument()
})

it('shows supplied time ranges and an explicit unavailable photo state', () => {
  const [event] = parseEvents([{ ...data, endTime: '20:00' }])
  render(<EventDetails event={event} />)
  expect(screen.getByRole('article')).toHaveTextContent(/6:30\s*pm - 8:00\s*pm IST/i)
  fireEvent.error(screen.getByRole('img'))
  expect(screen.getByText('Event image unavailable')).toBeInTheDocument()
})

it('renders missing artists honestly without creating fake links', () => {
  const [event] = parseEvents([{ ...data, artists: [], photo: '' }])
  render(<EventDetails event={event} />)
  expect(screen.getByRole('article')).toHaveTextContent('ArtistsTo be announced')
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('assets/illustrations/carnatic.svg'))
})

it('renders a sponsor bio, linked website and logo directly from JSON-shaped data', () => {
  const [sponsor] = parseSponsors([{ id: 'test-sponsor', name: 'Test sponsor', bio: 'Supporting local performing arts.', website: 'https://example.com', logo: 'assets/branding/mark.svg' }])
  render(<SponsorCard sponsor={sponsor} />)
  expect(screen.getByText('Supporting local performing arts.')).toBeInTheDocument()
  expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com')
  expect(screen.getByRole('img', { name: 'Test sponsor logo' })).toHaveAttribute('src', expect.stringContaining('assets/branding/mark.svg'))
})
