import { createHash } from 'node:crypto'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

import { ALL_USAGE } from '../usage/index.mjs'
import { USAGE_DIR, renderUsagePage, renderUsageJson, renderUsageIndex, usageHash } from './build-usage.mjs'

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

test('every usage guide is also published as data, with an index, in sync (byte equality)', () => {
  for (const u of ALL_USAGE) {
    const file = join(USAGE_DIR, `${u.name}.json`)
    assert.ok(existsSync(file), `public/usage/${u.name}.json does not exist — run node scripts/build-usage.mjs`)
    assert.equal(readFileSync(file, 'utf8'), renderUsageJson(u), `public/usage/${u.name}.json is stale — run node scripts/build-usage.mjs`)
  }
  const index = join(USAGE_DIR, 'index.json')
  assert.ok(existsSync(index), 'public/usage/index.json does not exist — run node scripts/build-usage.mjs')
  assert.equal(readFileSync(index, 'utf8'), renderUsageIndex(), 'public/usage/index.json is stale — run node scripts/build-usage.mjs')
  assert.ok(!ALL_USAGE.some((u) => u.name === 'index'), 'a guide named "index" would overwrite public/usage/index.json')
})

test('each guide in the index carries the SHA-256 of its own published JSON file', () => {
  const { guides } = JSON.parse(readFileSync(join(USAGE_DIR, 'index.json'), 'utf8'))
  assert.equal(guides.length, ALL_USAGE.length)
  for (const guide of guides) {
    const published = readFileSync(join(USAGE_DIR, `${guide.name}.json`))
    assert.equal(guide.hash, createHash('sha256').update(published).digest('hex'), `the index's hash for ${guide.name} does not match public/usage/${guide.name}.json`)
  }
  // Rewording one rule must change that guide's fingerprint and nobody else's.
  const [first, second] = ALL_USAGE
  const reworded = { ...first, summary: `${first.summary} (reworded)` }
  assert.notEqual(usageHash(reworded), usageHash(first))
  assert.equal(JSON.parse(renderUsageIndex([reworded, second])).guides[1].hash, usageHash(second))
})
