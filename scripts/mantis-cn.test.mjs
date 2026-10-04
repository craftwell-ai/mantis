import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { tokens } from '../tokens/mantis.tokens.mjs'

const source = readFileSync(new URL('../lib/mantis-cn.ts', import.meta.url), 'utf8')
const listed = JSON.parse(source.match(/TEXT_STYLES = (\[[^\]]*\])/)[1])

test('mantis-cn knows every text style the tokens define', () => {
  // A style missing here is read as a color and dropped when a color follows.
  assert.deepEqual([...listed].sort(), Object.keys(tokens.textStyles).sort())
})
