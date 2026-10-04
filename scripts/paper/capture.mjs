// Renders Storybook stories in a headless browser and converts each to Paper-friendly HTML.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { CAPTURE_DIR, STORYBOOK_URL, SVG_DIR } from './paths.mjs'

const converterSource = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'convert-in-page.js'), 'utf8')

// colorTokens: [{ name: '--color-background', hex: '#0F1113' }], so measured colors map back to token names.
export async function captureStories(storyIds, colorTokens, { concurrency = 4, width = 1280, height = 900 } = {}) {
  mkdirSync(CAPTURE_DIR, { recursive: true })
  mkdirSync(SVG_DIR, { recursive: true })
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
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
      await page.evaluate(`${converterSource}\n;window.convertStory = convertStory`)
      const result = await page.evaluate(
        (options) => convertStory(options),
        { colorTokens, svgDir: SVG_DIR, rootSelector: '#storybook-root' },
      )
      for (const [name, markup] of Object.entries(result.svgs)) writeFileSync(join(SVG_DIR, `${name}.svg`), markup)
      writeFileSync(join(CAPTURE_DIR, `${storyId}.json`), JSON.stringify({ storyId, pieces: result.pieces, notes: result.notes }, null, 1))
      // The real rendering, kept beside the capture for comparing against the board.
      await page.screenshot({ path: join(CAPTURE_DIR, `${storyId}.png`), fullPage: true })
      console.log(`captured ${storyId}: ${result.pieces.length} piece(s), ${result.notes.length} note(s)`)
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
