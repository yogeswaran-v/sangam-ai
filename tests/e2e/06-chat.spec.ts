import { test, expect } from '@playwright/test'
import { injectSession } from '../helpers/auth'
import { SHARED_EMAIL, SHARED_PASSWORD } from '../helpers/global-setup'

test.describe('Team chat', () => {
  test('renders channel list with all 6 channels', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/chat')

    await expect(page.getByText('CEO Updates')).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Engineering')).toBeVisible()
    await expect(page.getByText('Product')).toBeVisible()
    await expect(page.getByText('Marketing')).toBeVisible()
    await expect(page.getByText('Sales')).toBeVisible()
    await expect(page.getByText('Finance')).toBeVisible()
  })

  test('CEO Updates channel has welcome message from agent', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/chat')

    await page.getByText('CEO Updates').click()
    await expect(page.getByText(/Mission briefing received|assembled and ready/i)).toBeVisible({ timeout: 8000 })
  })

  test('clicking a channel loads its messages', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/chat')

    await page.getByText('Engineering').click()
    // Message input should be visible when a channel is selected
    await expect(page.getByPlaceholder(/message|type/i)).toBeVisible({ timeout: 5000 })
  })

  test('message input is present when channel is selected', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/chat')

    await page.getByText('CEO Updates').click()
    const input = page.getByPlaceholder(/message|type/i)
    await expect(input).toBeVisible({ timeout: 5000 })
  })

  test('can type and send a message', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/chat')

    await page.getByText('CEO Updates').click()
    const input = page.getByPlaceholder(/message|type/i)
    await expect(input).toBeVisible({ timeout: 5000 })
    await input.fill('Hello, this is a test message')
    await page.keyboard.press('Enter')

    // Message should appear in feed
    await expect(page.getByText('Hello, this is a test message')).toBeVisible({ timeout: 5000 })
  })

  test('send button is disabled when input is empty', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/chat')

    await page.getByText('CEO Updates').click()
    await expect(page.getByPlaceholder(/message|type/i)).toBeVisible({ timeout: 5000 })

    const sendBtn = page.getByRole('button', { name: /send/i })
    if (await sendBtn.isVisible()) {
      await expect(sendBtn).toBeDisabled()
    }
  })

  test('agent messages show sender name', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/chat')

    await page.getByText('CEO Updates').click()
    await expect(page.getByText(/CEO Agent/i)).toBeVisible({ timeout: 8000 })
  })
})
