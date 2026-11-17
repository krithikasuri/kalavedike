import { expect, test } from '@playwright/test'

for (const prefix of ['', 'production subpath: ']) {
  test(`${prefix}website guide opens from the footer and fits narrow screens`, async ({ page, isMobile }) => {
    await page.goto('./#/')
    await page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Website guide', exact: true }).click()
    await expect(page).toHaveURL(/#\/how-to$/)
    await expect(page).toHaveTitle('Website guide | Kalavedhike')
    await expect(page.getByRole('heading', { level: 1, name: 'Website guide', exact: true })).toBeVisible()
    await expect(page.getByRole('main')).toBeFocused()
    await page.getByText('Show an event example', { exact: true }).click()
    await expect(page.getByLabel('Event JSON example')).toBeVisible()
    await page.getByText('Show a sponsor example', { exact: true }).click()
    await expect(page.getByLabel('Sponsor JSON example')).toBeVisible()
    await expect(page.getByRole('link', { name: /Open the sponsors file/ })).toHaveAttribute('href', 'https://github.com/krithikasuri/kalavedike/blob/main/src/content/sponsors.json')
    for (const width of isMobile ? [320, 390] : [1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1)
    }
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Save and publish', exact: true })).toBeVisible()
  })
}
