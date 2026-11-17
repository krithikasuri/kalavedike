import { Link } from 'react-router-dom'
import { assetUrl, site } from '../content/site'
import { useNow } from '../lib/useNow'

export function SiteFooter() {
  const now = useNow()
  return (
    <footer className="site-footer">
      <div className="weave-border" aria-hidden="true" />
      <div className="container footer-main">
        <div>
          <Link to="/" className="brand footer-brand"><img src={assetUrl(site.logo)} width="48" height="48" alt="" /><span className="brand-name">{site.name}</span></Link>
          <p>{site.signature}</p>
        </div>
        <div><h2 className="footer-heading">Explore</h2><nav aria-label="Footer navigation"><Link to="/about">Our story</Link><Link to="/events">Upcoming programs</Link><Link to="/gallery">The gallery</Link><Link to="/sponsors">Sponsors</Link><Link to="/contact">Contact us</Link><Link to="/how-to">Website guide</Link></nav></div>
        <div className="footer-social"><h2 className="footer-heading">Join our community</h2><p>Follow {site.name} as we bring classical arts closer to home.</p><a href={site.instagram} target="_blank" rel="noopener noreferrer">{site.instagramHandle} <span aria-hidden="true">&#8599;</span><span className="sr-only"> (opens in a new tab)</span></a></div>
      </div>
      <div className="container footer-bottom"><span>&copy; {now.getFullYear()} {site.name}</span><span>For Sarjapur Road and neighbouring communities.</span><span>Indian classical performing arts, closer to home.</span></div>
    </footer>
  )
}
