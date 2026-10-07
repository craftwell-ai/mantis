/**
 * Writes public/usage/<name>.md — one page per usage guide — from
 * usage/*.usage.mjs, plus the same guide as data: public/usage/<name>.json
 * and public/usage/index.json, the list of every guide. Tools read the JSON,
 * which keeps the rule ids and `visual` flags the page drops. The guide
 * module is the single source;
 * scripts/build-usage.test.mjs fails when a committed page is stale. Run
 * `node scripts/build-usage.mjs` after touching any usage guide.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { ALL_USAGE } from '../usage/index.mjs'
import { renderUsageDocs } from '../usage/render.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
export const USAGE_DIR = join(root, 'public/usage')

export function renderUsagePage(u) {
  return `# ${u.name} (${u.kind})\n\n${renderUsageDocs(u)}\n`
}

export function renderUsageJson(u) {
  return JSON.stringify(u, null, 2) + '\n'
}

// A site cannot be listed like a folder, so this is how a tool finds every guide.
export function renderUsageIndex(all = ALL_USAGE) {
  return JSON.stringify({ schemaVersion: 1, guides: all.map((u) => ({ name: u.name, kind: u.kind, summary: u.summary })) }, null, 2) + '\n'
}

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(USAGE_DIR, { recursive: true })
  for (const u of ALL_USAGE) {
    writeFileSync(join(USAGE_DIR, `${u.name}.md`), renderUsagePage(u))
    writeFileSync(join(USAGE_DIR, `${u.name}.json`), renderUsageJson(u))
  }
  writeFileSync(join(USAGE_DIR, 'index.json'), renderUsageIndex())
  console.log(`wrote ${ALL_USAGE.length} usage pages to public/usage/`)
}
