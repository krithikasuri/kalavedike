import { useState } from 'react'
import type { Testimonial } from '../content/types'

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const total = testimonials.length
  const index = Math.min(activeIndex, Math.max(total - 1, 0))
  const current = testimonials[index]
  const move = (offset: number) => setActiveIndex((index + offset + total) % total)

  return (
    <section className="testimonials-section" aria-labelledby="testimonials-title" aria-roledescription="carousel">
      <div className="container testimonials-layout">
        <div className="testimonials-intro">
          <p className="eyebrow">Community voices</p>
          <h2 id="testimonials-title">Voices from <em>our community.</em></h2>
          <p>A space for the experiences that bring us closer through the arts.</p>
          {testimonials.some((testimonial) => testimonial.placeholder) && <p className="testimonial-notice">Placeholder text only. Approved testimonials will be added here; these are not actual quotes or endorsements.</p>}
        </div>
        <div className="testimonials-panel">
          {current ? <>
            <div className="testimonial-slide" id="testimonial-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${total}`} aria-live="polite" aria-atomic="true">
              <p className="eyebrow">{current.placeholder ? 'Placeholder testimonial' : 'Community testimonial'}</p>
              <blockquote><p>{current.quote}</p></blockquote>
              <p className="testimonial-name">{current.name}</p>
              <p className="testimonial-context">{current.context}</p>
            </div>
            {total > 1 && <div className="testimonial-controls" onKeyDown={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault()
                move(event.key === 'ArrowLeft' ? -1 : 1)
              }
            }}>
              <button type="button" className="testimonial-arrow" aria-label="Previous testimonial" aria-controls="testimonial-slide" onClick={() => move(-1)}><span aria-hidden="true">&larr;</span></button>
              <div className="testimonial-selectors" role="group" aria-label="Choose a testimonial">
                {testimonials.map((testimonial, position) => <button key={testimonial.id} type="button" aria-label={`Show testimonial ${position + 1}`} aria-controls="testimonial-slide" aria-current={position === index ? 'true' : undefined} onClick={() => setActiveIndex(position)}><span aria-hidden="true" /></button>)}
              </div>
              <span className="testimonial-counter">{index + 1} / {total}</span>
              <button type="button" className="testimonial-arrow" aria-label="Next testimonial" aria-controls="testimonial-slide" onClick={() => move(1)}><span aria-hidden="true">&rarr;</span></button>
            </div>}
          </> : <p className="testimonial-empty">Community stories will be shared here when available.</p>}
        </div>
      </div>
    </section>
  )
}
