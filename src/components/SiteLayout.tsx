import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { site } from '../content/site'

const pageTitles: Record<string, string> = { '/': 'Home', '/about': 'About the trust', '/events': 'Events', '/gallery': 'Gallery', '/contact': 'Contact us', '/sponsors': 'Sponsors', '/how-to': 'Website guide' }

export function SiteLayout() {
  const location = useLocation()
  const main = useRef<HTMLElement>(null)
  const previous = useRef(location.pathname)

  useEffect(() => {
    document.title = `${pageTitles[location.pathname] ?? 'Page not found'} | ${site.name}`
    if (previous.current !== location.pathname) {
      main.current?.focus({ preventScroll: true })
      window.scrollTo({ top: 0, behavior: 'instant' })
      previous.current = location.pathname
    }
  }, [location.pathname])

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={(event) => {
        event.preventDefault()
        main.current?.focus()
        main.current?.scrollIntoView()
      }}>Skip to content</a>
      <SiteHeader />
      <main id="main-content" ref={main} tabIndex={-1}><Outlet /></main>
      <aside className="sample-notice container" aria-label="Program and gallery notice">
        <span className="notice-mark" aria-hidden="true">*</span>
        <p><strong>Program &amp; gallery note.</strong> {site.contentNotice}</p>
      </aside>
      <SiteFooter />
    </>
  )
}
