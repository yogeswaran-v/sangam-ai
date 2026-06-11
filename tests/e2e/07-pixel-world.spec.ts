import { test, expect } from '@playwright/test'
import { injectSession } from '../helpers/auth'
import { SHARED_EMAIL, SHARED_PASSWORD } from '../helpers/global-setup'

/**
 * Pixel world — the office canvas is desktop-only (hidden below the md
 * breakpoint, with a mobile fallback block that is hidden on desktop).
 * The default Desktop Chrome viewport (1280px) renders the full office.
 */
test.describe('Pixel world', () => {
  test('renders pixel world office canvas', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/pixel-world')

    await expect(page.getByRole('heading', { name: 'Pixel World' })).toBeVisible()
    // Version tag inside the office canvas ("Sangam HQ · v0.2")
    await expect(page.getByText(/Sangam HQ/)).toBeVisible({ timeout: 8000 })
  })

  test('shows all 6 agent sprites', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/pixel-world')

    // Sprite name labels (AGENT_DEFAULTS): CEO, Product, Engineer, Marketing, Sales, Finance.
    // Desk and zone labels reuse some of these names, so take the first match.
    for (const name of ['CEO', 'Product', 'Engineer', 'Marketing', 'Sales', 'Finance']) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible({ timeout: 8000 })
    }
  })

  test('shows department zone labels', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/pixel-world')

    // ZoneArea labels: Leadership, Product, Engineering, Marketing, Conference, Sales, Finance
    await expect(page.getByText('Leadership', { exact: true }).first()).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Engineering', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Conference', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Marketing', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Sales', { exact: true }).first()).toBeVisible()
  })

  test('shows HQ conference table', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/pixel-world')
    // The conference table renders an "HQ" label (SVG text)
    await expect(page.getByText('HQ', { exact: true })).toBeVisible({ timeout: 8000 })
  })

  test('shows legend with idle/working states', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/pixel-world')

    // Legend only contains "Idle" and "Working" in the current UI
    await expect(page.getByText('Idle', { exact: true })).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Working', { exact: true })).toBeVisible()
  })

  test('shows activity feed panel', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/pixel-world')

    // ActivityFeed header + footer (scoped to actual panel text so we never
    // resolve to the hidden mobile fallback block)
    await expect(page.getByText('Live Activity')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Updates every 60s via orchestrator/)).toBeVisible()
    // Empty state or event entries — either is valid depending on seeded events
    await expect(
      page.getByText('No activity yet').or(page.getByText(/Waiting for agents/)).first()
    ).toBeVisible()
  })

  test('shows version label', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/pixel-world')
    await expect(page.getByText(/Sangam HQ · v0\.2/)).toBeVisible({ timeout: 8000 })
  })
})
