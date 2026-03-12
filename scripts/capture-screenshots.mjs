/**
 * Capture screenshots + GIF of Sangam.ai for LinkedIn post.
 * Run: node scripts/capture-screenshots.mjs
 *
 * Requires: dev server running on localhost:3000
 */

import { chromium } from '@playwright/test'
import { execSync } from 'child_process'
import { mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT  = join(ROOT, 'screenshots')

mkdirSync(OUT, { recursive: true })

const DEMO_URL   = 'http://localhost:3000/screenshot-demo'
const LANDING_URL = 'http://localhost:3000'

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function run() {
  console.log('Launching browser...')
  const browser = await chromium.launch({ headless: true })

  /* ── 1. Landing page hero ── */
  console.log('📸  Landing page hero...')
  {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' })
    await sleep(3000) // let Spline robot load
    await page.screenshot({
      path: join(OUT, '1-landing-hero.png'),
      clip: { x: 0, y: 0, width: 1400, height: 900 },
    })
    console.log('  ✓ 1-landing-hero.png')
    await page.close()
  }

  /* ── 2. Dashboard ── */
  console.log('📸  Dashboard...')
  {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto(DEMO_URL, { waitUntil: 'networkidle' })
    await sleep(800)
    const el = await page.$('#section-dashboard')
    await el.screenshot({ path: join(OUT, '2-dashboard.png') })
    console.log('  ✓ 2-dashboard.png')
    await page.close()
  }

  /* ── 3. Chat ── */
  console.log('📸  Chat interface...')
  {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto(DEMO_URL, { waitUntil: 'networkidle' })
    await sleep(800)
    const el = await page.$('#section-chat')
    await el.screenshot({ path: join(OUT, '3-chat.png') })
    console.log('  ✓ 3-chat.png')
    await page.close()
  }

  /* ── 4. Approvals ── */
  console.log('📸  Approvals...')
  {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto(DEMO_URL, { waitUntil: 'networkidle' })
    await sleep(800)
    const el = await page.$('#section-approvals')
    await el.screenshot({ path: join(OUT, '4-approvals.png') })
    console.log('  ✓ 4-approvals.png')
    await page.close()
  }

  /* ── 5. Pixel World — frame sequence for GIF ── */
  console.log('🎬  Capturing Pixel World frames...')
  {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto(DEMO_URL, { waitUntil: 'networkidle' })
    await sleep(1200) // let agents initialise

    const el = await page.$('#pixel-world')
    const frameDir = join(OUT, 'frames')
    mkdirSync(frameDir, { recursive: true })

    const FRAMES   = 36  // ~6 seconds @ ~6fps
    const INTERVAL = 180 // ms between frames

    for (let i = 0; i < FRAMES; i++) {
      await el.screenshot({ path: join(frameDir, `frame-${String(i).padStart(3, '0')}.png`) })
      await sleep(INTERVAL)
    }

    console.log(`  ✓ ${FRAMES} frames captured`)
    await page.close()
  }

  await browser.close()

  /* ── 6. Stitch GIF with ffmpeg ── */
  console.log('🎞️  Stitching GIF with ffmpeg...')
  const frameDir = join(OUT, 'frames')
  const gifPath  = join(OUT, '0-pixel-world.gif')

  // Check for ffmpeg
  let ffmpegPath = 'ffmpeg'
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' })
  } catch {
    // Try common Windows install path from winget
    const wingetPath = 'C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe'
    if (existsSync(wingetPath)) {
      ffmpegPath = wingetPath
    } else {
      // Try PATH from Program Files
      const paths = [
        'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
        'C:\\ffmpeg\\bin\\ffmpeg.exe',
      ]
      for (const p of paths) {
        if (existsSync(p)) { ffmpegPath = p; break }
      }
    }
  }

  const ffmpegCmd = [
    `"${ffmpegPath}"`,
    '-y',
    `-framerate 6`,
    `-i "${join(frameDir, 'frame-%03d.png')}"`,
    `-vf "fps=6,scale=900:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer"`,
    `"${gifPath}"`,
  ].join(' ')

  try {
    execSync(ffmpegCmd, { stdio: 'inherit' })
    console.log(`  ✓ GIF saved: ${gifPath}`)
  } catch (e) {
    console.log('  ⚠ ffmpeg not found in PATH. Frames saved to screenshots/frames/')
    console.log('    Convert manually at: https://ezgif.com/maker')
    console.log('    Or install ffmpeg: winget install Gyan.FFmpeg')
  }

  console.log('\n✅  Done! Files in ./screenshots/')
  console.log('   0-pixel-world.gif  ← Hero asset for LinkedIn')
  console.log('   1-landing-hero.png')
  console.log('   2-dashboard.png')
  console.log('   3-chat.png')
  console.log('   4-approvals.png')
}

run().catch(e => { console.error(e); process.exit(1) })
