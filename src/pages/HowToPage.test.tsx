import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { parseEvents, parseSponsors } from '../content/parseContent'
import { HowToPage } from './HowToPage'

it('explains routine maintenance and links directly to the correct repository files', () => {
  render(<HowToPage />)
  for (const name of ['Before you start', 'Add or change an event', 'Remove an event', 'Update sponsors', 'Upload a photo or logo', 'Save and publish', 'Easy mistakes to avoid']) {
    expect(screen.getByRole('heading', { name })).toBeInTheDocument()
  }
  expect(screen.getByRole('link', { name: /Open the events file/ })).toHaveAttribute('href', 'https://github.com/krithikasuri/kalavedike/blob/main/src/content/events.json')
  expect(screen.getByRole('link', { name: /Open the sponsors file/ })).toHaveAttribute('href', 'https://github.com/krithikasuri/kalavedike/blob/main/src/content/sponsors.json')
  for (const link of screen.getAllByRole('link')) {
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAccessibleName(/opens in a new tab/)
  }
  expect(screen.getByText(/does not give visitors permission to edit/)).toBeInTheDocument()
  expect(screen.getByText(/website keeps its previous published version/)).toBeInTheDocument()
})

it('provides complete JSON examples accepted by the current content loaders', () => {
  render(<HowToPage />)
  const events = JSON.parse(screen.getByLabelText('Event JSON example').textContent ?? '')
  const sponsors = JSON.parse(screen.getByLabelText('Sponsor JSON example').textContent ?? '')
  expect(parseEvents(events)).toHaveLength(1)
  expect(parseSponsors(sponsors)).toHaveLength(1)
  expect(events[0].tentative).toBe(true)
  expect(screen.getByText(/Replace every example value before publishing/)).toBeInTheDocument()
})
