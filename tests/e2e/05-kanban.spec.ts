import { test, expect } from '@playwright/test'
import { injectSession } from '../helpers/auth'
import { SHARED_EMAIL, SHARED_PASSWORD } from '../helpers/global-setup'

test.describe('Kanban board', () => {
  test('renders all 5 columns', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/kanban')

    // Column headers from KanbanColumn COLUMN_LABELS — exact text so
    // "Review" doesn't also match "Pending Approval" or card text
    for (const column of ['Backlog', 'In Progress', 'Review', 'Pending Approval', 'Done']) {
      await expect(page.getByText(column, { exact: true })).toBeVisible()
    }
  })

  test('displays seeded kanban cards', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/kanban')

    // Seeded titles match the starter cards from /api/onboarding
    await expect(page.getByText(/Define MVP feature scope/i)).toBeVisible({ timeout: 8000 })
    await expect(page.getByText(/Set up project architecture/i)).toBeVisible()
    await expect(page.getByText(/Create go-to-market strategy/i)).toBeVisible()
  })

  test('cards show assigned agent', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/kanban')

    // Cards render the agent chip without the " Agent" suffix
    // (KanbanCardItem: card.assigned_agent.replace(' Agent', ''))
    await expect(page.getByText('Product', { exact: true })).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Engineering', { exact: true })).toBeVisible()
    await expect(page.getByText('Marketing', { exact: true })).toBeVisible()
  })

  test('cards show priority badges', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/kanban')

    await expect(page.getByText('high', { exact: true }).first()).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('medium', { exact: true }).first()).toBeVisible()
  })

  test('card counts match column', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/kanban')

    // Kanban cards are the draggable items on the board.
    // Backlog, In Progress and Review each have 1 seeded card —
    // at minimum, 3 cards should be present in total.
    const cards = page.locator('[draggable="true"]')
    await expect(cards.first()).toBeVisible({ timeout: 8000 })
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('board title is visible', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/kanban')
    await expect(page.getByText(/kanban|task board/i).first()).toBeVisible()
  })
})
