import { chromium } from '@playwright/test'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.setViewportSize({ width: 1400, height: 900 })
await page.goto('http://localhost:3000/screenshot-demo', { waitUntil: 'networkidle' })
await new Promise(r => setTimeout(r, 2500))
const el = await page.$('#pixel-world')
await el.screenshot({ path: join(__dirname, '../screenshots/pixel-world-preview.png') })
await browser.close()
console.log('done')
