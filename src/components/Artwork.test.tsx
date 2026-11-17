import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { Artwork } from './Artwork'

it('surfaces image failures and retries when the source changes', () => {
  const { rerender } = render(<Artwork src="/missing.svg" alt="Carnatic instruments" />)
  fireEvent.error(screen.getByRole('img'))
  expect(screen.getByRole('img', { name: 'Carnatic instruments. Image unavailable.' })).toHaveTextContent('Artwork unavailable')
  rerender(<Artwork src="/new.svg" alt="New artwork" />)
  expect(screen.getByRole('img', { name: 'New artwork' })).toHaveAttribute('src', '/new.svg')
})
