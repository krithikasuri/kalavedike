import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { GalleryLightbox } from './GalleryLightbox'
import type { LightboxImage } from './GalleryLightbox'

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})

const images: LightboxImage[] = [
  { id: 'first', src: '/first.svg', alt: 'First artwork', caption: 'First caption', eventTitle: 'First album', sample: true },
  { id: 'second', src: '/second.svg', alt: 'Second artwork', caption: 'Second caption', eventTitle: 'Second album', sample: true },
]

function Harness() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  return <><button type="button" onClick={() => setOpen(true)}>Open collection</button>{open && <GalleryLightbox images={images} index={index} onChange={setIndex} onClose={() => setOpen(false)} />}</>
}

describe('gallery lightbox', () => {
  it('supports arrow keys, looped navigation, Escape, and restored trigger focus', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Open collection' })
    await user.click(trigger)
    expect(screen.getByRole('dialog', { name: 'First album' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Close gallery' })).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('dialog', { name: 'Second album' })).toBeInTheDocument()
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('dialog', { name: 'First album' })).toBeInTheDocument()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('dialog', { name: 'Second album' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(document.body.style.overflow).toBe('')
  })

  it('contains Tab focus and Shift+Tab focus', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Open collection' }))
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Next image' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Close gallery' })).toHaveFocus()
  })

  it('disables navigation for a single image and handles native cancellation', () => {
    const close = vi.fn()
    render(<GalleryLightbox images={[images[0]]} index={0} onChange={vi.fn()} onClose={close} />)
    expect(screen.getByRole('button', { name: 'Next image' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous image' })).toBeDisabled()
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: true, cancelable: true }))
    expect(close).toHaveBeenCalledOnce()
  })
})
