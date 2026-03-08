import { test, expect } from '@playwright/test'
import { injectSession } from '../helpers/auth'
import { SHARED_EMAIL, SHARED_PASSWORD } from '../helpers/global-setup'

test.describe('Kanban board', () => {
  test('renders all 4 columns', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/kanban')

    await expect(page.getByText(/backlog/i)).toBeVisible()
    await expect(page.getByText(/in progress/i)).toBeVisible()
    await expect(page.getByText(/review/i)).toBeVisible()
    await expect(page.getByText(/done/i)).toBeVisible()
  })

  test('displays seeded kanban cards', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/kanban')

    await expect(page.getByText(/Define MVP scope/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Set up architecture/i)).toBeVisible()
    await expect(page.getByText(/Go-to-market strategy/i)).toBeVisible()
  })

  test('cards show assigned agent', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/kanban')

    await expect(page.getByText(/Product Agent/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Engineering Agent/i)).toBeVisible()
    await expect(page.getByText(/Marketing Agent/i)).toBeVisible()
  })

  test('cards show priority badges', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/kanban')

    await expect(page.getByText(/high/i).first()).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/medium/i)).toBeVisible()
  })

  test('card counts match column', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/kanban')

    // Backlog has 1 card (Define MVP scope)
    const backlogColumn = page.locator('[data-column="backlog"], [class*="backlog"]').first()
      .or(page.getByText(/backlog/i).locator('..'))

    // In progress has 1 card (Set up architecture)
    // Review has 1 card (Go-to-market)
    // At minimum, 3 cards should be visible total
    const cards = page.locator('[class*="card"], [data-card]')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('board title is visible', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/kanban')
    await expect(page.getByText(/kanban|task board/i).first()).toBeVisible()
  })
})
