/**
 * Writes public/usage/<name>.md — one page per usage guide — from
 * usage/*.usage.mjs. The guide module is the single source;
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

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(USAGE_DIR, { recursive: true })
  for (const u of ALL_USAGE) writeFileSync(join(USAGE_DIR, `${u.name}.md`), renderUsagePage(u))
  console.log(`wrote ${ALL_USAGE.length} usage pages to public/usage/`)
}
