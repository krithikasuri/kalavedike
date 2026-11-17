import { Link } from 'react-router-dom'
import { artForms, artImage, assetUrl, site } from '../content/site'
import { events } from '../content/events'
import { upcomingEvents } from '../lib/dates'
import { useNow } from '../lib/useNow'
import { Artwork } from '../components/Artwork'
import { EventCard } from '../components/EventCard'
import { VisionStatement } from '../components/VisionStatement'
import { TestimonialsCarousel } from '../components/TestimonialsCarousel'
import { testimonials } from '../content/testimonials'

export function HomePage() {
  const programs = upcomingEvents(events, useNow()).slice(0, 3)
  return (
    <>
      <section className="home-hero">
        <div className="hero-mandala" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span className="tiny-diamond" aria-hidden="true" /> Indian classical arts. In your neighbourhood.</p>
            <h1>Bringing the arts closer to <em>home.</em></h1>
            <p className="hero-description">Experience the richness of Indian classical music and dance, right here in our neighbourhood.</p>
            <div className="hero-actions"><Link to="/events" className="button button-primary">Explore our programs <span aria-hidden="true">&#8599;</span></Link><Link to="/about" className="text-link">Our story <span aria-hidden="true">&rarr;</span></Link></div>
            <div className="hero-footnote"><span className="small-rule" aria-hidden="true" /> Celebrating tradition. Building community.</div>
          </div>
          <div className="hero-art">
            <div className="hero-art-frame"><Artwork src={artImage('Carnatic music')} alt="Original face-free artwork celebrating Carnatic instruments and Indian decorative traditions" eager /><span className="hero-art-label">Celebrating Indian classical performing arts</span></div>
            <div className="hero-seal" aria-hidden="true"><img src={assetUrl('assets/branding/mark.svg')} width="44" height="44" alt="" /><span>Art closer<br />to home</span></div>
            <p className="artwork-credit">Original artwork inspired by Indian classical arts</p>
          </div>
        </div>
        <div className="weave-border" aria-hidden="true" />
      </section>

      <section className="vision-section container" aria-labelledby="vision-title">
        <div><p className="eyebrow">Our Vision</p><h2 id="vision-title">Art closer to people.<br />People closer to <em>art.</em></h2></div>
        <div><VisionStatement /><Link to="/about" className="text-link">Discover {site.name} <span aria-hidden="true">&rarr;</span></Link></div>
      </section>

      <section className="programs-section section-pad" aria-labelledby="programs-title">
        <div className="container">
          <div className="section-heading"><div><p className="eyebrow">Make room for the arts</p><h2 id="programs-title">Coming to our <em>community.</em></h2></div><Link to="/events" className="text-link">View the calendar <span aria-hidden="true">&rarr;</span></Link></div>
          <p className="section-description">From our 2027 planning calendar. All dates are proposed, not confirmed bookings; artists, times, and venues are to be announced.</p>
          {programs.length > 0 ? <div className="event-cards">{programs.map((event) => <EventCard key={event.id} event={event} />)}</div> : <div className="empty-state"><h3>The next chapter is taking shape.</h3><p>No upcoming programs are listed. Please check back for future announcements.</p></div>}
        </div>
      </section>

      <section className="artforms-section container section-pad" aria-labelledby="artforms-title">
        <div className="section-heading"><div><p className="eyebrow">Our shared artistic heritage</p><h2 id="artforms-title">Classical traditions.<br />A community of <em>possibilities.</em></h2></div><p className="heading-note">For lifelong connoisseurs, curious newcomers,<br />and the next generation.</p></div>
        <div className="artform-grid">{artForms.map((form) => <article className="artform-card" key={form.name}><Artwork src={artImage(form.name)} alt={`Face-free illustrative study of ${form.name}`} /><span className="artform-number">{form.label}</span><h3>{form.name}</h3><p>{form.note}</p></article>)}</div>
      </section>

      <section className="gallery-teaser">
        <div className="container gallery-teaser-grid"><div className="teaser-art"><Artwork src={artImage('Bharatanatyam')} alt="Bharatanatyam-inspired pleats, bells, and decorative forms; original illustration" /></div><div><p className="eyebrow">More than a performance venue</p><h2>A community,<br />connected by <em>art.</em></h2><p>Find photos and updates on our Instagram page. Follow Kalavedhike as we bring music, dance, and our neighbourhood community closer together.</p><Link to="/gallery" className="button button-outline">Explore the gallery <span aria-hidden="true">&#8599;</span></Link></div></div>
      </section>
      <TestimonialsCarousel testimonials={testimonials} />
    </>
  )
}
