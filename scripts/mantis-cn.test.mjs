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

test('mantis-cn knows every size token, so a size passed in replaces the component\'s own', async () => {
  // A size missing here is not read as a width or height: cn keeps both classes and the stylesheet's order picks one.
  const sizes = JSON.parse(source.match(/SIZES = (\[[^\]]*\])/)?.[1] ?? '[]')
  assert.deepEqual([...sizes].sort(), Object.keys(tokens.size).sort())
  const { cn } = await import('../lib/mantis-cn.ts')
  assert.equal(cn('h-control px-3', 'h-control-xs'), 'px-3 h-control-xs')
  assert.equal(cn('h-9', 'h-control-xs'), 'h-control-xs')
  assert.equal(cn('size-[1em]', 'size-icon-md'), 'size-icon-md')
  assert.equal(cn('min-w-control-sm', 'min-w-0'), 'min-w-0')
  assert.equal(cn('max-h-control', 'max-h-0'), 'max-h-0')
  assert.equal(cn('h-control text-sm'), 'h-control text-sm')
})

test('the registry describes everything mantis-cn knows, since agents choose items by their description', () => {
  const item = JSON.parse(readFileSync(new URL('../registry.json', import.meta.url), 'utf8')).items.find((i) => i.name === 'mantis-cn')
  assert.match(item.description, /text styles/)
  assert.match(item.description, /size tokens/)
})
