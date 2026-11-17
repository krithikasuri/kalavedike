import { useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { assetUrl, site } from '../content/site'

const links = [{ to: '/', label: 'Home' }, { to: '/about', label: 'About us' }, { to: '/events', label: 'Events' }, { to: '/gallery', label: 'Gallery' }, { to: '/contact', label: 'Contact us' }]

export function SiteHeader() {
  const [expandedAt, setExpandedAt] = useState<string | null>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()
  const expanded = expandedAt === pathname

  return (
    <header className="site-header" onKeyDown={(event) => {
      if (event.key === 'Escape' && expanded) {
        setExpandedAt(null)
        menuButton.current?.focus()
      }
    }}>
      <div className="container header-inner">
        <Link className="brand" to="/" aria-label={`${site.name} home`}>
          <img src={assetUrl(site.logo)} width="51" height="51" alt="" />
          <span><span className="brand-name">{site.name}</span><span className="brand-caption">{site.shortTagline}</span></span>
        </Link>
        <button ref={menuButton} className="menu-toggle" type="button" aria-expanded={expanded} aria-controls="primary-navigation" onClick={() => setExpandedAt(expanded ? null : pathname)}>
          {expanded ? 'Close menu' : 'Menu'} <span aria-hidden="true">{expanded ? '\u00d7' : '\u2630'}</span>
        </button>
        <nav className={`main-nav ${expanded ? 'is-open' : ''}`} id="primary-navigation" aria-label="Main navigation">
          {links.map(({ to, label }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setExpandedAt(null)}>{label}</NavLink>)}
          <Link className="nav-cta" to="/events" onClick={() => setExpandedAt(null)}>What's on <span aria-hidden="true">&#8599;</span></Link>
        </nav>
      </div>
    </header>
  )
}
