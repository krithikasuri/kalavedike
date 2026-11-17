import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SponsorCard } from './SponsorCard'
import { sponsors } from '../content/sponsors'
import type { Sponsor } from '../content/types'

const confirmed: Sponsor = {
  id: 'confirmed', name: 'Confirmed sponsor', description: 'Approved sponsor description.',
  placeholder: false, website: 'https://example.com/', logo: 'assets/sponsors/approved-logo.svg',
}

describe('sponsor cards', () => {
  it('keeps placeholders blank and does not invent a website or affiliation', () => {
    const { container } = render(<SponsorCard sponsor={sponsors[0]} />)
    expect(screen.getByText('Sponsor placeholder')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Blank sponsor logo placeholder' })).toBeEmptyDOMElement()
    expect(screen.getByText('Website to be added')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
  })

  it('makes a confirmed sponsor and its logo a secure external website link', () => {
    render(<SponsorCard sponsor={confirmed} />)
    const link = screen.getByRole('link', { name: 'Visit Confirmed sponsor website (opens in a new tab)' })
    expect(link).toHaveAttribute('href', 'https://example.com/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toContainElement(screen.getByRole('img', { name: 'Confirmed sponsor logo' }))
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('assets/sponsors/approved-logo.svg'))
    expect(screen.queryByText('Sponsor placeholder')).not.toBeInTheDocument()
  })

  it('surfaces an unavailable approved logo without breaking the website link', () => {
    render(<SponsorCard sponsor={confirmed} />)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByText('Logo unavailable')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', confirmed.website)
  })
})
