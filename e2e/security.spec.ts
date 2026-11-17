import { expect, test } from '@playwright/test'

test('production subpath: security policy blocks injected scripts without breaking the website', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.goto('./#/')
  await expect(page.getByRole('heading', { level: 1, name: 'Bringing the arts closer to home.', exact: true })).toBeVisible()
  const policy = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content')
  expect(policy).toContain("default-src 'none'")
  expect(policy).toContain("script-src 'self'")
  expect(policy).toContain("object-src 'none'")
  expect(policy).toContain("base-uri 'none'")
  expect(policy).toContain("form-action 'none'")
  expect(policy).not.toMatch(/unsafe-inline|unsafe-eval/)
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'strict-origin-when-cross-origin')

  const inlineViolation = await page.evaluate(() => new Promise<{ directive: string; resource: string }>((resolve) => {
    document.addEventListener('securitypolicyviolation', (event) => {
      resolve({ directive: event.effectiveDirective, resource: event.blockedURI })
    }, { once: true })
    const script = document.createElement('script')
    script.textContent = 'document.documentElement.dataset.injectedScriptRan = "yes"'
    document.head.append(script)
  }))
  expect(inlineViolation).toEqual({ directive: 'script-src-elem', resource: 'inline' })
  expect(await page.locator('html').getAttribute('data-injected-script-ran')).toBeNull()

  const externalViolation = await page.evaluate(() => new Promise<{ directive: string; resource: string }>((resolve) => {
    document.addEventListener('securitypolicyviolation', (event) => {
      resolve({ directive: event.effectiveDirective, resource: event.blockedURI })
    }, { once: true })
    const script = document.createElement('script')
    script.src = 'https://example.invalid/unwanted.js'
    document.head.append(script)
  }))
  expect(externalViolation.directive).toBe('script-src-elem')
  expect(new URL(externalViolation.resource).origin).toBe('https://example.invalid')
  expect(pageErrors).toEqual([])
})
