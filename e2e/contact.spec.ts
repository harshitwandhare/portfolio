import { expect, test } from '@playwright/test'

/**
 * The contact form has two paths that matter and one that must never happen.
 *
 * It has to send when the endpoint works, it has to fall back to the visitor's
 * mail client when the endpoint is broken rather than swallowing what they
 * typed, and in neither case may it lose the message.
 */

test.describe('the contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  async function fill(page: import('@playwright/test').Page) {
    await page.getByLabel('name').fill('Ada Lovelace')
    await page.getByLabel('email').fill('ada@example.com')
    await page.getByLabel('message').fill('Saw the rangoli. Lets talk.')
  }

  test('sends and clears once the endpoint accepts it', async ({ page }) => {
    const posted = page.waitForRequest(
      (request) => request.url().includes('/api/contact') && request.method() === 'POST',
    )
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 200, json: { ok: true } }),
    )

    await fill(page)
    await page.getByRole('button', { name: 'send' }).click()

    expect((await posted).postDataJSON()).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    })
    await expect(page.getByText(/^sent\./)).toBeVisible()
    await expect(page.getByLabel('message')).toHaveValue('')
  })

  test('says what is wrong when the endpoint refuses it', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 429, json: { error: 'That is a few too many messages.' } }),
    )

    await fill(page)
    await page.getByRole('button', { name: 'send' }).click()

    await expect(page.getByText('That is a few too many messages.')).toBeVisible()
    // The text stays put, so the visitor can wait and send the same thing again.
    await expect(page.getByLabel('message')).toHaveValue('Saw the rangoli. Lets talk.')
  })

  test('falls back to the mail client when the endpoint is down', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({ status: 503, json: {} }))

    await fill(page)
    await page.getByRole('button', { name: 'send' }).click()

    await expect(page.getByText(/opened in your mail app/)).toBeVisible()
  })
})
