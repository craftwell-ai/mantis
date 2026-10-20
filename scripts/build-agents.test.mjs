import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { renderAgents, AGENTS_PATH, CONSUMER_AGENTS_PATH } from './build-agents.mjs'
import { readComponentApi } from './component-api.mjs'
import { tokens } from '../tokens/mantis.tokens.mjs'

const api = readComponentApi()
const rendered = renderAgents({ api })

test('committed AGENTS.md matches the generator (run node scripts/build-agents.mjs)', () => {
  assert.equal(readFileSync(AGENTS_PATH, 'utf8'), rendered)
})

test('every primitive in components/ui is indexed with its real exports', () => {
  const files = readdirSync(new URL('../components/ui', import.meta.url)).filter((f) => f.endsWith('.tsx') && !f.includes('.generated'))
  for (const file of files) {
    const name = file.replace(/\.tsx$/, '')
    assert.ok(rendered.includes(`- **${name}** `), `AGENTS.md is missing ${name}`)
  }
  assert.match(rendered, /Button\(variant=default\|brand\|/, 'button variants are read from the component, default first')
})

test('every color utility in the token module is listed', () => {
  // A -foreground key is covered by its fill, listed under "Fill + text pairs".
  for (const key of Object.keys(tokens.shadcn)) {
    const listed = key.replace(/-foreground$/, '')
    assert.ok(rendered.includes(`\`${listed}\``), `AGENTS.md is missing token ${key}`)
  }
})

test('stays a compact index, not a manual', () => {
  // The point is an always-loaded index (~6.5k tokens at this cap). Raised from
  // 20KB to 24KB on 2026-10-02 to fit the Phase 5 pattern library, and to 26KB
  // later on 2026-10-02 for the owner-approved MediaTile and Pagination
  // primitives. Tightening the generator first (Button value lists referenced
  // once, saving ~0.5KB; ReactNode printed as written instead of its expanded
  // union) still left the index at ~24.6KB. Move detail to public/usage/*.md
  // instead of raising it again.
  assert.ok(Buffer.byteLength(rendered) < 26_000, `AGENTS.md is ${Buffer.byteLength(rendered)} bytes`)
})

test('MANTIS.md (shipped to apps) is in sync and only points at things an app has', () => {
  const shipped = renderAgents({ api, consumer: true })
  assert.equal(readFileSync(CONSUMER_AGENTS_PATH, 'utf8'), shipped, 'registry/MANTIS.md is stale — run node scripts/build-agents.mjs')
  // These exist only in the Mantis repo; an installed app would chase dead paths.
  for (const repoOnly of ['scripts/', 'registry/<name>', 'public/usage', '.mcp.json', 'mantis-build', 'npm run storybook']) {
    assert.ok(!shipped.includes(repoOnly), `MANTIS.md mentions repo-only ${repoOnly}`)
  }
})

test('a compound component lists its parts once, after its root name', () => {
  const line = rendered.split('\n').find((l) => l.startsWith('- **dropdown-menu**'))
  assert.match(line, /\*\* DropdownMenu, …CheckboxItem, …Content,/)
})

test('every · separator has a space on both sides', () => {
  assert.deepEqual(rendered.match(/\S·|·\S/g) ?? [], [])
})

test('the size line tells app code to merge classes with mantis-cn, which knows the size names', () => {
  const line = rendered.split('\n').find((l) => l.startsWith('- **Sizes**'))
  assert.match(line, /`cn` from `@\/lib\/mantis-cn`/)
})

test('the token section names the opacity, layer, width and motion tokens', () => {
  const line = rendered.split('\n').find((l) => l.startsWith('- **Opacity, layers, widths:**'))
  assert.ok(line, 'no opacity, layers and widths line')
  // 1.9.0: the widths are listed by prefix (`max-w-` … `xs`…`7xl`) instead of naming max-w-md
  for (const name of ['opacity-disabled', 'z-floating', 'z-raised', '`max-w-`', '`xs`…`7xl`']) assert.ok(line.includes(name), name)
  const motion = rendered.split('\n').find((l) => l.startsWith('- **Motion:**'))
  assert.match(motion, /`duration-normal`/)
  assert.match(motion, /`ease-swift`/)
  // the arbitrary-variable form is gone now that the names are utilities
  assert.ok(!rendered.includes('duration-(--duration-'), 'AGENTS.md still writes duration-(--duration-…)')
})

test('the opacity line lists every transparency step and panel width from the tokens', () => {
  const line = rendered.split('\n').find((l) => l.startsWith('- **Opacity, layers, widths:**'))
  for (const step of Object.keys(tokens.alpha)) assert.ok(line.includes(`/${step}`), `/${step}`)
  for (const name of Object.keys(tokens.width)) assert.ok(line.includes(`\`${name}\``), name)
  assert.match(line, /`sm:`…`2xl:`/)
})
