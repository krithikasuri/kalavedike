import { Link } from 'react-router-dom'
import { SponsorCard } from '../components/SponsorCard'
import { sponsors } from '../content/sponsors'

export function SponsorsPage() {
  return (
    <>
      <section className="page-intro container">
        <p className="eyebrow">Bringing the arts closer to home, together</p>
        <h1>Our <em>sponsors</em></h1>
        <p>A space to recognise those who help bring Indian classical arts closer to our neighbourhood.</p>
      </section>
      <section className="container sponsors-section" aria-labelledby="sponsors-title">
        <h2 id="sponsors-title">Supporting our <em>shared purpose.</em></h2>
        {sponsors.some((sponsor) => sponsor.placeholder) && <p className="sponsor-notice">These are placeholder spaces, not confirmed sponsors. Names, logos, and clickable website links will be added when confirmed.</p>}
        {sponsors.length
          ? <div className="sponsor-grid">{sponsors.map((sponsor) => <SponsorCard key={sponsor.id} sponsor={sponsor} />)}</div>
          : <p className="sponsor-notice">Sponsor details will be shared here when available.</p>}
        <Link to="/contact" className="text-link">Get in touch about sponsorship <span aria-hidden="true">&rarr;</span></Link>
      </section>
    </>
  )
}
