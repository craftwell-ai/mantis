// Measures every element of every story in a built Storybook, so a refactor that should change
// nothing visible can prove it. Layout boxes (computed width and height, offset position) do not show everything:
// transforms and animations such as the skeleton shimmer move pixels without moving layout.
// Each element also records the computed values in STYLE_PROPS (opacity, layer, timing, widths,
// line height, radius), which change what you see without moving a box.
// Usage:
//   node scripts/story-geometry.mjs capture <storybook-static-dir> <out.json>
//   node scripts/story-geometry.mjs capture-url <page-url> <out.json>   (one page, such as the home page)
//   node scripts/story-geometry.mjs compare <before.json> <after.json> [<before-again.json>]
// A third file is a second "before" capture: anything that differs between the two before runs
// is noise (maps, video, timers) and is reported but not counted.
// Only what a story renders is measured: a closed menu's rows count only if the story's play
// function opens it, so pair this with a compile-level check for anything that renders on demand.
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const STYLE_PROPS = ['opacity', 'z-index', 'transition-duration', 'transition-timing-function', 'max-width', 'min-width', 'line-height', 'font-size', 'border-top-left-radius']
export const styleLine = (cs, props) => props.map((p) => cs.getPropertyValue(p)).join('|')

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mp4': 'video/mp4' }

function serve(dir) {
  const server = createServer((req, res) => {
    const path = join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname))
    const file = existsSync(path) && statSync(path).isDirectory() ? join(path, 'index.html') : path
    if (!resolve(file).startsWith(resolve(dir)) || !existsSync(file)) { res.writeHead(404); return res.end() }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
    res.end(readFileSync(file))
  })
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)))
}

// Runs inside the page, so everything it uses comes in as arguments.
function measure(props, line) {
  const out = []
  const walk = (el, path) => {
    for (const [i, child] of [...el.children].entries()) {
      if (['SCRIPT', 'STYLE', 'LINK', 'META'].includes(child.tagName)) continue
      const key = `${path}/${child.tagName.toLowerCase()}${child.dataset.slot ? `[${child.dataset.slot}]` : ''}:${i}`
      const cs = getComputedStyle(child)
      if (cs.display !== 'none') out.push(`${key} ${cs.width} ${cs.height} ${child.offsetLeft ?? ''},${child.offsetTop ?? ''} ${line(cs, props)}`)
      walk(child, key)
    }
  }
  walk(document.body, '')
  return out
}

const MEASURE = `(${measure})(${JSON.stringify(STYLE_PROPS)}, ${styleLine})`
const launch = async () => (await import('playwright')).chromium.launch()

async function settle(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
  return page.evaluate(MEASURE)
}

async function captureUrl(url, outFile) {
  const browser = await launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const result = { [url]: await settle(page, url) }
  await browser.close()
  writeFileSync(outFile, JSON.stringify(result))
  console.log(`measured ${url} → ${outFile}`)
}

async function capture(dir, outFile) {
  const index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8'))
  const ids = Object.values(index.entries).filter((e) => e.type === 'story').map((e) => e.id).sort()
  const server = await serve(dir)
  const base = `http://127.0.0.1:${server.address().port}`
  const browser = await launch()
  const result = {}
  const queue = [...ids]
  const worker = async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
    while (queue.length) {
      const id = queue.shift()
      try {
        result[id] = await settle(page, `${base}/iframe.html?id=${id}&viewMode=story`)
      } catch (cause) {
        result[id] = [`error ${cause.message.split('\n')[0]}`]
      }
    }
    await page.close()
  }
  await Promise.all([worker(), worker(), worker(), worker()])
  await browser.close()
  server.close()
  writeFileSync(outFile, JSON.stringify(result))
  console.log(`measured ${ids.length} stories → ${outFile}`)
}

function compare(beforeFile, afterFile, againFile) {
  const before = JSON.parse(readFileSync(beforeFile, 'utf8'))
  const after = JSON.parse(readFileSync(afterFile, 'utf8'))
  const again = againFile ? JSON.parse(readFileSync(againFile, 'utf8')) : null
  let changed = 0
  let noisy = 0
  for (const id of Object.keys(before).sort()) {
    const a = before[id].join('\n')
    const b = (after[id] ?? ['missing']).join('\n')
    if (a === b) continue
    if (again && again[id]?.join('\n') !== a) { noisy++; console.log(`noise   ${id} (differs between the two before runs)`); continue }
    changed++
    const lines = new Set(before[id])
    console.log(`CHANGED ${id}`)
    for (const line of (after[id] ?? []).filter((l) => !lines.has(l)).slice(0, 5)) console.log(`   after: ${line}`)
  }
  for (const id of Object.keys(after)) if (!(id in before)) console.log(`new     ${id}`)
  console.log(`${Object.keys(before).length} stories, ${changed} changed, ${noisy} noisy`)
  return changed
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [mode, a, b, c] = process.argv.slice(2)
  if (mode === 'capture') await capture(a, b)
  else if (mode === 'capture-url') await captureUrl(a, b)
  else if (mode === 'compare') process.exitCode = compare(a, b, c) ? 1 : 0
  else console.log('usage: story-geometry.mjs capture <dir> <out.json> | capture-url <url> <out.json> | compare <before.json> <after.json> [<before-again.json>]')
}
