import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TestimonialsCarousel } from './TestimonialsCarousel'
import { testimonials } from '../content/testimonials'

afterEach(() => vi.useRealTimers())

describe('testimonials carousel', () => {
  it('shows only one clearly labelled placeholder and wraps in both directions', () => {
    render(<TestimonialsCarousel testimonials={testimonials} />)
    expect(screen.getByRole('region', { name: 'Voices from our community.' })).toHaveAttribute('aria-roledescription', 'carousel')
    expect(screen.getByRole('group', { name: '1 of 3' })).toHaveTextContent(testimonials[0].quote)
    expect(screen.getByText('Placeholder testimonial')).toBeInTheDocument()
    expect(screen.queryByText(testimonials[1].quote)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Previous testimonial' }))
    expect(screen.getByRole('group', { name: '3 of 3' })).toHaveTextContent(testimonials[2].quote)
    fireEvent.click(screen.getByRole('button', { name: 'Next testimonial' }))
    expect(screen.getByRole('group', { name: '1 of 3' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Show testimonial 2' }))
    expect(screen.getByRole('group', { name: '2 of 3' })).toHaveTextContent(testimonials[1].quote)
    expect(screen.getByRole('button', { name: 'Show testimonial 2' })).toHaveAttribute('aria-current', 'true')
  })

  it('supports arrow keys without moving focus away from the controls', async () => {
    const user = userEvent.setup()
    render(<TestimonialsCarousel testimonials={testimonials} />)
    const next = screen.getByRole('button', { name: 'Next testimonial' })
    next.focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('group', { name: '2 of 3' })).toBeInTheDocument()
    expect(next).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('group', { name: '1 of 3' })).toBeInTheDocument()
    expect(next).toHaveFocus()
  })

  it('never auto-advances or presents placeholder text as a real endorsement', () => {
    vi.useFakeTimers()
    render(<TestimonialsCarousel testimonials={testimonials} />)
    vi.advanceTimersByTime(60_000)
    expect(screen.getByRole('group', { name: '1 of 3' })).toBeInTheDocument()
    expect(screen.getByText(/not actual quotes or endorsements/)).toBeInTheDocument()
  })

  it('handles an empty collection and a single testimonial without dead controls', () => {
    const view = render(<TestimonialsCarousel testimonials={[]} />)
    expect(screen.getByText('Community stories will be shared here when available.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    view.rerender(<TestimonialsCarousel testimonials={[{ ...testimonials[0], placeholder: false }]} />)
    expect(screen.getByText('Community testimonial')).toBeInTheDocument()
    expect(screen.queryByText('Placeholder testimonial')).not.toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: '1 of 1' })).getByText(testimonials[0].quote)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('keeps a valid slide when the collection becomes shorter', () => {
    const view = render(<TestimonialsCarousel testimonials={testimonials} />)
    fireEvent.click(screen.getByRole('button', { name: 'Show testimonial 3' }))
    view.rerender(<TestimonialsCarousel testimonials={[testimonials[0]]} />)
    expect(screen.getByRole('group', { name: '1 of 1' })).toHaveTextContent(testimonials[0].quote)
  })
})
