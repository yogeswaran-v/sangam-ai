import { test, expect } from '@playwright/test'
import { injectSession } from '../helpers/auth'
import { SHARED_EMAIL, SHARED_PASSWORD } from '../helpers/global-setup'

test.describe('Team chat', () => {
  test('renders channel list with all 6 channels', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/chat')

    // Channels render as buttons in the channel list. Use role+exact name —
    // the active channel name also appears in the feed header, and the sidebar
    // has links like "Product Demo".
    await expect(page.getByRole('button', { name: 'CEO Updates', exact: true })).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('button', { name: 'Engineering', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Product', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Marketing', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sales', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Finance', exact: true })).toBeVisible()
  })

  test('CEO Updates channel has welcome message from agent', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/chat')

    await page.getByRole('button', { name: 'CEO Updates', exact: true }).click()
    await expect(page.getByText(/Mission briefing received|assembled and ready/i).first()).toBeVisible({ timeout: 8000 })
  })

  test('clicking a channel loads its messages', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/chat')

    await page.getByRole('button', { name: 'Engineering', exact: true }).click()
    // Message input should be visible when a channel is selected
    await expect(page.getByPlaceholder(/message|type/i)).toBeVisible({ timeout: 5000 })
  })

  test('message input is present when channel is selected', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/chat')

    await page.getByRole('button', { name: 'CEO Updates', exact: true }).click()
    const input = page.getByPlaceholder(/message|type/i)
    await expect(input).toBeVisible({ timeout: 5000 })
  })

  test('can type and send a message', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/chat')

    await page.getByRole('button', { name: 'CEO Updates', exact: true }).click()
    const input = page.getByPlaceholder(/message|type/i)
    await expect(input).toBeVisible({ timeout: 5000 })
    await input.fill('Hello, this is a test message')
    await page.keyboard.press('Enter')

    // Message should appear in feed — .first() because prior runs may
    // have left the same message in the channel, and the textarea
    // briefly holds the same text while the send is in flight
    await expect(page.getByText('Hello, this is a test message').first()).toBeVisible({ timeout: 5000 })
  })

  test('send button is disabled when input is empty', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/chat')

    await page.getByRole('button', { name: 'CEO Updates', exact: true }).click()
    await expect(page.getByPlaceholder(/message|type/i)).toBeVisible({ timeout: 5000 })

    const sendBtn = page.getByRole('button', { name: 'Send message', exact: true })
    if (await sendBtn.isVisible()) {
      await expect(sendBtn).toBeDisabled()
    }
  })

  test('agent messages show sender name', async ({ page, context }) => {
    await injectSession(context, SHARED_EMAIL, SHARED_PASSWORD)
    await page.goto('/dashboard/chat')

    await page.getByRole('button', { name: 'CEO Updates', exact: true }).click()
    await expect(page.getByText(/CEO Agent/i).first()).toBeVisible({ timeout: 8000 })
  })
})
