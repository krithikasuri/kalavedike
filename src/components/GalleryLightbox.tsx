import { useEffect, useRef } from 'react'
import type { GalleryImage } from '../content/types'
import { Artwork } from './Artwork'

export interface LightboxImage extends GalleryImage {
  eventTitle: string
  sample: boolean
}

interface LightboxProps {
  images: LightboxImage[]
  index: number
  onChange: (index: number) => void
  onClose: () => void
}

export function GalleryLightbox({ images, index, onChange, onClose }: LightboxProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const image = images[index]

  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    element?.showModal()
    closeButton.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      element?.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [])

  if (!image) throw new Error('Lightbox requires a valid image index')
  const previous = () => onChange((index - 1 + images.length) % images.length)
  const next = () => onChange((index + 1) % images.length)

  return (
    <dialog ref={dialog} className="lightbox" aria-labelledby="lightbox-title" aria-describedby="lightbox-caption" onCancel={(event) => { event.preventDefault(); onClose() }} onKeyDown={(event) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose() }
      if (event.key === 'ArrowLeft') { event.preventDefault(); previous() }
      if (event.key === 'ArrowRight') { event.preventDefault(); next() }
      if (event.key === 'Tab') {
        const controls = dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
        const first = controls?.[0]
        const last = controls?.[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="lightbox-inner">
        <header><div><p className="eyebrow">{image.sample ? 'Sample album / Original illustration' : 'From our gallery'}</p><h2 id="lightbox-title">{image.eventTitle}</h2></div><button ref={closeButton} type="button" onClick={onClose} aria-label="Close gallery" className="lightbox-close">&times;</button></header>
        <Artwork src={image.src} alt={image.alt} eager />
        <div className="lightbox-bottom"><p id="lightbox-caption">{image.caption}</p><div className="lightbox-controls"><button type="button" onClick={previous} disabled={images.length < 2} aria-label="Previous image">&larr;</button><span aria-live="polite" aria-atomic="true">{index + 1} / {images.length}</span><button type="button" onClick={next} disabled={images.length < 2} aria-label="Next image">&rarr;</button></div></div>
      </div>
    </dialog>
  )
}
