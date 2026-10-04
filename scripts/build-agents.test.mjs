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
