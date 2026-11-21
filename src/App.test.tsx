import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { about } from './content/about'
import { site } from './content/site'
import { trustees } from './content/trustees'

vi.mock('./content/events', async () => ({
  events: (await import('./test/siteFixtures')).fixtureEvents,
}))
vi.mock('./content/sponsors', async () => ({
  sponsors: (await import('./test/siteFixtures')).fixtureSponsors,
}))

const firstEventId = 'calendar-2027-01-23-carnatic-vocal-1'
const originalEmail = site.email

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-17T04:30:00Z'))
  window.history.replaceState(null, '', '/#/')
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  HTMLElement.prototype.scrollIntoView = vi.fn()
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})
afterEach(() => { vi.useRealTimers(); site.email = originalEmail })

describe('Kalavedike pages', () => {
  it('shows all art forms and fixture proposed programs with honest status and no fabricated time', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bringing the arts closer to home.')
    for (const name of ['Carnatic music', 'Bharatanatyam', 'Hindustani music', 'Kathak', 'Odissi']) expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Carnatic Vocal 1' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bharatanatyam 1' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Carnatic Instrumental 1 - Veena' })).toBeInTheDocument()
    expect(screen.getAllByText('Proposed date')).toHaveLength(3)
    expect(screen.getAllByText(/Time TBA/)).toHaveLength(3)
    expect(screen.queryByText('Sample program')).not.toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: 'Program and gallery notice' })).toHaveTextContent('Program details may change. Dates marked as proposed are not confirmed bookings. Visit our Instagram page for photos and updates.')
    expect(screen.getByRole('link', { name: 'Kalavedike home' }).querySelector('img')).toHaveAttribute('src', expect.stringContaining('assets/branding/instagram-logo.jpg'))
    expect(document.title).toBe('Home | Kalavedike')
    expect(document.body).not.toHaveTextContent('&nearr;')
    expect(screen.getByRole('link', { name: 'Details for Carnatic Vocal 1' })).toHaveTextContent('\u2197')
    expect(document.body).not.toHaveTextContent('150000')
    expect(document.body).not.toHaveTextContent('Sreevalsan')
  })

  it('navigates all pages with an active link and route focus', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = within(screen.getByRole('navigation', { name: 'Main navigation' }))
    await user.click(nav.getByRole('link', { name: 'About us' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('About Kalavedike')
    expect(screen.getByRole('main')).toHaveFocus()
    expect(nav.getByRole('link', { name: 'About us' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByText('Sample profile')).not.toBeInTheDocument()
    await user.click(nav.getByRole('link', { name: 'Events' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Make time for the arts.')
    await user.click(nav.getByRole('link', { name: 'Gallery' }))
    expect(screen.getByRole('link', { name: 'View on Instagram (opens in a new tab)' })).toBeInTheDocument()
    await user.click(nav.getByRole('link', { name: 'Sponsors' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Our sponsors' })).toBeInTheDocument()
    expect(document.title).toBe('Sponsors | Kalavedike')
    expect(within(screen.getByRole('main')).getAllByRole('article')).toHaveLength(3)
    expect(within(screen.getByRole('main')).queryByRole('link', { name: /Visit .* website/ })).not.toBeInTheDocument()
    expect(screen.getByText(/not confirmed sponsors/)).toBeInTheDocument()
    expect(within(screen.getByRole('navigation', { name: 'Footer navigation' })).getByRole('link', { name: 'Sponsors' })).toHaveAttribute('href', '#/sponsors')
    await user.click(nav.getByRole('link', { name: 'Contact us' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Contact us' })).toBeInTheDocument()
    expect(nav.getByRole('link', { name: 'Contact us' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('main')).toHaveFocus()
    expect(document.title).toBe('Contact us | Kalavedike')
    expect(within(screen.getByRole('navigation', { name: 'Footer navigation' })).getByRole('link', { name: 'Contact us' })).toHaveAttribute('href', '#/contact')
  })

  it('uses the complete approved vision on Home without calling it sample content', () => {
    render(<App />)
    const main = within(screen.getByRole('main'))
    expect(main.getByText(site.vision)).toBeInTheDocument()
    expect(main.getByText(site.visionCommunity)).toBeInTheDocument()
    expect(main.getAllByText('We believe that when the arts become part of everyday community life, they do more than entertain. They inspire curiosity, deepen cultural connections, and help preserve a rich heritage for future generations.')).toHaveLength(1)
    expect(main.getByText((_, element) => element?.tagName === 'P' && element.textContent === `Our aspiration is simple: ${site.aspiration}`)).toBeInTheDocument()
    expect(main.queryByText('Illustrative vision statement')).not.toBeInTheDocument()
    expect(document.body).not.toHaveTextContent(/Kalaved[h]ike/i)
    expect(screen.getByRole('link', { name: /@bellezeakalavedike/ })).toHaveAttribute('href', 'https://www.instagram.com/bellezeakalavedike/')
  })

  it('opens the volunteer website guide from the footer with the correct title and focus', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation', { name: 'Footer navigation' })).getByRole('link', { name: 'Website guide' }))
    expect(window.location.hash).toBe('#/how-to')
    expect(document.title).toBe('Website guide | Kalavedike')
    expect(screen.getByRole('heading', { level: 1, name: 'Website guide' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveFocus()
    expect(screen.getByRole('heading', { name: 'Update sponsors' })).toBeInTheDocument()
  })

  it('renders the revised About narrative and vision without the redundant community section', () => {
    window.history.replaceState(null, '', '/#/about')
    render(<App />)
    const main = within(screen.getByRole('main'))
    for (const paragraph of [...about.introduction, ...about.story, ...about.join, about.offeringsIntroduction, about.offeringsConclusion, site.vision, site.visionCommunity]) {
      expect(main.getByText(paragraph)).toBeInTheDocument()
    }
    for (const offering of about.offerings) expect(main.getByText(offering)).toBeInTheDocument()
    for (const heading of ['Our Story', 'Our Vision', 'What We Do', 'Join Us on This Journey']) {
      expect(main.getByRole('heading', { name: heading })).toBeInTheDocument()
    }
    expect(main.getByText(about.subtitle)).toBeInTheDocument()
    expect(main.queryByRole('heading', { name: 'More Than a Performance Venue' })).not.toBeInTheDocument()
    expect(main.queryByText('Kalavedike is about more than organizing concerts and performances.')).not.toBeInTheDocument()
    const vision = within(main.getByRole('region', { name: 'Our Vision' }))
    expect(vision.getAllByText('We believe that when the arts become part of everyday community life, they do more than entertain. They inspire curiosity, deepen cultural connections, and help preserve a rich heritage for future generations.')).toHaveLength(1)
    expect(main.getByText("We believe that appreciating the arts shouldn't always require travelling across the city battling heavy traffic.")).toBeInTheDocument()
    expect(main.getByText(/we aim to bring accomplished and upcoming artists and appreciative audiences together/)).toBeInTheDocument()
    expect(main.getByText(`${site.name} | ${site.signature}`)).toBeInTheDocument()
    expect(main.getByText(/travelling over 90 minutes each way/)).toBeInTheDocument()
    expect(main.getByText(/Malleswaram, Basavanagudi, and Banashankari/)).toBeInTheDocument()
    const trusteeSection = within(main.getByRole('region', { name: 'Meet our trustees.' }))
    const cards = trusteeSection.getAllByRole('article')
    expect(cards).toHaveLength(5)
    for (const [index, trustee] of trustees.entries()) {
      const card = within(cards[index])
      expect(card.getByRole('heading', { name: trustee.name, level: 3 })).toBeInTheDocument()
      expect(card.getByText(trustee.bio)).toBeInTheDocument()
      expect(card.getByText('Trustee', { exact: true })).toBeInTheDocument()
      expect(card.getByRole('img', { name: `Photo placeholder for ${trustee.name}` })).toBeInTheDocument()
      expect(card.getByText('Photo to follow')).toBeInTheDocument()
    }
    expect(trusteeSection.getByText(/Individual biographies and photographs will be added when available/)).toBeInTheDocument()
    expect(main.queryByText(/Trustee profile 0|Illustrative trust copy|Sample vision and values|Stewardship & vision/)).not.toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: 'Program and gallery notice' })).not.toHaveTextContent(/Trust copy|trustee profiles|vision/i)
  })

  it.each(['/', '/about', '/events', '/sponsors', '/contact'])('uses the exact brand tagline on %s', (route) => {
    window.history.replaceState(null, '', `/#${route}`)
    render(<App />)
    expect(within(screen.getByRole('banner')).getByText('Bringing the arts closer to home.', { exact: true })).toBeInTheDocument()
    const main = within(screen.getByRole('main'))
    if (route === '/') {
      expect(main.getByRole('heading', { level: 1, name: 'Bringing the arts closer to home.' })).toBeInTheDocument()
    } else {
      expect(main.getByText('Bringing the arts closer to home.', { exact: true, selector: 'p.eyebrow' })).toBeInTheDocument()
    }
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Celebrating Tradition. Building Community. Bringing the arts closer to home.')
  })

  it('opens the first fixture event and displays its proposed date with time and venue TBA', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('link', { name: 'Details for Carnatic Vocal 1' }))
    expect(screen.getByRole('heading', { name: '2027 season' })).toBeInTheDocument()
    const details = screen.getByRole('article', { name: 'Carnatic Vocal 1' })
    expect(details).toHaveTextContent('23 January 2027 | Time to be announced (IST)')
    expect(details).toHaveTextContent('Venue to be announced')
    expect(details).toHaveTextContent('Proposed date')
    expect(details).not.toHaveTextContent('12:00')
    expect(window.location.hash).toContain(firstEventId)
  })

  it('shows the whole season and restores focus and filters when returning from program details', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', '/#/events')
    render(<App />)
    const list = screen.getByRole('list', { name: 'Programs for 2027' })
    expect(within(list).getAllByRole('button')).toHaveLength(12)
    await user.click(screen.getByRole('button', { name: 'Music 7' }))
    const program = within(list).getByRole('button', { name: /^Carnatic Vocal 1,/ })
    await user.click(program)
    expect(screen.getByRole('heading', { name: 'Carnatic Vocal 1' })).toHaveFocus()
    expect(program).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: /Back to all programs/ }))
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    expect(program).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Music 7' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(list).getAllByRole('button')).toHaveLength(7)
    expect(window.location.hash).not.toContain('event=')
  })

  it('returns to the season heading if the selected program has been filtered out', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', `/#/events?event=${firstEventId}&source=home`)
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Dance 5' }))
    await user.click(screen.getByRole('button', { name: /Back to all programs/ }))
    expect(screen.getByRole('heading', { name: '2027 season' })).toHaveFocus()
    expect(window.location.hash).toContain('source=home')
    expect(window.location.hash).not.toContain('event=')
  })

  it('shows only the Instagram destination in the gallery, without placeholder content', () => {
    window.history.replaceState(null, '', '/#/gallery')
    render(<App />)
    const main = within(screen.getByRole('main'))
    const links = main.getAllByRole('link')
    expect(links).toHaveLength(1)
    for (const link of links) {
      expect(link).toHaveAttribute('href', site.instagram)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link).toHaveAccessibleName(/opens in a new tab/)
    }
    expect(main.queryByRole('img')).not.toBeInTheDocument()
    expect(main.queryByRole('combobox')).not.toBeInTheDocument()
    expect(main.queryByText(/placeholder|Sample album|Strings of tradition/i)).not.toBeInTheDocument()
    expect(screen.getByRole('main').querySelector('.album-grid')).toBeNull()
    expect(document.body).not.toHaveTextContent(/placeholder/i)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows an honest empty state once all scheduled programs are in the past', () => {
    vi.setSystemTime(new Date('2030-01-01T00:00:00Z'))
    render(<App />)
    expect(screen.getByText('No upcoming programs are listed. Please check back for future announcements.')).toBeInTheDocument()
    expect(screen.queryByText('Proposed date', { exact: true })).not.toBeInTheDocument()
  })

  it('does not invent an email address while contact details are awaiting confirmation', () => {
    site.email = ''
    window.history.replaceState(null, '', '/#/contact')
    render(<App />)
    expect(screen.getByText(/Our email address has not been published yet/)).toBeInTheDocument()
    expect(screen.getByRole('main').querySelector('a[href^="mailto:"]')).toBeNull()
    expect(within(screen.getByRole('main')).getByRole('link', { name: /@bellezeakalavedike/ })).toHaveAttribute('href', site.instagram)
  })

  it('shows a working email link when an approved contact email is configured', () => {
    site.email = 'contact@example.org'
    window.history.replaceState(null, '', '/#/contact')
    render(<App />)
    expect(screen.getByRole('link', { name: 'contact@example.org' })).toHaveAttribute('href', 'mailto:contact@example.org')
    expect(screen.queryByText(/Our email address has not been published yet/)).not.toBeInTheDocument()
  })

  it('shows unknown event and route notices', () => {
    window.history.replaceState(null, '', '/#/events?event=unknown')
    const view = render(<App />)
    expect(screen.getByText(/That program could not be found/)).toHaveAttribute('role', 'status')
    view.unmount()
    window.history.replaceState(null, '', '/#/unknown')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('This page isoff stage.')
  })

  it('closes the mobile menu on navigation and Escape', async () => {
    const user = userEvent.setup()
    render(<App />)
    const menu = screen.getByRole('button', { name: /Menu/ })
    await user.click(menu)
    expect(menu).toHaveAttribute('aria-expanded', 'true')
    await user.click(within(screen.getByRole('navigation', { name: 'Main navigation' })).getByRole('link', { name: 'About us' }))
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    await user.click(menu)
    fireEvent.keyDown(screen.getByRole('navigation', { name: 'Main navigation' }), { key: 'Escape' })
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    expect(menu).toHaveFocus()
  })
})
