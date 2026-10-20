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
  assert.match(item.description, /opacit/)
  assert.match(item.description, /layers/)
  assert.match(item.description, /durations and curves/)
  assert.match(item.description, /panel widths/)
  assert.match(item.description, /ring-focus/)
})

test('mantis-cn knows every opacity token, so an opacity passed in replaces the component\'s own', async () => {
  const opacities = JSON.parse(source.match(/OPACITIES = (\[[^\]]*\])/)?.[1] ?? '[]')
  assert.deepEqual([...opacities].sort(), Object.keys(tokens.opacity ?? {}).sort())
  const { cn } = await import('../lib/mantis-cn.ts')
  assert.equal(cn('opacity-50', 'opacity-disabled'), 'opacity-disabled')
  assert.equal(cn('disabled:opacity-50', 'disabled:opacity-muted'), 'disabled:opacity-muted')
  assert.equal(cn('opacity-disabled', 'opacity-scrim'), 'opacity-scrim')
})

test('mantis-cn knows every layer token, so a layer passed in replaces the component\'s own', async () => {
  const layers = JSON.parse(source.match(/LAYERS = (\[[^\]]*\])/)?.[1] ?? '[]')
  assert.deepEqual([...layers].sort(), Object.keys(tokens.layer ?? {}).sort())
  const { cn } = await import('../lib/mantis-cn.ts')
  assert.equal(cn('z-50', 'z-floating'), 'z-floating')
  assert.equal(cn('z-floating', 'z-raised'), 'z-raised')
  assert.equal(cn('-z-10', '-z-raised'), '-z-raised')
  assert.equal(cn('focus:z-10', 'focus:z-sticky'), 'focus:z-sticky')
})

test('container widths merge: a width passed in replaces the component\'s own', async () => {
  const { cn } = await import('../lib/mantis-cn.ts')
  assert.equal(cn('max-w-md', 'max-w-sm'), 'max-w-sm')
  assert.equal(cn('sm:max-w-sm', 'sm:max-w-lg'), 'sm:max-w-lg')
  assert.equal(cn('w-md', 'w-full'), 'w-full')
})

test('mantis-cn knows every duration and curve name, so a timing passed in replaces the component\'s own', async () => {
  const durations = JSON.parse(source.match(/DURATIONS = (\[[^\]]*\])/)?.[1] ?? '[]')
  const eases = JSON.parse(source.match(/EASES = (\[[^\]]*\])/)?.[1] ?? '[]')
  assert.deepEqual([...durations].sort(), Object.keys(tokens.motion.duration).sort())
  assert.deepEqual([...eases].sort(), Object.keys(tokens.motion.ease).sort())
  const { cn } = await import('../lib/mantis-cn.ts')
  assert.equal(cn('ease-out', 'ease-swift'), 'ease-swift')
  assert.equal(cn('ease-swift', 'ease-spring'), 'ease-spring')
  assert.equal(cn('duration-200', 'duration-normal'), 'duration-normal')
  assert.equal(cn('duration-normal', 'duration-fast'), 'duration-fast')
})

test('mantis-cn knows the blur names, so a blur passed in replaces the component\'s own', async () => {
  const blurs = JSON.parse(source.match(/BLURS = (\[[^\]]*\])/)?.[1] ?? '[]')
  assert.deepEqual([...blurs].sort(), Object.keys(tokens.blur).sort())
  const { cn } = await import('../lib/mantis-cn.ts')
  assert.equal(cn('blur-3xl', 'blur-dialog'), 'blur-dialog')
  assert.equal(cn('backdrop-blur-sm', 'backdrop-blur-glass'), 'backdrop-blur-glass')
  assert.equal(cn('backdrop-blur-glass', 'backdrop-blur-chip'), 'backdrop-blur-chip')
})

test('a transparency passed in replaces the component\'s own', async () => {
  const { cn } = await import('../lib/mantis-cn.ts')
  assert.equal(cn('bg-brand/50', 'bg-brand/40'), 'bg-brand/40')
  assert.equal(cn('hover:bg-glass/80', 'hover:bg-glass/90'), 'hover:bg-glass/90')
})

test('a focus ring passed in replaces the component\'s own', async () => {
  const rings = JSON.parse(source.match(/RINGS = (\[[^\]]*\])/)?.[1] ?? '[]')
  assert.deepEqual([...rings].sort(), Object.keys(tokens.ringWidth ?? {}).sort())
  const { cn } = await import('../lib/mantis-cn.ts')
  assert.equal(cn('focus-visible:ring-3', 'focus-visible:ring-focus'), 'focus-visible:ring-focus')
  assert.equal(cn('ring-focus ring-ring/50', 'ring-2'), 'ring-ring/50 ring-2')
  assert.equal(cn('blur-3xl', 'blur-stage'), 'blur-stage')
})

test('mantis-cn knows every panel and menu width', async () => {
  const widths = JSON.parse(source.match(/WIDTHS = (\[[^\]]*\])/)?.[1] ?? '[]')
  assert.deepEqual([...widths].sort(), Object.keys(tokens.width ?? {}).sort())
  const { cn } = await import('../lib/mantis-cn.ts')
  assert.equal(cn('w-64', 'w-panel'), 'w-panel')
  assert.equal(cn('w-panel', 'w-full'), 'w-full')
  assert.equal(cn('min-w-32', 'min-w-menu-lg'), 'min-w-menu-lg')
  assert.equal(cn('max-w-panel-xl', 'max-w-md'), 'max-w-md')
})
