// Renders Storybook stories in a headless browser and converts each to Paper-friendly HTML.
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { CAPTURE_DIR, RASTER_DIR, STORYBOOK_URL, SVG_DIR } from './paths.mjs'

const converterSource = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'convert-in-page.js'), 'utf8')

// Parts of a story that are drawn, not built from HTML elements: a WebGL map, a video frame with its
// controls, a chart, connector lines, two photos clipped against each other, a preview of a local
// file. The converter cannot rebuild these as layers, so each is photographed on its own (everything
// else hidden, background left transparent) and placed on the board as a picture.
//   frame: the element whose box the picture fills.
//   keep: what stays visible in the picture, when that is not the frame itself.
//   underlay: the picture goes behind the frame's other content, which is still converted to layers.
const RASTERS = [
  { frame: '[data-slot="compare-slider"]', name: 'comparison' },
  // The outer box: the library puts a zero-size box between it and the drawing, which the converter skips.
  { frame: '.recharts-responsive-container', name: 'chart' },
  { frame: 'img[src^="blob:"]', name: 'file preview' },
  // The whole player, not the inner controller: its frame is the black behind a clip of another shape.
  { frame: '[data-slot="video-player"]', name: 'video player' },
  { frame: '.maplibregl-map', name: 'map' },
  { frame: '.react-flow', keep: '.react-flow__edges', name: 'connectors', underlay: true },
]

async function rasterize(page, storyId) {
  let count = 0
  for (const raster of RASTERS) {
    const total = await page.locator(raster.frame).count()
    for (let index = 0; index < total; index += 1) {
      const clip = await page.evaluate(
        ({ raster, index }) => {
          const frame = document.querySelectorAll(raster.frame)[index]
          const box = frame.getBoundingClientRect()
          if (box.width < 1 || box.height < 1) return null
          const kept = raster.keep ? [...frame.querySelectorAll(raster.keep)] : [frame]
          if (!kept.length) return null
          for (const element of kept) element.setAttribute('data-paper-keep', '')
          const style = document.createElement('style')
          style.id = 'paper-isolate'
          // The page's own background is painted even when the page is hidden, so it is cleared as well.
          style.textContent = '*{visibility:hidden!important}html,body{background:transparent!important}[data-paper-keep],[data-paper-keep] *{visibility:visible!important}'
          document.head.append(style)
          return { x: box.left + scrollX, y: box.top + scrollY, width: box.width, height: box.height }
        },
        { raster, index },
      )
      if (!clip) continue
      const picture = await page.screenshot({ clip, fullPage: true, omitBackground: true })
      // Paper remembers a picture by its file name, so the name carries the contents: a changed
      // picture gets a new name and is uploaded again.
      const file = join(RASTER_DIR, `${storyId}-${count}-${createHash('sha1').update(picture).digest('hex').slice(0, 10)}.png`)
      writeFileSync(file, picture)
      await page.evaluate(
        ({ raster, index, file }) => {
          document.getElementById('paper-isolate').remove()
          for (const element of document.querySelectorAll('[data-paper-keep]')) element.removeAttribute('data-paper-keep')
          const frame = document.querySelectorAll(raster.frame)[index]
          let target = frame
          if (raster.underlay) {
            target = document.createElement('div')
            target.style.cssText = 'position:absolute;inset:0;pointer-events:none'
            frame.prepend(target)
          }
          target.setAttribute('data-paper-raster', file)
          target.setAttribute('data-paper-raster-name', raster.name)
        },
        { raster, index, file },
      )
      count += 1
    }
  }
  return count
}

// colorTokens: [{ name: '--color-background', hex: '#0F1113' }], so measured colors map back to token names.
export async function captureStories(storyIds, colorTokens, { concurrency = 4, width = 1280, height = 900 } = {}) {
  mkdirSync(CAPTURE_DIR, { recursive: true })
  mkdirSync(SVG_DIR, { recursive: true })
  mkdirSync(RASTER_DIR, { recursive: true })
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
  const queue = [...storyIds]
  const failed = []

  async function captureOne(storyId) {
    const page = await context.newPage()
    try {
      await page.goto(`${STORYBOOK_URL}/iframe.html?id=${storyId}&viewMode=story`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForSelector('#storybook-root > *', { timeout: 30000 })
      await page.evaluate(() => document.fonts.ready)
      // Let the story's interaction test and any open/close animation finish.
      await page.waitForTimeout(2500)
      await page.evaluate(async () => {
        await Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => {})).concat(new Promise((resolve) => setTimeout(resolve, 50))))
        const images = [...document.images].filter((image) => !image.complete)
        await Promise.race([Promise.all(images.map((image) => new Promise((resolve) => (image.onload = image.onerror = resolve)))), new Promise((resolve) => setTimeout(resolve, 8000))])
      })
      // A focus ring frozen onto a control reads as "selected" on a static board.
      await page.evaluate(() => document.activeElement && document.activeElement !== document.body && document.activeElement.blur())
      await page.mouse.move(0, 0)
      await page.waitForTimeout(300)
      const pictures = await rasterize(page, storyId)
      await page.evaluate(`${converterSource}\n;window.convertStory = convertStory`)
      const result = await page.evaluate(
        (options) => convertStory(options),
        { colorTokens, svgDir: SVG_DIR, rootSelector: '#storybook-root' },
      )
      for (const [name, markup] of Object.entries(result.svgs)) writeFileSync(join(SVG_DIR, `${name}.svg`), markup)
      writeFileSync(join(CAPTURE_DIR, `${storyId}.json`), JSON.stringify({ storyId, pieces: result.pieces, notes: result.notes }, null, 1))
      // The real rendering, kept beside the capture for comparing against the board.
      await page.screenshot({ path: join(CAPTURE_DIR, `${storyId}.png`), fullPage: true })
      console.log(`captured ${storyId}: ${result.pieces.length} piece(s), ${pictures} picture(s), ${result.notes.length} note(s)`)
    } catch (error) {
      failed.push(storyId)
      console.log(`capture FAILED ${storyId}: ${error.message.split('\n')[0]}`)
    } finally {
      await page.close()
    }
  }

  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (queue.length) await captureOne(queue.shift())
    }),
  )
  await browser.close()
  return failed
}
