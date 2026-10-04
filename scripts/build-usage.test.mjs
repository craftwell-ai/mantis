import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

import { ALL_USAGE } from '../usage/index.mjs'
import { USAGE_DIR, renderUsagePage } from './build-usage.mjs'

test('every usage page exists and is in sync (byte equality)', () => {
  assert.ok(ALL_USAGE.length > 0, 'usage/index.mjs lists no usage guides')
  for (const u of ALL_USAGE) {
    const file = join(USAGE_DIR, `${u.name}.md`)
    assert.ok(existsSync(file), `public/usage/${u.name}.md does not exist — run node scripts/build-usage.mjs`)
    assert.equal(
      readFileSync(file, 'utf8'),
      renderUsagePage(u),
      `public/usage/${u.name}.md is stale — run node scripts/build-usage.mjs`,
    )
  }
})
