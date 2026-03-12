/**
 * Capture screenshots + GIFs of Sangam.ai for LinkedIn post.
 * Run: node scripts/capture-screenshots.mjs
 *
 * Requires: dev server running on localhost:3000
 * Output:
 *   0-landing-robot.gif   ← Landing page with Spline 3D robot (animated)
 *   1-pixel-world.gif     ← Pixel world with agents moving (animated)
 *   2-dashboard.png       ← Dashboard stats (1400×900)
 *   3-chat.png            ← Multi-agent chat (1400×900)
 *   4-approvals.png       ← Approval queue (1400×900)
 */

import { chromium } from '@playwright/test'
import { execSync } from 'child_process'
import { mkdirSync, existsSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT  = join(ROOT, 'screenshots')

mkdirSync(OUT, { recursive: true })

const DEMO_URL    = 'http://localhost:3000/screenshot-demo'
const LANDING_URL = 'http://localhost:3000'
const W = 1400, H = 900

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// Detect ffmpeg path (winget installs to AppData/Local)
function findFfmpeg() {
  const candidates = [
    'ffmpeg',
    'C:\\Users\\vyogi\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe',
    'C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe',
    'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
    'C:\\ffmpeg\\bin\\ffmpeg.exe',
  ]
  for (const p of candidates) {
    try { execSync(`"${p}" -version`, { stdio: 'ignore' }); return p } catch {}
  }
  return null
}

function makeGif(ffmpegPath, frameDir, outPath, fps = 8, scale = `${W}:${H}`) {
  // Two-pass palette for high quality
  const palettePath = join(frameDir, 'palette.png')
  execSync([
    `"${ffmpegPath}" -y`,
    `-framerate ${fps}`,
    `-i "${join(frameDir, 'frame-%03d.png')}"`,
    `-vf "fps=${fps},scale=${scale}:flags=lanczos,palettegen=max_colors=192"`,
    `"${palettePath}"`,
  ].join(' '), { stdio: 'pipe' })

  execSync([
    `"${ffmpegPath}" -y`,
    `-framerate ${fps}`,
    `-i "${join(frameDir, 'frame-%03d.png')}"`,
    `-i "${palettePath}"`,
    `-lavfi "fps=${fps},scale=${scale}:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3"`,
    `"${outPath}"`,
  ].join(' '), { stdio: 'pipe' })
}

async function captureFrames(page, el, frameDir, count, interval) {
  mkdirSync(frameDir, { recursive: true })
  for (let i = 0; i < count; i++) {
    if (el) {
      await el.screenshot({ path: join(frameDir, `frame-${String(i).padStart(3, '0')}.png`) })
    } else {
      await page.screenshot({
        path: join(frameDir, `frame-${String(i).padStart(3, '0')}.png`),
        clip: { x: 0, y: 0, width: W, height: H },
      })
    }
    await sleep(interval)
  }
  console.log(`  ✓ ${count} frames @ ${(1000/interval).toFixed(0)}fps`)
}

async function sectionShot(page, selector, outPath) {
  const el = await page.$(selector)
  await el.scrollIntoViewIfNeeded()
  await sleep(400)
  const box = await el.boundingBox()
  await page.screenshot({
    path: outPath,
    clip: { x: 0, y: box.y, width: W, height: H },
  })
  console.log(`  ✓ ${outPath.split(/[\\/]/).pop()}`)
}

async function run() {
  const ffmpeg = findFfmpeg()
  if (!ffmpeg) {
    console.warn('⚠  ffmpeg not found — GIFs will be skipped. Install: winget install Gyan.FFmpeg')
  } else {
    console.log(`✓  ffmpeg: ${ffmpeg}`)
  }

  console.log('Launching browser...')
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-webgl',
      '--use-gl=swiftshader',       // software WebGL for headless — renders Spline
      '--enable-accelerated-2d-canvas',
      '--no-sandbox',
    ],
  })

  /* ══════════════════════════════════════════
     0. Landing page robot GIF — with natural mouse movement
     ══════════════════════════════════════════ */
  console.log('\n🎬  Landing page — Spline robot GIF (with mouse interaction)...')
  const robotFrameDir = join(OUT, 'frames-robot')
  if (existsSync(robotFrameDir)) rmSync(robotFrameDir, { recursive: true })
  mkdirSync(robotFrameDir, { recursive: true })
  {
    const page = await browser.newPage()
    await page.setViewportSize({ width: W, height: H })
    await page.goto(LANDING_URL, { waitUntil: 'networkidle' })
    console.log('  ⏳ Waiting for Spline scene to load (8s)...')
    await sleep(8000)

    // Move mouse to centre of robot area first so robot orients itself
    await page.mouse.move(1060, 420, { steps: 20 })
    await sleep(1000)

    // Natural mouse path: slow figure-8 around the robot
    // The robot reacts to cursor position — smooth movement = natural robot pose changes
    const FPS = 5      // 5 fps — smooth without being choppy
    const FRAMES = 60  // 12 seconds of GIF
    const MS_PER_FRAME = 1000 / FPS  // 200ms between frames

    // Pre-compute mouse waypoints along a gentle figure-8 centred on the robot
    // Robot sits roughly at x=1060, y=380 in the 1400×900 viewport
    const cx = 1060, cy = 380
    const rx = 160, ry = 110  // ellipse radii

    for (let i = 0; i < FRAMES; i++) {
      // Figure-8: x uses sin, y uses sin(2t) — creates natural looping motion
      const t = (i / FRAMES) * Math.PI * 2
      const tx = cx + Math.sin(t) * rx
      const ty = cy + Math.sin(t * 2) * ry * 0.5 + Math.cos(t) * ry * 0.5

      // Move with steps so the browser fires intermediate mousemove events
      await page.mouse.move(tx, ty, { steps: 8 })
      await sleep(40) // let robot react
      await page.screenshot({
        path: join(robotFrameDir, `frame-${String(i).padStart(3, '0')}.png`),
        clip: { x: 0, y: 0, width: W, height: H },
      })
      await sleep(MS_PER_FRAME - 40)
    }
    console.log(`  ✓ ${FRAMES} frames @ ${FPS}fps`)
    await page.close()
  }

  /* ══════════════════════════════════════════
     1. Pixel World GIF
     ══════════════════════════════════════════ */
  console.log('\n🎬  Pixel World — agents GIF...')
  const pixelFrameDir = join(OUT, 'frames-pixel')
  if (existsSync(pixelFrameDir)) rmSync(pixelFrameDir, { recursive: true })
  {
    const page = await browser.newPage()
    await page.setViewportSize({ width: W, height: H })
    await page.goto(DEMO_URL, { waitUntil: 'networkidle' })
    // Wait for agents to settle at their initial positions before recording
    console.log('  ⏳ Letting agents settle (4s)...')
    await sleep(4000)

    // Scroll so pixel world is flush at top
    await page.evaluate(() => {
      const el = document.querySelector('#pixel-world')
      if (el) el.scrollIntoView({ behavior: 'instant' })
      window.scrollBy(0, -8)
    })
    await sleep(400)

    // 5fps, 200ms interval, 60 frames = 12 seconds
    // Slow enough to show smooth CSS transitions without looking frantic
    const el = await page.$('#pixel-world')
    await captureFrames(page, el, pixelFrameDir, 60, 200)
    await page.close()
  }

  /* ══════════════════════════════════════════
     2. Dashboard screenshot
     ══════════════════════════════════════════ */
  console.log('\n📸  Screenshots...')
  {
    const page = await browser.newPage()
    await page.setViewportSize({ width: W, height: H })
    await page.goto(DEMO_URL, { waitUntil: 'networkidle' })
    await sleep(800)
    await sectionShot(page, '#section-dashboard', join(OUT, '2-dashboard.png'))
    await sectionShot(page, '#section-chat',      join(OUT, '3-chat.png'))
    await sectionShot(page, '#section-approvals', join(OUT, '4-approvals.png'))
    await page.close()
  }

  await browser.close()

  /* ══════════════════════════════════════════
     Stitch GIFs
     ══════════════════════════════════════════ */
  if (ffmpeg) {
    console.log('\n🎞️  Stitching GIFs...')

    try {
      makeGif(ffmpeg, robotFrameDir, join(OUT, '0-landing-robot.gif'), 5, `${W}:${H}`)
      console.log('  ✓ 0-landing-robot.gif')
    } catch (e) {
      console.error('  ✗ Robot GIF failed:', e.message)
    }

    try {
      makeGif(ffmpeg, pixelFrameDir, join(OUT, '1-pixel-world.gif'), 5, `${W}:-2`)
      console.log('  ✓ 1-pixel-world.gif')
    } catch (e) {
      console.error('  ✗ Pixel world GIF failed:', e.message)
    }
  } else {
    console.log('\n⚠  Skipped GIF stitching (ffmpeg not found)')
    console.log('    Frames saved in screenshots/frames-robot/ and screenshots/frames-pixel/')
    console.log('    Convert at: https://ezgif.com/maker')
  }

  console.log('\n✅  Done! Files in ./screenshots/')
  console.log('   0-landing-robot.gif  ← Spline robot (animated)')
  console.log('   1-pixel-world.gif    ← Agent pixel world (animated)')
  console.log('   2-dashboard.png')
  console.log('   3-chat.png')
  console.log('   4-approvals.png')
}

run().catch(e => { console.error(e); process.exit(1) })
