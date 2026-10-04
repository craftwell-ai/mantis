// data-contrast-exempt switches off axe's color-contrast check for one
// element. The owner allowed it for one case only (2026-10-02, CLAUDE.md):
// grey secondary text on stacked glass, matching the reference. This test
// keeps it from spreading: any file that mentions it must be on the list
// below, so a new use is a reviewed change to this file, never a quiet one.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const ATTRIBUTE = 'data-contrast-exempt'

const ALLOWED = new Set([
  // The mechanism and the records of the decision.
  '.storybook/preview.tsx',
  'CLAUDE.md',
  'AGENTS.md',
  'DESIGN.md',
  'scripts/build-agents.mjs',
  'scripts/contrast-exempt.test.mjs',
  // Grey text on stacked glass or field fill, exempted element by element.
  'registry/account-menu.tsx',
  'registry/countdown.tsx',
  'registry/model-picker.tsx',
  'registry/share-dialog.tsx',
  'registry/studio-settings-panel.tsx',
  'registry/usage-summary.tsx',
  'stories/radio-group.stories.tsx',
  'stories/share-dialog.stories.tsx',
])

// Generated output (public/) is rebuilt from the files above, so it is not scanned.
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'public', 'storybook-static', '.shots'])
const TEXT_FILE = /\.(tsx?|jsx?|mjs|cjs|css|md|mdx|json|html)$/

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(join(dir, entry.name))
    } else if (TEXT_FILE.test(entry.name)) {
      yield join(dir, entry.name)
    }
  }
}

test(`${ATTRIBUTE} appears only in the allow-listed files`, () => {
  const offenders = []
  for (const file of walk(root)) {
    const path = relative(root, file).split('\\').join('/')
    if (!ALLOWED.has(path) && readFileSync(file, 'utf8').includes(ATTRIBUTE)) offenders.push(path)
  }
  assert.deepEqual(
    offenders,
    [],
    `${ATTRIBUTE} is reserved for grey secondary text on stacked glass (CLAUDE.md, owner decision 2026-10-02). Fix the contrast instead, or get the owner's approval and add the file to ALLOWED.`,
  )
})

test('every allow-listed component file still uses it, so the list cannot go stale', () => {
  for (const path of ALLOWED) {
    if (!/\.tsx$/.test(path)) continue
    assert.ok(readFileSync(join(root, path), 'utf8').includes(ATTRIBUTE), `${path} no longer uses ${ATTRIBUTE}; remove it from ALLOWED`)
  }
})
