import { expect, test, type Page } from '@playwright/test'
import { join, resolve } from 'node:path'
import { about } from '../src/content/about'
import { trustees } from '../src/content/trustees'
import eventRecords from '../src/content/events.json' with { type: 'json' }
import sponsorRecords from '../src/content/sponsors.json' with { type: 'json' }
import { parseEvents, parseSponsors } from '../src/content/parseContent'
import type { Program } from '../src/content/types'
import { comparePrograms, formatDate, formatEventRange, formatTime, programDate, programEndDate, programStart, upcomingEvents } from '../src/lib/dates'

const now = new Date('2026-11-17T04:30:00Z')
const events = parseEvents(eventRecords)
const sponsors = parseSponsors(sponsorRecords)
const artifacts = process.env.KALAVEDIKE_ARTIFACTS_DIR ?? resolve('test-results')
const routes = [
  { path: '/', label: 'Home', title: 'Home' },
  { path: '/about', label: 'About us', title: 'About the trust' },
  { path: '/events', label: 'Events', title: 'Events' },
  { path: '/gallery', label: 'Gallery', title: 'Gallery' },
  { path: '/sponsors', label: 'Sponsors', title: 'Sponsors' },
  { path: '/contact', label: 'Contact us', title: 'Contact us' },
] as const
const schedule = [...events].sort(comparePrograms)
const years = [...new Set(schedule.flatMap((event) => {
  const first = Number(programDate(event).slice(0, 4))
  const last = Number(programEndDate(event).slice(0, 4))
  return Array.from({ length: last - first + 1 }, (_, index) => first + index)
}))].sort((a, b) => a - b)
const initialEvent = upcomingEvents(events, now)[0]
const initialYear = initialEvent ? Number(programDate(initialEvent).slice(0, 4)) : years.at(-1) ?? now.getUTCFullYear()
const seasonPrograms = (year: number) => schedule.filter((event) => programDate(event) <= `${year}-12-31` && programEndDate(event) >= `${year}-01-01`)
const isMusic = (event: Program) => event.artForm === 'Carnatic music' || event.artForm === 'Hindustani music'
const tileName = (event: Program) => `${event.title}, ${formatEventRange(event)}${event.tentative ? ', proposed date' : event.sample ? ', sample program' : ''}`

async function selectYear(page: Page, year: number) {
  if (years.length > 1) await page.getByRole('combobox', { name: 'Program year', exact: true }).selectOption(String(year))
  await expect(page.getByRole('region', { name: `${year} season`, exact: true })).toBeVisible()
}

async function expectDetails(page: Page, event: Program) {
  const details = page.getByRole('article', { name: event.title, exact: true })
  await expect(details).toBeVisible()
  await expect(details.locator('img')).toBeVisible()
  await expect(details.locator('dt')).toHaveText(['When', 'Where', 'Artists'])
  await expect(details.locator('dd').nth(0)).toHaveText(formatEventRange(event))
  await expect(details.locator('dd').nth(1)).toHaveText(event.venue)
  if (!event.artists?.length) await expect(details.locator('dd').nth(2)).toHaveText('To be announced')
  await expect(details).toContainText(event.description)
  if (event.tentative) await expect(details).toContainText('Proposed date')
  else await expect(details.getByText('Proposed date', { exact: true })).toHaveCount(0)
  if (!event.startsAt) await expect(details).toContainText('Time to be announced (IST)')
  return details
}
const approvedVision = [
  'To create a vibrant cultural space where the richness of Indian classical performing arts is accessible to everyone, right in their neighbourhood.',
  'We envision a community where distance is no longer a barrier to experiencing the beauty of music and dance, where artists find an appreciative audience, and where the next generation grows up surrounded by the richness of our artistic heritage.',
  'We believe that when the arts become part of everyday community life, they do more than entertain. They inspire curiosity, deepen cultural connections, and help preserve a rich heritage for future generations.',
  'Our aspiration is simple: To bring art closer to people, and people closer to art.',
]

test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.clock.setFixedTime(now)
  await page.exposeFunction('__browserErrors', () => errors)
})

test.afterEach(async ({ page }) => {
  if (!page.isClosed()) {
    await expect(page.locator('body')).not.toContainText('&nearr;')
    await expect(page.locator('body')).not.toContainText(/Illustrative vision statement|Illustrative trust copy|Sample vision and values|Sample profile/i)
    const errors = await page.evaluate<string[]>('window.__browserErrors()')
    expect(errors, 'No uncaught exceptions or browser console errors').toEqual([])
  }
})

async function loadImages(page: Page) {
  // Decode lazy images too, so below-the-fold broken artwork cannot go unnoticed.
  await expect.poll(async () => page.locator('img').evaluateAll(async (images) => {
    return Promise.all(images.map(async (image) => {
      image.loading = 'eager'
      try {
        await image.decode()
        return image.naturalWidth > 0 && image.naturalHeight > 0 ? null : image.src
      } catch {
        return image.src
      }
    })).then((results) => results.filter(Boolean))
  }), { message: 'Every image, including lazy artwork, loads successfully' }).toEqual([])
}

test('all pages are reachable through hash navigation and the responsive menu', async ({ page, isMobile }) => {
  await page.goto('/#/')
  const navigation = page.getByRole('navigation', { name: 'Main navigation', includeHidden: true })
  const menu = page.getByRole('button', { name: /^Menu/ })
  if (isMobile) {
    await expect(navigation).toBeHidden()
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
  } else {
    await expect(navigation).toBeVisible()
    await expect(menu).toBeHidden()
  }

  for (const route of [...routes.slice(1), routes[0]]) {
    if (isMobile) {
      await menu.click()
      await expect(page.getByRole('button', { name: /Close menu/ })).toHaveAttribute('aria-expanded', 'true')
    }
    await navigation.getByRole('link', { name: route.label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`#${route.path}$`))
    await expect(page).toHaveTitle(`${route.title} | Kalavedike`)
    await expect(page.getByRole('banner').getByRole('link', { name: 'Kalavedike home', exact: true })).toBeVisible()
    await expect(page.getByRole('banner').getByText('Bringing the arts closer to home.', { exact: true })).toBeVisible()
    if (['/about', '/events', '/sponsors', '/contact'].includes(route.path)) {
      await expect(page.getByRole('main').locator('p.eyebrow').filter({ hasText: /^Bringing the arts closer to home\.$/ })).toBeVisible()
    }
    await expect(page.locator('body')).not.toContainText(/Kalaved[h]ike/i)
    await expect(page.getByRole('contentinfo').getByRole('link', { name: /@bellezeakalavedike/ })).toHaveAttribute('href', 'https://www.instagram.com/bellezeakalavedike/')
    const notice = page.getByRole('complementary', { name: 'Program and gallery notice' })
    await expect(notice).toContainText('Program details may change. Dates marked as proposed are not confirmed bookings. Visit our Instagram page for photos and updates.')
    await expect(notice).not.toContainText(/placeholder|sample album/i)
    await expect(notice).not.toContainText(/trust copy|trustee profiles|vision|story/i)
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible()
    await expect(navigation.getByRole('link', { name: route.label, exact: true, includeHidden: true })).toHaveAttribute('aria-current', 'page')
    await expect(page.getByRole('main')).toBeFocused()
    if (isMobile) await expect(navigation).toBeHidden()
  }
})

test('home presents the official community tagline and complete approved vision', async ({ page }) => {
  await page.goto('/#/')
  await expect(page.getByRole('heading', { level: 1, name: 'Bringing the arts closer to home.', exact: true })).toBeVisible()
  await expect(page.getByText('Experience the richness of Indian classical music and dance, right here in our neighbourhood.', { exact: true })).toBeVisible()
  const vision = page.getByRole('region', { name: /Art closer to people\.\s*People closer to art\./ })
  await expect(vision.locator('.vision-statement p')).toHaveText(approvedVision)
  await expect(page.getByRole('contentinfo')).toContainText('Celebrating Tradition. Building Community. Bringing the arts closer to home.')
  await expect(page).toHaveTitle('Home | Kalavedike')
  await page.getByRole('link', { name: /Discover Kalavedike/ }).click()
  await expect(page).toHaveURL(/#\/about$/)
  await expect(page.getByRole('heading', { level: 1, name: 'About Kalavedike', exact: true })).toBeVisible()
})

test('expanded header navigation fits above the compact menu breakpoint', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Exercise expanded navigation in the desktop browser')
  for (const width of [1001, 1100]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#/contact')
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Contact us', exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1)
  }
})

test('compact header navigation includes sponsors at tablet widths', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Exercise the desktop browser at tablet widths')
  for (const width of [801, 1000]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#/')
    const menu = page.getByRole('button', { name: /^Menu/ })
    await expect(menu).toBeVisible()
    await menu.click()
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Sponsors', exact: true }).click()
    await expect(page).toHaveURL(/#\/sponsors$/)
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1)
  }
})

test('sponsors page reflects configured records and only links confirmed sponsors', async ({ page }, testInfo) => {
  await page.goto('/#/sponsors')
  const main = page.getByRole('main')
  await expect(page).toHaveTitle('Sponsors | Kalavedike')
  await expect(main.getByRole('heading', { level: 1, name: 'Our sponsors', exact: true })).toBeVisible()
  expect(sponsors).toHaveLength(sponsorRecords.length)
  await expect(main.locator('.sponsor-card')).toHaveCount(sponsors.length)
  if (sponsors.some((sponsor) => sponsor.placeholder)) await expect(main.getByText(/not confirmed sponsors/)).toBeVisible()
  else await expect(main.getByText(/not confirmed sponsors/)).toHaveCount(0)
  if (!sponsors.length) await expect(main.getByText('Sponsor details will be shared here when available.')).toBeVisible()
  for (const [index, sponsor] of sponsors.entries()) {
    const card = main.locator('.sponsor-card').nth(index)
    await expect(card.getByRole('heading', { name: sponsor.name, exact: true })).toBeVisible()
    await expect(card).toContainText(sponsor.description)
    if (sponsor.placeholder) {
      await expect(card.getByRole('img', { name: 'Blank sponsor logo placeholder', exact: true })).toBeVisible()
      await expect(card.locator('img, a')).toHaveCount(0)
      await expect(card.getByText('Website to be added', { exact: true })).toBeVisible()
    } else {
      const link = card.getByRole('link', { name: `Visit ${sponsor.name} website (opens in a new tab)`, exact: true })
      await expect(link).toHaveAttribute('href', sponsor.website)
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      await expect(card.getByRole('img', { name: `${sponsor.name} logo`, exact: true })).toBeVisible()
    }
  }
  await loadImages(page)
  const path = join(artifacts, `kalavedike-sponsors-${testInfo.project.name}.png`)
  await page.screenshot({ path, fullPage: true, animations: 'disabled' })
  await testInfo.attach('Configured sponsors page', { path, contentType: 'image/png' })
  await main.getByRole('link', { name: /Get in touch about sponsorship/ }).click()
  await expect(page).toHaveURL(/#\/contact$/)
})

test('JSON fixtures: event details and sponsors render editable times, venues, links and images', async ({ page, context }, testInfo) => {
  const event = {
    id: 'json-concert', title: 'JSON concert fixture', artForm: 'Carnatic music',
    date: '2027-01-23', time: '18:30', endTime: '20:00', venue: 'Test community hall, Bengaluru',
    artists: [{ name: 'Test performer', url: 'https://example.com/performer' }],
    photo: 'assets/illustrations/carnatic.svg', photoAlt: 'A face-free concert stage illustration',
    description: 'Program details supplied through JSON.', tentative: false,
  }
  const sponsor = {
    id: 'json-sponsor', name: 'JSON sponsor fixture', bio: 'A short sponsor bio supplied through JSON.',
    website: 'https://example.com/sponsor', logo: 'assets/branding/mark.svg', placeholder: false,
  }
  await page.route('**/src/content/events.json*', (route) => route.fulfill({
    contentType: 'application/javascript', body: `export default ${JSON.stringify([event])}`,
  }))
  await page.route('**/src/content/sponsors.json*', (route) => route.fulfill({
    contentType: 'application/javascript', body: `export default ${JSON.stringify([sponsor])}`,
  }))
  await context.route('https://example.com/**', (route) => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><title>Test destination</title>',
  }))
  await page.goto('/#/')
  await expect(page.getByRole('heading', { name: event.title, exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: event.photoAlt, exact: true })).toBeVisible()
  await page.getByRole('link', { name: `Details for ${event.title}`, exact: true }).click()
  const details = page.getByRole('article', { name: event.title, exact: true })
  await expect(details).toContainText(/6:30\s*pm - 8:00\s*pm IST/i)
  await expect(details).toContainText(event.venue)
  await expect(details).toContainText(event.description)
  await expect(details.getByText('Proposed date', { exact: true })).toHaveCount(0)
  await expect(details.getByRole('img', { name: event.photoAlt, exact: true })).toBeVisible()
  await expect(page.locator('.season-notice')).toHaveCount(0)
  await loadImages(page)
  const path = join(artifacts, `kalavedike-json-event-${testInfo.project.name}.png`)
  await details.screenshot({ path, animations: 'disabled' })
  const artistPopup = page.waitForEvent('popup')
  await details.getByRole('link', { name: /Test performer/ }).click()
  const artistPage = await artistPopup
  await expect(artistPage).toHaveURL(event.artists[0].url)
  await artistPage.close()
  await page.goto('/#/sponsors')
  await expect(page.getByText(sponsor.bio, { exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: `${sponsor.name} logo`, exact: true })).toBeVisible()
  await expect(page.locator('.sponsor-notice')).toHaveCount(0)
  await loadImages(page)
  const sponsorPopup = page.waitForEvent('popup')
  await page.getByRole('link', { name: `Visit ${sponsor.name} website (opens in a new tab)`, exact: true }).click()
  const sponsorPage = await sponsorPopup
  await expect(sponsorPage).toHaveURL(sponsor.website)
  await sponsorPage.close()
})

test('home testimonial carousel supports controls, selectors and keyboard navigation', async ({ page }, testInfo) => {
  await page.goto('/#/')
  const carousel = page.getByRole('region', { name: 'Voices from our community.', exact: true })
  await expect(carousel).toHaveAttribute('aria-roledescription', 'carousel')
  await expect(carousel.getByText('Placeholder testimonial', { exact: true })).toBeVisible()
  await expect(carousel.getByText(/not actual quotes or endorsements/)).toBeVisible()
  await expect(carousel.getByRole('group', { name: '1 of 3', exact: true })).toBeVisible()
  await carousel.getByRole('button', { name: 'Previous testimonial', exact: true }).click()
  await expect(carousel.getByRole('group', { name: '3 of 3', exact: true })).toBeVisible()
  await carousel.getByRole('button', { name: 'Next testimonial', exact: true }).click()
  await expect(carousel.getByRole('group', { name: '1 of 3', exact: true })).toBeVisible()
  const second = carousel.getByRole('button', { name: 'Show testimonial 2', exact: true })
  await second.click()
  await expect(second).toHaveAttribute('aria-current', 'true')
  await expect(carousel.getByRole('group', { name: '2 of 3', exact: true })).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(carousel.getByRole('group', { name: '3 of 3', exact: true })).toBeVisible()
  await expect(second).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(carousel.getByRole('group', { name: '2 of 3', exact: true })).toBeVisible()
  await expect(carousel.locator('[aria-roledescription="slide"]')).toHaveCount(1)
  const path = join(artifacts, `kalavedike-testimonials-${testInfo.project.name}.png`)
  await carousel.screenshot({ path, animations: 'disabled', style: '.skip-link { visibility: hidden; }' })
  await testInfo.attach('Home testimonial carousel', { path, contentType: 'image/png' })
})

test('about renders the revised story, vision, offerings and supplied trustees', async ({ page }, testInfo) => {
  await page.goto('/#/about')
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 1, name: 'About Kalavedike', exact: true })).toBeVisible()
  await expect(main.locator('p.eyebrow').filter({ hasText: /^Bringing the arts closer to home\.$/ })).toBeVisible()
  await expect(main.getByText(about.subtitle, { exact: true })).toBeVisible()
  const introduction = main.getByRole('region', { name: 'Why Kalavedike began' })
  for (const paragraph of about.introduction) {
    await expect(introduction.getByText(paragraph, { exact: true })).toBeVisible()
  }
  await expect(introduction).toContainText('Bengaluru')
  await expect(introduction).toContainText('Sarjapur Road')
  await expect(introduction).toContainText('Malleswaram, Basavanagudi, and Banashankari')
  await expect(introduction).toContainText('over 90 minutes each way')
  for (const [heading, paragraphs] of [
    [/^Our Story$/, about.story],
    [/^Join Us on\s*This Journey$/, about.join],
  ] as const) {
    const section = main.getByRole('region', { name: heading })
    await expect(section.getByRole('heading', { name: heading })).toBeVisible()
    for (const paragraph of paragraphs) {
      await expect(section.getByText(paragraph, { exact: true })).toBeVisible()
    }
  }
  const vision = main.getByRole('region', { name: 'Our Vision', exact: true })
  await expect(main.getByRole('heading', { name: /^More Than a\s*Performance Venue$/ })).toHaveCount(0)
  await expect(vision.getByRole('heading', { name: 'Our Vision', exact: true })).toBeVisible()
  await expect(vision.locator('.vision-statement p')).toHaveText(approvedVision)
  const offerings = main.getByRole('region', { name: 'What We Do', exact: true })
  await expect(offerings.getByRole('heading', { name: 'What We Do', exact: true })).toBeVisible()
  await expect(offerings.getByText(about.offeringsIntroduction, { exact: true })).toBeVisible()
  await expect(offerings.getByRole('listitem')).toHaveText(about.offerings)
  await expect(offerings.getByText(about.offeringsConclusion, { exact: true })).toBeVisible()
  const trusteeSection = main.getByRole('region', { name: 'Meet our trustees.', exact: true })
  await expect(trusteeSection).toContainText('The founding members form the trust that guides Kalavedike')
  await expect(trusteeSection).toContainText('Additional trustee biographies and photographs will be added when available.')
  await expect(trusteeSection.locator('.trustee-card')).toHaveCount(5)
  for (const { name, bio, photo, photoAlt } of trustees) {
    const card = trusteeSection.getByRole('article').filter({ has: page.getByRole('heading', { name, exact: true }) })
    await expect(card.getByRole('heading', { name, exact: true })).toBeVisible()
    if (photo) {
      const portrait = card.getByRole('img', { name: photoAlt, exact: true })
      await portrait.scrollIntoViewIfNeeded()
      await expect(portrait).toBeVisible()
      await expect.poll(() => portrait.evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)).toBe(true)
      await expect(portrait).toHaveCSS('object-fit', 'contain')
      await expect(card.locator('img')).toHaveAttribute('src', new RegExp(`${photo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`))
      await expect(card.getByText('Photo to follow', { exact: true })).toHaveCount(0)
    } else {
      await expect(card.getByRole('img', { name: `Photo placeholder for ${name}`, exact: true })).toBeVisible()
      await expect(card.getByText('Photo to follow', { exact: true })).toBeVisible()
      await expect(card.locator('img')).toHaveCount(0)
    }
    await expect(card.locator('p').last()).toHaveText(bio)
    expect(await card.locator('p').last().evaluate((paragraph) => paragraph.textContent)).toBe(bio)
    await expect(card).not.toContainText('Sample profile')
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  const trusteeScreenshot = join(artifacts, `kalavedike-trustees-${testInfo.project.name}.png`)
  await trusteeSection.screenshot({ path: trusteeScreenshot, animations: 'disabled' })
  await testInfo.attach('Trustee introductions and photo placeholders', { path: trusteeScreenshot, contentType: 'image/png' })
  await main.getByRole('region', { name: /^Join Us on\s*This Journey$/ }).getByRole('link', { name: /Explore our programs/ }).click()
  await expect(page).toHaveURL(/#\/events$/)
})

test('mobile menu closes with Escape and restores toggle focus', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-only disclosure')
  await page.goto('/#/')
  await page.getByRole('button', { name: /^Menu/ }).click()
  await page.getByRole('button', { name: /Close menu/ }).focus()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: /^Menu/ })).toBeFocused()
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeHidden()
  await page.getByRole('button', { name: /^Menu/ }).click()
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home', exact: true }).focus()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: /^Menu/ })).toBeFocused()
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeHidden()
})

test('gallery opens Instagram without placeholder thumbnails or sample content', async ({ page, context }) => {
  const instagram = 'https://www.instagram.com/bellezeakalavedike/'
  await context.route('https://www.instagram.com/**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<!doctype html><title>Instagram destination</title>',
  }))
  await page.goto('/#/gallery')
  const main = page.getByRole('main')
  await expect(main.locator('img, .album-card, .album-grid, select, time')).toHaveCount(0)
  await expect(page.locator('body')).not.toContainText(/placeholder|sample album|Strings of tradition/i)
  const links = main.getByRole('link')
  await expect(links).toHaveCount(1)
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('href', instagram)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(link).toHaveAccessibleName(/opens in a new tab/)
  }
  const cta = main.getByRole('link', { name: 'View on Instagram (opens in a new tab)', exact: true })
  await cta.focus()
  const popupPromise = page.waitForEvent('popup')
  await page.keyboard.press('Enter')
  const popup = await popupPromise
  await expect(popup).toHaveURL(instagram)
  await popup.close()
  await expect(page).toHaveURL(/#\/gallery$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('contact page is reachable from the footer and honestly identifies the unpublished email', async ({ page }) => {
  await page.goto('/#/gallery')
  await page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Contact us', exact: true }).click()
  await expect(page).toHaveURL(/#\/contact$/)
  await expect(page).toHaveTitle('Contact us | Kalavedike')
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 1, name: 'Contact us', exact: true })).toBeVisible()
  await expect(main.getByRole('heading', { name: 'Write to us', exact: true })).toBeVisible()
  await expect(main.getByText(/Our email address has not been published yet/)).toBeVisible()
  await expect(main.locator('a[href^="mailto:"]')).toHaveCount(0)
  await expect(main.getByRole('link', { name: /@bellezeakalavedike/ })).toHaveAttribute('href', 'https://www.instagram.com/bellezeakalavedike/')
})

test('home shows up to three upcoming configured programs and opens a persistent deep link', async ({ page }) => {
  await page.goto('/#/')
  const upcoming = upcomingEvents(events, now).slice(0, 3)
  const cards = page.locator('.event-card')
  await expect(cards).toHaveCount(upcoming.length)
  for (const [index, event] of upcoming.entries()) {
    const card = cards.nth(index)
    await expect(card.getByRole('heading', { name: event.title, exact: true })).toBeVisible()
    await expect(card.locator('time')).toHaveAttribute('datetime', programStart(event))
    await expect(card).toContainText(formatDate(programStart(event)))
    await expect(card).toContainText(event.startsAt ? `${formatTime(event.startsAt)} IST` : 'Time TBA')
    await expect(card).toContainText(event.venue)
    if (event.tentative) await expect(card).toContainText('Proposed date')
    else await expect(card.getByText('Proposed date', { exact: true })).toHaveCount(0)
  }
  if (!upcoming.length) {
    await expect(page.getByText('No upcoming programs are listed. Please check back for future announcements.')).toBeVisible()
    return
  }
  const event = upcoming[0]
  await cards.first().getByRole('link', { name: `Details for ${event.title}`, exact: true }).click()
  await expect(page).toHaveURL((url) => new URLSearchParams(url.hash.split('?')[1]).get('event') === event.id)
  await expect(page.getByRole('region', { name: `${programDate(event).slice(0, 4)} season`, exact: true })).toBeVisible()
  await expectDetails(page, event)
  await page.reload()
  await expectDetails(page, event)
})

test('annual overview shows every configured program without empty calendar cells or month controls', async ({ page }) => {
  await page.goto('/#/events')
  expect(events).toHaveLength(eventRecords.length)
  await expect(page.getByRole('heading', { level: 1, name: 'Make time for the arts.', exact: true })).toBeVisible()
  await expect(page.getByRole('table')).toHaveCount(0)
  await expect(page.locator('td, [role="gridcell"], .day-number, .outside-month')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /^(?:Previous month|Next month|Today|Go to the next listed program)/ })).toHaveCount(0)
  await expect(page.locator('.event-selection-hint, .event-details')).toHaveCount(0)
  await expect(page.getByRole('combobox', { name: 'Program year', exact: true })).toHaveCount(years.length > 1 ? 1 : 0)
  await expect(page.locator('.schedule-source')).toContainText('Times are in India Standard Time (IST).')
  await expect(page.locator('.schedule-source')).not.toContainText(/Last imported|snapshot|spreadsheet/i)
  if (!schedule.length) await expect(page.getByText('No programs have been listed yet. Please check back for future announcements.')).toBeVisible()
  for (const year of years) {
    await selectYear(page, year)
    const expected = seasonPrograms(year)
    const season = page.getByRole('region', { name: `${year} season`, exact: true })
    const list = season.getByRole('list', { name: `Programs for ${year}`, exact: true })
    await expect(list.getByRole('listitem')).toHaveCount(expected.length)
    await expect(list.getByRole('button')).toHaveCount(expected.length)
    await expect(list.locator('.program-title')).toHaveText(expected.map((event) => event.title))
    await expect(season.getByRole('status')).toContainText(`${expected.length} ${expected.length === 1 ? 'program' : 'programs'}`)
    for (const event of expected) {
      const tile = list.getByRole('button', { name: tileName(event), exact: true })
      await tile.scrollIntoViewIfNeeded()
      await expect(tile).toBeInViewport()
      await expect(tile.locator('time')).toHaveAttribute('datetime', programStart(event))
      await expect(tile.locator('time span')).toHaveText(new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(programStart(event))))
      await expect(tile.locator('time strong')).toHaveText(programDate(event).slice(-2))
      await expect(tile.locator('.program-artform')).toHaveText(event.artForm)
      await expect(tile).toContainText(programDate(event) !== programEndDate(event) ? formatEventRange(event) : event.startsAt ? `${formatTime(event.startsAt)} IST` : 'Time to be announced')
      if (event.tentative) await expect(tile).toContainText('Proposed date')
      else await expect(tile.getByText('Proposed date', { exact: true })).toHaveCount(0)
    }
  }
})

test('desktop annual grid stays compact with up to two rows above the fold', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Desktop density requirement')
  const expected = seasonPrograms(initialYear)
  test.skip(!expected.length, 'No configured programs to measure')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/#/events')
  const list = page.getByRole('list', { name: `Programs for ${initialYear}`, exact: true })
  await expect(list.getByRole('button')).toHaveCount(expected.length)
  await page.evaluate(() => document.fonts.ready)
  const layout = await list.evaluate((element) => {
    const tiles = [...element.querySelectorAll('button')].map((tile) => tile.getBoundingClientRect())
    return {
      height: element.getBoundingClientRect().height,
      columns: new Set(tiles.map((tile) => Math.round(tile.x))).size,
      aboveFold: tiles.filter((tile) => tile.top >= 0 && tile.bottom <= window.innerHeight).length,
    }
  })
  expect(layout.height, 'Annual tiles retain compact row density').toBeLessThanOrEqual(Math.max(700, Math.ceil(expected.length / 4) * 234))
  expect(layout.columns).toBe(Math.min(4, expected.length))
  expect(layout.aboveFold, 'Up to two complete rows are visible without scrolling').toBeGreaterThanOrEqual(Math.min(8, expected.length))
})

test('music and dance filters retain chronological order and survive the detail return journey', async ({ page }) => {
  await page.goto('/#/events')
  const expectedSeason = seasonPrograms(initialYear)
  test.skip(!expectedSeason.length, 'No configured programs to filter')
  const season = page.getByRole('region', { name: `${initialYear} season`, exact: true })
  const filters = season.getByRole('group', { name: 'Filter programs', exact: true })
  const list = season.getByRole('list', { name: `Programs for ${initialYear}`, exact: true })
  const music = expectedSeason.filter(isMusic)
  const dance = expectedSeason.filter((event) => !isMusic(event))
  await expect(filters.getByRole('button')).toHaveText([`All programs ${expectedSeason.length}`, `Music ${music.length}`, `Dance ${dance.length}`])
  for (const [label, expected] of [
    [`Music ${music.length}`, music],
    [`Dance ${dance.length}`, dance],
    [`All programs ${expectedSeason.length}`, expectedSeason],
  ] as const) {
    const filter = filters.getByRole('button', { name: label, exact: true })
    await filter.click()
    await expect(filter).toHaveAttribute('aria-pressed', 'true')
    await expect(filters.getByRole('button', { pressed: true })).toHaveCount(1)
    await expect(season.getByRole('status')).toContainText(`${expected.length} ${expected.length === 1 ? 'program' : 'programs'}`)
    if (!expected.length) {
      await expect(list).toHaveCount(0)
      await expect(season.getByText(/No (music|dance) programs are listed/)).toBeVisible()
      continue
    }
    await expect(list.getByRole('button')).toHaveCount(expected.length)
    await expect(list.locator('.program-title')).toHaveText(expected.map((event) => event.title))
    const tile = list.getByRole('button').last()
    await tile.click()
    await expect(page.locator('.event-details h2')).toBeFocused()
    await page.getByRole('button', { name: 'Back to all programs', exact: false }).click()
    await expect(page).toHaveURL(/#\/events$/)
    await expect(page.locator('.event-details')).toHaveCount(0)
    await expect(tile).toBeFocused()
    await expect(filter).toHaveAttribute('aria-pressed', 'true')
    await expect(list.locator('.program-title')).toHaveText(expected.map((event) => event.title))
  }
})

test('all configured programs open details above the schedule and return focus to their tiles', async ({ page }) => {
  test.skip(!schedule.length, 'No configured programs to open')
  await page.goto('/#/events')
  for (const event of schedule) {
    const year = Number(programDate(event).slice(0, 4))
    await selectYear(page, year)
    const list = page.getByRole('list', { name: `Programs for ${year}`, exact: true })
    const button = list.getByRole('button', { name: tileName(event), exact: true })
    await expect(button).toBeVisible()
    await button.click()
    await expect(page).toHaveURL((url) => new URLSearchParams(url.hash.split('?')[1]).get('event') === event.id)
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('heading', { name: event.title, exact: true })).toBeFocused()
    const details = await expectDetails(page, event)
    expect(await details.evaluate((element) => Boolean(element.compareDocumentPosition(document.getElementById('program-schedule')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true)
    await expect(list.getByRole('button')).toHaveCount(seasonPrograms(year).length)
    await page.getByRole('button', { name: /Back to all programs/ }).click()
    await expect(page).toHaveURL(/#\/events$/)
    await expect(details).toHaveCount(0)
    await expect(button).toBeFocused()
    await expect(button).toHaveAttribute('aria-pressed', 'false')
  }
})

test('each configured program supports a direct deep link with its actual date and time', async ({ page }) => {
  test.skip(!schedule.length, 'No configured programs for direct deep links')
  for (const event of schedule) {
    await page.goto('about:blank')
    await page.goto(`/#/events?event=${encodeURIComponent(event.id)}`)
    const year = Number(programDate(event).slice(0, 4))
    await expect(page.getByRole('region', { name: `${year} season`, exact: true })).toBeVisible()
    await expect(page.getByRole('list', { name: `Programs for ${year}`, exact: true }).getByRole('button')).toHaveCount(seasonPrograms(year).length)
    await expectDetails(page, event)
  }
})

test('configured artist links are usable external links without turning unlinked names into links', async ({ page }) => {
  const withArtists = schedule.filter((event) => event.artists?.length)
  test.skip(!withArtists.length, 'No artists are configured in events.json')
  for (const event of withArtists) {
    await page.goto(`/#/events?event=${encodeURIComponent(event.id)}`)
    const details = await expectDetails(page, event)
    const artists = details.locator('.event-artists li')
    await expect(artists).toHaveCount(event.artists!.length)
    for (const [index, artist] of event.artists!.entries()) {
      const item = artists.nth(index)
      await expect(item).toContainText(artist.name)
      if (artist.url) {
        const link = item.getByRole('link')
        await expect(link).toHaveAttribute('href', artist.url)
        await expect(link).toHaveAttribute('target', '_blank')
        await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        await expect(link).toHaveAccessibleName(`${artist.name} (opens in a new tab)`)
      } else {
        await expect(item.getByRole('link')).toHaveCount(0)
      }
    }
  }
})

test('configured event photos load with their supplied alternative text', async ({ page }) => {
  const withPhotos = schedule.filter((event) => event.photo)
  test.skip(!withPhotos.length, 'No event photos are configured in events.json')
  for (const event of withPhotos) {
    await page.goto(`/#/events?event=${encodeURIComponent(event.id)}`)
    const details = await expectDetails(page, event)
    const photo = details.getByRole('img', { name: event.photoAlt || `Photo for ${event.title}`, exact: true })
    await expect(photo).toBeVisible()
    const actual = new URL((await photo.getAttribute('src'))!, page.url())
    const expected = new URL(event.photo!.replace(/^\/+/, ''), page.url().split('#')[0])
    expect(actual.href).toBe(expected.href)
    await loadImages(page)
  }
})

test('configured timed events show their actual start and optional end time', async ({ page }) => {
  const timed = schedule.filter((event) => event.startsAt)
  test.skip(!timed.length, 'No event times are configured in events.json')
  for (const event of timed) {
    await page.goto(`/#/events?event=${encodeURIComponent(event.id)}`)
    const details = await expectDetails(page, event)
    const when = details.locator('dd').first()
    await expect(when).toContainText(formatTime(event.startsAt!))
    if (event.endsAt) await expect(when).toContainText(formatTime(event.endsAt))
    await expect(when).not.toContainText('Time to be announced')
  }
})

test('keyboard skip link focuses main without corrupting the hash route', async ({ page }) => {
  await page.goto('/#/gallery')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await expect(page).toHaveURL(/\/#\/gallery$/)
})

for (const route of routes) {
  test(`${route.title}: all images load without browser errors`, async ({ page }) => {
    await page.goto(`/#${route.path}`)
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('img').first()).toBeAttached()
    await loadImages(page)
  })
}

for (const width of [320, 390]) {
  test(`all pages fit a ${width}px mobile viewport without horizontal overflow`, async ({ page, isMobile }, testInfo) => {
    test.skip(!isMobile, 'Exercise narrow widths in the mobile browser project')
    await page.setViewportSize({ width, height: 844 })
    for (const route of routes) {
      await page.goto(`/#${route.path}`)
      await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible()
      await loadImages(page)
      await expect.poll(() => page.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        viewport: window.innerWidth,
      })).then(({ document, body, viewport }) => Math.max(document, body) - viewport), {
        message: `${route.path} must fit ${width}px without horizontal scrolling`,
      }).toBeLessThanOrEqual(1)
      await page.evaluate(() => document.fonts.ready)
      const path = join(artifacts, `kalavedike-mobile-${width}-${route.path === '/' ? 'home' : route.path.slice(1)}.png`)
      await page.screenshot({ path, fullPage: true, animations: 'disabled' })
      await testInfo.attach(`${route.title} at ${width}px`, { path, contentType: 'image/png' })
    }
  })
}

test('capture home screenshot', async ({ page }, testInfo) => {
  await page.goto('/#/')
  await loadImages(page)
  await page.evaluate(() => document.fonts.ready)
  const path = join(artifacts, `kalavedike-home-${testInfo.project.name}.png`)
  await page.screenshot({ path, fullPage: true, animations: 'disabled' })
  await testInfo.attach('Home page', { path, contentType: 'image/png' })
})

test('production subpath: all hash pages, built assets, and images resolve under /Kalavedike/', async ({ page, baseURL }, testInfo) => {
  const failedRequests: string[] = []
  const assets = new Set<string>()
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`))
  page.on('response', (response) => {
    if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`)
    if (['image', 'stylesheet', 'script', 'font'].includes(response.request().resourceType())) assets.add(response.url())
  })

  const evidence: { route: string; url: string; images: number }[] = []
  for (const route of routes) {
    await page.goto('about:blank')
    const response = await page.goto(`${baseURL}#${route.path}`)
    expect(response?.status()).toBe(200)
    expect(await response!.text()).not.toContain('/@vite/client')
    await expect(page).toHaveTitle(`${route.title} | Kalavedike`)
    await expect(page.locator('body')).not.toContainText(/Kalaved[h]ike/i)
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('script[src]')).toHaveAttribute('src', /^\.\/assets\/index-[\w-]+\.js$/)
    await loadImages(page)
    const imageSources = await page.locator('img').evaluateAll((images) => images.map((image) => image.currentSrc))
    expect(imageSources.length).toBeGreaterThan(0)
    for (const src of imageSources) expect(src).toMatch(/^http:\/\/127\.0\.0\.1:4179\/Kalavedike\/assets\//)
    const path = join(artifacts, `kalavedike-${testInfo.project.name}-${route.path === '/' ? 'home' : route.path.slice(1)}.png`)
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path, fullPage: true, animations: 'disabled' })
    await testInfo.attach(`${route.title} production screenshot`, { path, contentType: 'image/png' })
    evidence.push({ route: route.path, url: page.url(), images: imageSources.length })
  }

  const upcoming = upcomingEvents(events, now)[0]
  const event = upcoming ?? schedule[0]
  if (event) {
    if (upcoming) {
      await page.goto(`${baseURL}#/`)
      await page.locator('.event-card').first().getByRole('link', { name: `Details for ${event.title}`, exact: true }).click()
    } else {
      await page.goto(`${baseURL}#/events`)
      await selectYear(page, Number(programDate(event).slice(0, 4)))
      await page.getByRole('button', { name: tileName(event), exact: true }).click()
    }
    await expect(page).toHaveURL((url) => url.href.startsWith(`${baseURL}#/events?`) && new URLSearchParams(url.hash.split('?')[1]).get('event') === event.id)
    await expectDetails(page, event)
    await loadImages(page)
    await page.reload()
    await expectDetails(page, event)
    await loadImages(page)
  }

  for (const asset of assets) expect(new URL(asset).pathname).toMatch(/^\/Kalavedike\/assets\//)
  expect(failedRequests, 'No failed requests or HTTP errors in the production build').toEqual([])
  await testInfo.attach('Production routing and asset evidence', {
    body: JSON.stringify({ pages: evidence, assets: [...assets].sort(), failedRequests }, null, 2),
    contentType: 'application/json',
  })
})
