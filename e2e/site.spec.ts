import { expect, test, type Page } from '@playwright/test'
import { join, resolve } from 'node:path'
import { about } from '../src/content/about'

const artifacts = process.env.KALAVEDIKE_ARTIFACTS_DIR ?? resolve('test-results')
const routes = [
  { path: '/', label: 'Home', title: 'Home' },
  { path: '/about', label: 'About us', title: 'About the trust' },
  { path: '/events', label: 'Events', title: 'Events' },
  { path: '/gallery', label: 'Gallery', title: 'Gallery' },
  { path: '/sponsors', label: 'Sponsors', title: 'Sponsors' },
  { path: '/contact', label: 'Contact us', title: 'Contact us' },
] as const
const schedule = [
  ['2027-01-23', 'Carnatic Vocal 1'],
  ['2027-02-13', 'Bharatanatyam 1'],
  ['2027-03-13', 'Carnatic Instrumental 1 - Veena'],
  ['2027-04-10', 'Carnatic Vocal 2'],
  ['2027-05-08', 'Bharatanatyam 2'],
  ['2027-06-12', 'Hindustani Vocal'],
  ['2027-07-10', 'Carnatic Vocal 3'],
  ['2027-08-21', 'Kathak'],
  ['2027-09-11', 'Carnatic Instrumental 2 - Violin'],
  ['2027-10-16', 'Bharatanatyam 3'],
  ['2027-11-13', 'Carnatic Vocal 4'],
  ['2027-12-11', 'Bharatanatyam 4'],
].map(([date, title]) => ({
  date,
  title,
  id: `calendar-${date}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  monthStamp: new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: 'UTC' }).format(new Date(date)),
  dateLabel: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(date)),
}))
const approvedVision = [
  'To create a vibrant cultural space where the richness of Indian classical performing arts is accessible to everyone, right in their neighbourhood.',
  'We envision a community where distance is no longer a barrier to experiencing the beauty of music and dance, where artists find an appreciative audience, and where the next generation grows up surrounded by the richness of our artistic heritage.',
  'Our aspiration is simple: To bring art closer to people, and people closer to art.',
]

test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.clock.setFixedTime(new Date('2026-11-17T04:30:00Z'))
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
    await expect(page).toHaveTitle(`${route.title} | Kalavedhike`)
    await expect(page.getByRole('banner').getByRole('link', { name: 'Kalavedhike home', exact: true })).toBeVisible()
    await expect(page.getByRole('contentinfo').getByRole('link', { name: /@bellezeakalavedike/ })).toHaveAttribute('href', 'https://www.instagram.com/bellezeakalavedike/')
    const notice = page.getByRole('complementary', { name: 'Program and gallery notice' })
    await expect(notice).toContainText('All 2027 calendar dates remain proposals, not confirmed bookings.')
    await expect(notice).toContainText('Visit our Instagram page for photos and updates.')
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
  await expect(page.getByRole('contentinfo')).toContainText('Celebrating Tradition. Building Community. Bringing Art Closer to Home.')
  await page.getByRole('link', { name: /Discover Kalavedhike/ }).click()
  await expect(page).toHaveURL(/#\/about$/)
  await expect(page.getByRole('heading', { level: 1, name: 'About Kalavedhike', exact: true })).toBeVisible()
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

test('sponsors page keeps logo slots blank and does not invent active sponsor websites', async ({ page }, testInfo) => {
  await page.goto('/#/sponsors')
  const main = page.getByRole('main')
  await expect(page).toHaveTitle('Sponsors | Kalavedhike')
  await expect(main.getByRole('heading', { level: 1, name: 'Our sponsors', exact: true })).toBeVisible()
  await expect(main.getByText(/not confirmed sponsors/)).toBeVisible()
  await expect(main.locator('.sponsor-card')).toHaveCount(3)
  await expect(main.getByRole('img', { name: 'Blank sponsor logo placeholder', exact: true })).toHaveCount(3)
  await expect(main.locator('img, .sponsor-card a')).toHaveCount(0)
  await expect(main.getByText('Website to be added', { exact: true })).toHaveCount(3)
  const path = join(artifacts, `kalavedike-sponsors-${testInfo.project.name}.png`)
  await page.screenshot({ path, fullPage: true, animations: 'disabled' })
  await testInfo.attach('Sponsor placeholder page', { path, contentType: 'image/png' })
  await main.getByRole('link', { name: /Get in touch about sponsorship/ }).click()
  await expect(page).toHaveURL(/#\/contact$/)
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

test('about renders the full approved story, vision, offerings, community and supplied trustees', async ({ page }, testInfo) => {
  await page.goto('/#/about')
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 1, name: 'About Kalavedhike', exact: true })).toBeVisible()
  await expect(main.getByText('Bringing the Arts Closer to Home', { exact: true })).toBeVisible()
  await expect(main.getByText(about.subtitle, { exact: true })).toBeVisible()
  const introduction = main.getByRole('region', { name: 'Why Kalavedhike began' })
  for (const paragraph of about.introduction) {
    await expect(introduction.getByText(paragraph, { exact: true })).toBeVisible()
  }
  await expect(introduction).toContainText('Bengaluru')
  await expect(introduction).toContainText('Sarjapur Road')
  await expect(introduction).toContainText('Malleswaram, Basavanagudi, and Banashankari')
  await expect(introduction).toContainText('over 90 minutes each way')
  for (const [heading, paragraphs] of [
    [/^Our Story$/, about.story],
    [/^More Than a\s*Performance Venue$/, about.community],
    [/^Join Us on\s*This Journey$/, about.join],
  ] as const) {
    const section = main.getByRole('region', { name: heading })
    await expect(section.getByRole('heading', { name: heading })).toBeVisible()
    for (const paragraph of paragraphs) {
      await expect(section.getByText(paragraph, { exact: true })).toBeVisible()
    }
  }
  const vision = main.getByRole('region', { name: 'Our Vision', exact: true })
  await expect(vision.getByRole('heading', { name: 'Our Vision', exact: true })).toBeVisible()
  await expect(vision.locator('.vision-statement p')).toHaveText(approvedVision)
  const offerings = main.getByRole('region', { name: 'What We Do', exact: true })
  await expect(offerings.getByRole('heading', { name: 'What We Do', exact: true })).toBeVisible()
  await expect(offerings.getByText(about.offeringsIntroduction, { exact: true })).toBeVisible()
  await expect(offerings.getByRole('listitem')).toHaveText(about.offerings)
  await expect(offerings.getByText(about.offeringsConclusion, { exact: true })).toBeVisible()
  const trusteeSection = main.getByRole('region', { name: 'Meet our trustees.', exact: true })
  await expect(trusteeSection).toContainText('The founding members form the trust that guides Kalavedhike')
  await expect(trusteeSection).toContainText('Individual biographies and photographs will be added when available.')
  await expect(trusteeSection.locator('.trustee-card')).toHaveCount(5)
  for (const name of ['Pallavi K Srinivasa', 'Roopa Sreedharan Madampath', 'Krithika Surianarayanan', 'Shanthi Naresh', 'Tarini Basavaraju']) {
    const card = trusteeSection.getByRole('article').filter({ has: page.getByRole('heading', { name, exact: true }) })
    await expect(card.getByRole('heading', { name, exact: true })).toBeVisible()
    await expect(card.getByRole('img', { name: `Photo placeholder for ${name}`, exact: true })).toBeVisible()
    await expect(card.getByText('Photo to follow', { exact: true })).toBeVisible()
    await expect(card).toContainText(`${name} is a trustee of Kalavedhike.`)
    await expect(card.locator('img')).toHaveCount(0)
    await expect(card).not.toContainText('Sample profile')
  }
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
  await expect(page).toHaveTitle('Contact us | Kalavedhike')
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 1, name: 'Contact us', exact: true })).toBeVisible()
  await expect(main.getByRole('heading', { name: 'Write to us', exact: true })).toBeVisible()
  await expect(main.getByText(/Our email address has not been published yet/)).toBeVisible()
  await expect(main.locator('a[href^="mailto:"]')).toHaveCount(0)
  await expect(main.getByRole('link', { name: /@bellezeakalavedike/ })).toHaveAttribute('href', 'https://www.instagram.com/bellezeakalavedike/')
})

test('home shows the first three imported programs and opens the January date-only deep link', async ({ page }) => {
  await page.goto('/#/')
  const cards = page.locator('.event-card')
  await expect(cards).toHaveCount(3)
  for (const [index, event] of schedule.slice(0, 3).entries()) {
    const card = cards.nth(index)
    await expect(card.getByRole('heading', { name: event.title, exact: true })).toBeVisible()
    await expect(card.locator('time')).toHaveAttribute('datetime', event.date)
    await expect(card).toContainText(event.dateLabel)
    await expect(card).toContainText('Time TBA')
    await expect(card).toContainText('Venue to be announced')
    await expect(card).toContainText('Proposed date')
    await expect(card).not.toContainText(/\b\d{1,2}:\d{2}\s*(?:am|pm)\b/i)
  }
  await page.getByRole('link', { name: 'Details for Carnatic Vocal 1', exact: true }).click()
  await expect(page).toHaveURL(/\/#\/events\?event=calendar-2027-01-23-carnatic-vocal-1$/)
  await expect(page.getByRole('region', { name: '2027 season', exact: true })).toBeVisible()
  const details = page.getByRole('article', { name: 'Carnatic Vocal 1', exact: true })
  await expect(details).toBeVisible()
  await expect(details).toContainText('23 January 2027 | Time to be announced (IST)')
  await expect(details).toContainText('Venue to be announced')
  await expect(details).toContainText('Proposed date')
  await expect(details).not.toContainText(/\b\d{1,2}:\d{2}\s*(?:am|pm)\b/i)
  await page.reload()
  await expect(page.getByRole('region', { name: '2027 season', exact: true })).toBeVisible()
  await expect(details).toBeVisible()
})

test('annual overview shows all twelve programs without empty calendar cells or month controls', async ({ page }) => {
  await page.goto('/#/events')
  await expect(page.getByRole('heading', { level: 1, name: 'Make time for the arts.', exact: true })).toBeVisible()
  const season = page.getByRole('region', { name: '2027 season', exact: true })
  const list = season.getByRole('list', { name: 'Programs for 2027', exact: true })
  await expect(list.getByRole('listitem')).toHaveCount(12)
  await expect(list.getByRole('button')).toHaveCount(12)
  await expect(list.locator('.program-title')).toHaveText(schedule.map((event) => event.title))
  await expect(season.getByRole('status')).toContainText('12 programs')
  await expect(page.getByRole('table')).toHaveCount(0)
  await expect(page.locator('td, [role="gridcell"], .day-number, .outside-month')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /^(?:Previous month|Next month|Today|Go to the next listed program)/ })).toHaveCount(0)
  await expect(season.getByRole('combobox')).toHaveCount(0)
  await expect(page.locator('.event-selection-hint, .event-details, main img')).toHaveCount(0)
  for (const event of schedule) {
    const tile = list.getByRole('button', { name: `${event.title}, ${event.dateLabel} | Time to be announced (IST), proposed date`, exact: true })
    await tile.scrollIntoViewIfNeeded()
    await expect(tile).toBeInViewport()
    await expect(tile.locator('time')).toHaveAttribute('datetime', event.date)
    await expect(tile.locator('time span')).toHaveText(event.monthStamp)
    await expect(tile.locator('time strong')).toHaveText(event.date.slice(-2))
    const artForm = event.title.startsWith('Carnatic') ? 'Carnatic music'
      : event.title.startsWith('Hindustani') ? 'Hindustani music'
        : event.title.startsWith('Bharatanatyam') ? 'Bharatanatyam' : 'Kathak'
    await expect(tile.locator('.program-artform')).toHaveText(artForm)
    await expect(tile).toContainText('Time to be announced')
    await expect(tile).toContainText('Proposed date')
    await expect(tile).not.toContainText(/\b\d{1,2}:\d{2}\s*(?:am|pm)\b/i)
  }
})

test('desktop annual grid is compact with at least eight programs above the fold', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Desktop density requirement')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/#/events')
  const list = page.getByRole('list', { name: 'Programs for 2027', exact: true })
  await expect(list.getByRole('button')).toHaveCount(12)
  await page.evaluate(() => document.fonts.ready)
  const layout = await list.evaluate((element) => {
    const tiles = [...element.querySelectorAll('button')].map((tile) => tile.getBoundingClientRect())
    return {
      height: element.getBoundingClientRect().height,
      columns: new Set(tiles.map((tile) => Math.round(tile.x))).size,
      aboveFold: tiles.filter((tile) => tile.top >= 0 && tile.bottom <= window.innerHeight).length,
    }
  })
  expect(layout.height, 'All twelve annual tiles fit in a compact grid').toBeLessThanOrEqual(700)
  expect(layout.columns).toBe(4)
  expect(layout.aboveFold, 'At least two complete rows are visible without scrolling').toBeGreaterThanOrEqual(8)
})

test('music and dance filters retain chronological order and survive the detail return journey', async ({ page }) => {
  await page.goto('/#/events')
  const season = page.getByRole('region', { name: '2027 season', exact: true })
  const filters = season.getByRole('group', { name: 'Filter programs', exact: true })
  const list = season.getByRole('list', { name: 'Programs for 2027', exact: true })
  await expect(filters.getByRole('button')).toHaveText(['All programs 12', 'Music 7', 'Dance 5'])
  for (const [label, expected] of [
    ['Music 7', schedule.filter((event) => /^(?:Carnatic|Hindustani)/.test(event.title))],
    ['Dance 5', schedule.filter((event) => /^(?:Bharatanatyam|Kathak)/.test(event.title))],
    ['All programs 12', schedule],
  ] as const) {
    const filter = filters.getByRole('button', { name: label, exact: true })
    await filter.click()
    await expect(filter).toHaveAttribute('aria-pressed', 'true')
    await expect(filters.getByRole('button', { pressed: true })).toHaveCount(1)
    await expect(list.getByRole('button')).toHaveCount(expected.length)
    await expect(list.locator('.program-title')).toHaveText(expected.map((event) => event.title))
    await expect(season.getByRole('status')).toContainText(`${expected.length} programs`)
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

test('all twelve proposed programs open details above the schedule and return focus to their tiles', async ({ page, isMobile }) => {
  await page.goto('/#/events')
  const season = page.getByRole('region', { name: '2027 season', exact: true })
  const list = season.getByRole('list', { name: 'Programs for 2027', exact: true })
  await expect(page.getByText('Proposed dates / Not confirmed bookings', { exact: true })).toBeVisible()
  for (const event of schedule) {
    const button = list.getByRole('button', { name: `${event.title}, ${event.dateLabel} | Time to be announced (IST), proposed date`, exact: true })
    await expect(button).toBeVisible()
    await button.click()
    await expect(page).toHaveURL(new RegExp(`#\\/events\\?event=${event.id}$`))
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('heading', { name: event.title, exact: true })).toBeFocused()
    const details = page.getByRole('article', { name: event.title, exact: true })
    await expect(details.locator('dd')).toHaveText([
      `${event.dateLabel} | Time to be announced (IST)`,
      'Venue to be announced',
    ])
    await expect(details).toContainText('Proposed date')
    await expect(details).toContainText(/Artist(?: or troupe)?, time, and venue are to be announced\./)
    await expect(details).not.toContainText(/sample program|\b\d{1,2}:\d{2}\s*(?:am|pm)\b/i)
    expect(await details.evaluate((element) => Boolean(element.compareDocumentPosition(document.getElementById('program-schedule')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true)
    if (isMobile) await expect(details.locator('img')).toBeHidden()
    await expect(list.getByRole('button')).toHaveCount(12)
    await page.getByRole('button', { name: /Back to all programs/ }).click()
    await expect(page).toHaveURL(/#\/events$/)
    await expect(details).toHaveCount(0)
    await expect(button).toBeFocused()
    await expect(button).toHaveAttribute('aria-pressed', 'false')
  }
})

test('each imported program supports a direct deep link without a fabricated time', async ({ page }) => {
  for (const event of schedule) {
    await page.goto('about:blank')
    await page.goto(`/#/events?event=${event.id}`)
    await expect(page.getByRole('region', { name: '2027 season', exact: true })).toBeVisible()
    await expect(page.getByRole('list', { name: 'Programs for 2027', exact: true }).getByRole('button')).toHaveCount(12)
    const details = page.getByRole('article', { name: event.title, exact: true })
    await expect(details).toContainText(`${event.dateLabel} | Time to be announced (IST)`)
    await expect(details).toContainText('Proposed date')
    await expect(details).not.toContainText(/\b\d{1,2}:\d{2}\s*(?:am|pm)\b/i)
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
    await expect(page).toHaveTitle(`${route.title} | Kalavedhike`)
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

  await page.goto(`${baseURL}#/`)
  await page.getByRole('link', { name: 'Details for Carnatic Vocal 1', exact: true }).click()
  await expect(page).toHaveURL(`${baseURL}#/events?event=calendar-2027-01-23-carnatic-vocal-1`)
  await expect(page.getByRole('region', { name: '2027 season', exact: true })).toBeVisible()
  await expect(page.getByRole('article', { name: 'Carnatic Vocal 1', exact: true })).toBeVisible()
  await loadImages(page)
  await page.reload()
  await expect(page.getByRole('article', { name: 'Carnatic Vocal 1', exact: true })).toBeVisible()
  await loadImages(page)

  for (const asset of assets) expect(new URL(asset).pathname).toMatch(/^\/Kalavedike\/assets\//)
  expect(failedRequests, 'No failed requests or HTTP errors in the production build').toEqual([])
  await testInfo.attach('Production routing and asset evidence', {
    body: JSON.stringify({ pages: evidence, assets: [...assets].sort(), failedRequests }, null, 2),
    contentType: 'application/json',
  })
})
