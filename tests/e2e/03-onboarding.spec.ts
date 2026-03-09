import { test, expect } from '@playwright/test'
import { createTestUser, cleanupTestUser, injectSession } from '../helpers/auth'

const TEST_EMAIL = 'test-onboarding@sangam-test.ai'
const TEST_PASSWORD = 'Test1234!'

// Selector that avoids the Next.js dev tools "next" button
const nextBtn = (page: any) =>
  page.getByRole('button', { name: /next →/i })
    .or(page.getByRole('button', { name: 'Next →' }))
    .last()

test.describe('Onboarding wizard', () => {
  test.beforeAll(async () => {
    await cleanupTestUser(TEST_EMAIL)
    await createTestUser(TEST_EMAIL, TEST_PASSWORD)
  })

  test.afterAll(async () => {
    await cleanupTestUser(TEST_EMAIL)
  })

  test('renders wizard step 1 — vision', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/onboarding')
    await expect(page.getByText(/what is your vision/i)).toBeVisible()
    await expect(page.getByText(/step 1 of 4/i)).toBeVisible()
  })

  test('Next button is disabled when textarea is empty', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/onboarding')
    await expect(nextBtn(page)).toBeDisabled()
  })

  test('Next button enables when text is entered', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/onboarding')
    await page.getByRole('textbox').fill('Build the best AI platform in India')
    await expect(nextBtn(page)).toBeEnabled()
  })

  test('Back button is hidden on first step', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/onboarding')
    await expect(page.getByRole('button', { name: /← back/i })).not.toBeVisible()
  })

  test('shows character count', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/onboarding')
    await expect(page.getByText('0/2000')).toBeVisible()
    await page.getByRole('textbox').fill('Hello')
    await expect(page.getByText('5/2000')).toBeVisible()
  })

  test('has navigation escape — logo and back-to-home link', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/onboarding')
    await expect(page.getByText('Back to home')).toBeVisible()
    // Logo should link to home
    const logoLink = page.locator('header a').first()
    await expect(logoLink).toHaveAttribute('href', '/')
  })

  test('progresses through all 4 steps', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/onboarding')

    const steps = [
      { text: /vision/i, value: 'AI-powered SaaS for Indian founders' },
      { text: /building/i, value: 'A multi-agent platform where founders get an AI team' },
      { text: /monetary/i, value: '$10K MRR in 6 months' },
      { text: /timeline/i, value: 'MVP in 4 weeks, beta in 8 weeks' },
    ]

    for (let i = 0; i < steps.length; i++) {
      await expect(page.getByText(steps[i].text).first()).toBeVisible()
      await expect(page.getByText(`Step ${i + 1} of 4`)).toBeVisible()
      await page.getByRole('textbox').fill(steps[i].value)

      if (i < steps.length - 1) {
        await nextBtn(page).click()
        await page.waitForTimeout(300)
      }
    }

    await expect(page.getByRole('button', { name: /launch my team/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /launch my team/i })).toBeEnabled()
  })

  test('back button works to go to previous step', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/onboarding')

    await page.getByRole('textbox').fill('Test vision')
    await nextBtn(page).click()
    await page.waitForTimeout(300)
    await expect(page.getByText(/what are you building/i)).toBeVisible()

    await page.getByRole('button', { name: /← back/i }).click()
    await expect(page.getByText(/what is your vision/i)).toBeVisible()
    await expect(page.getByText('Step 1 of 4')).toBeVisible()
  })

  test('progress bar increases as steps advance', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/onboarding')

    await expect(page.getByText('25%')).toBeVisible()

    await page.getByRole('textbox').fill('Vision text')
    await nextBtn(page).click()
    await page.waitForTimeout(300)

    await expect(page.getByText('50%')).toBeVisible()
  })

  test('completes onboarding via API and redirects to dashboard', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/onboarding')

    const answers = [
      'AI-powered SaaS for Indian founders building products',
      'A multi-agent platform where founders get an AI executive team',
      '$10K MRR in 6 months, profitable in 12 months',
      'MVP in 4 weeks, beta launch in 8 weeks, GA in 3 months',
    ]

    // Intercept the API call to verify it's made correctly
    const apiPromise = page.waitForResponse(resp =>
      resp.url().includes('/api/onboarding') && resp.request().method() === 'POST'
    )

    for (let i = 0; i < answers.length; i++) {
      await page.getByRole('textbox').fill(answers[i])
      if (i < answers.length - 1) {
        await nextBtn(page).click()
        await page.waitForTimeout(300)
      } else {
        await page.getByRole('button', { name: /launch my team/i }).click()
      }
    }

    // Verify the API call succeeds
    const apiResponse = await apiPromise
    expect(apiResponse.status()).toBe(200)
    const apiBody = await apiResponse.json()
    expect(apiBody.success).toBe(true)

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: /command centre|mission control/i }).first()).toBeVisible()
  })

  test('onboarding creates chat channels — visible in chat after completion', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/chat')
    await expect(page.getByRole('button', { name: /CEO Updates/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /Engineering/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Product/i })).toBeVisible()
  })

  test('onboarding creates kanban cards — visible in kanban after completion', async ({ page, context }) => {
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/dashboard/kanban')
    await expect(
      page.getByText(/MVP|architecture|go-to-market/i).first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('already-onboarded user is redirected away from /onboarding', async ({ page, context }) => {
    // User completed onboarding in previous test — should redirect to dashboard
    await injectSession(context, TEST_EMAIL, TEST_PASSWORD)
    await page.goto('/onboarding')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })
})
