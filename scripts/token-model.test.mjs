import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  modesOf, refPath, sourceVarName, resolveValue, cssValue, cssLiteral,
  sourceDeclarations, schemeOf, applyAccent, themeBlocks, semanticLeaves,
} from './token-model.mjs'

// Three modes, an accent, aliases in both layers and one of each composite
// shape. Every value here is invented for the test.
const tokens = {
  meta: { name: 'acme' },
  modes: ['light', 'dark', 'dim'],
  color: {
    ground: { base: { light: '#FFFFFF', dark: '#101214', dim: '{palette.gray.800}' } },
    accent: { base: { light: '{palette.brand}', dark: '{palette.brand}', dim: '{palette.blue.300}' } },
  },
  shadow: { low: { light: '0 1px 2px rgba(0, 0, 0, 0.1)', dark: '0 1px 2px rgba(0, 0, 0, 0.5)', dim: '0 1px 2px rgba(0, 0, 0, 0.4)' } },
  source: {
    palette: {
      gray: { 800: { $type: 'color', $value: '#2A2E33' } },
      blue: { 600: { $type: 'color', $value: '#1F5FAD' }, 300: { $type: 'color', $value: '#8DB8EB' } },
      brand: { $type: 'color', $value: '{palette.blue.600}', $modes: { dark: '{palette.blue.300}' } },
    },
    space: { 4: { $type: 'dimension', $value: '16px' } },
    motion: { standard: { $type: 'cubicBezier', $value: [0.2, 0, 0, 1] } },
    type: { heading: { $type: 'typography', $value: { fontFamily: ['Test Sans', 'sans-serif'], fontSize: '32px', fontWeight: 700, lineHeight: 1.2 } } },
  },
  accents: {
    sunset: { source: { palette: { brand: { $type: 'color', $value: '#B4441E', $modes: { dark: '#F0A07F', dim: '#F0A07F' } } } } },
  },
}

test('modes come from the token module, light/dark when it names none', () => {
  assert.deepEqual(modesOf(tokens), ['light', 'dark', 'dim'])
  assert.deepEqual(modesOf({}), ['light', 'dark'])
})

test('an alias is a whole {group.token} value, nothing else', () => {
  assert.equal(refPath('{palette.blue.600}'), 'palette.blue.600')
  assert.equal(refPath('#1F5FAD'), null)
  assert.equal(refPath('calc({a} + 1px)'), null)
})

test('source tokens get the system name as prefix and CSS-safe segments', () => {
  assert.equal(sourceVarName('acme', ['palette', 'blue', '600']), '--acme-palette-blue-600')
  assert.equal(sourceVarName('acme', ['Brand Colors', 'primary/500']), '--acme-Brand-Colors-primary-500')
})

test('aliases resolve per mode, through other aliases', () => {
  assert.equal(resolveValue(tokens, tokens.color.accent.base.light, 'light'), '#1F5FAD')
  assert.equal(resolveValue(tokens, tokens.color.accent.base.dark, 'dark'), '#8DB8EB')
  assert.equal(resolveValue(tokens, '{palette.brand}', 'dim'), '#1F5FAD', 'dim has no override, so the default alias applies')
  assert.equal(resolveValue(tokens, tokens.color.ground.base.dim, 'dim'), '#2A2E33')
})

test('a dangling alias or a cycle fails loudly', () => {
  assert.throws(() => resolveValue(tokens, '{palette.nope}', 'light'), /names nothing/)
  const loop = { ...tokens, source: { a: { $type: 'color', $value: '{b}' }, b: { $type: 'color', $value: '{a}' } } }
  assert.throws(() => resolveValue(loop, '{a}', 'light'), /cycle/)
})

test('aliases become var() in CSS; composites become CSS text', () => {
  assert.equal(cssValue(tokens, '{palette.blue.600}'), 'var(--acme-palette-blue-600)')
  assert.equal(cssValue(tokens, '#FFFFFF'), '#FFFFFF')
  assert.equal(cssLiteral(tokens, 'cubicBezier', [0.2, 0, 0, 1]), 'cubic-bezier(0.2, 0, 0, 1)')
  assert.equal(cssLiteral(tokens, 'fontFamily', ['Test Sans', 'sans-serif']), '"Test Sans", sans-serif')
  assert.equal(
    cssLiteral(tokens, 'shadow', { offsetX: '0px', offsetY: '1px', blur: '2px', color: '{palette.gray.800}' }),
    '0px 1px 2px 0px var(--acme-palette-gray-800)',
  )
})

test('a typography token expands into one custom property per field', () => {
  const decls = sourceDeclarations(tokens, ['type', 'heading'], tokens.source.type.heading, 'light')
  assert.deepEqual(decls, [
    ['--acme-type-heading-font-family', '"Test Sans", sans-serif'],
    ['--acme-type-heading-font-size', '32px'],
    ['--acme-type-heading-font-weight', '700'],
    ['--acme-type-heading-line-height', '1.2'],
  ])
})

test('each mode knows whether the browser should draw light or dark controls', () => {
  assert.equal(schemeOf(tokens, 'light'), 'light')
  assert.equal(schemeOf(tokens, 'dark'), 'dark')
  assert.equal(schemeOf(tokens, 'dim'), 'dark')
})

test('an accent replaces only the leaves it names', () => {
  const sunset = applyAccent(tokens, 'sunset')
  assert.equal(resolveValue(sunset, '{palette.brand}', 'light'), '#B4441E')
  assert.equal(resolveValue(sunset, '{palette.blue.600}', 'light'), '#1F5FAD')
  assert.equal(tokens.source.palette.brand.$value, '{palette.blue.600}', 'the base system is untouched')
  assert.throws(() => applyAccent(tokens, 'nope'), /no accent named/)
})

test('a complete colour override merges; an incomplete one throws loudly', () => {
  const complete = applyAccent(tokens, 'sunset')
  assert.equal(complete.color.accent.base.light, '{palette.brand}', 'base leaves not overridden stay intact')
  const incomplete = { ...tokens, accents: { ...tokens.accents, partial: { color: { accent: { base: { light: '#B4441E' } } } } } }
  assert.throws(() => applyAccent(incomplete, 'partial'), /needs every mode|no 'dark' value/)
})

test('a default mode named after a nested role key does not swallow that leaf\'s whole group', () => {
  // Shaped like the real template — ground/surface/text/accent/line groups,
  // each holding named leaves — with a default mode named 'base', which is
  // also the role key ground.base/accent.base/line.base commonly use. The old
  // guard only rejected a mode name colliding with a TOP-LEVEL tokens.color
  // key ('ground', 'surface', …); it never saw this nested collision, so
  // `semanticLeaves` walked in with `'base' in value` and mis-tested the
  // GROUP object (`{ base: {...}, raised: {...} }`) as if it were the leaf,
  // emitting `--ground` (bare) instead of `--ground-base` / `--ground-raised`.
  const shaped = {
    meta: { name: 'acme' },
    modes: ['base', 'dark'],
    color: {
      ground: { base: { base: '#FFFFFF', dark: '#101214' }, raised: { base: '#F5F5F5', dark: '#1A1C1F' } },
      surface: { card: { base: '#FFFFFF', dark: '#1E2126' } },
      text: { primary: { base: '#23272C', dark: '#E8EAED' } },
      accent: { base: { base: '#3B6EA8', dark: '#7FA8D4' } },
      line: { base: { base: 'rgba(35, 39, 44, 0.14)', dark: 'rgba(232, 234, 237, 0.14)' } },
    },
    shadow: {},
  }
  const leaves = semanticLeaves(shaped)
  const names = leaves.map(([name]) => name).sort()
  assert.deepEqual(names, [
    '--accent-base', '--ground-base', '--ground-raised', '--line-base', '--surface-card', '--text-primary',
  ])
  // Every entry semanticLeaves returns must actually BE a leaf (one string per
  // mode) — a group misread as a leaf would fail this instead of just having
  // the wrong name, catching the defect even if the name-based assertion above
  // were loosened later.
  for (const [name, leaf] of leaves) {
    assert.ok(
      Object.values(leaf).every((v) => typeof v === 'string'),
      `${name} must be a leaf ({mode: value, …}), got a group: ${JSON.stringify(leaf)}`,
    )
  }
})

test('theme blocks: every mode, then every accent in every mode', () => {
  const blocks = themeBlocks(tokens)
  assert.deepEqual(blocks.map((b) => [b.mode, b.accent]), [
    ['light', null], ['dark', null], ['dim', null],
    ['light', 'sunset'], ['dark', 'sunset'], ['dim', 'sunset'],
  ])
  const names = (b) => b.declarations.map(([n]) => n)
  const [light, dark, dim, sunsetLight] = blocks
  assert.ok(names(light).includes('--acme-space-4'), 'the default block holds every source token')
  assert.ok(!names(dark).includes('--acme-space-4'), 'a token that never changes is not repeated')
  assert.ok(names(dim).includes('--acme-palette-brand'), 'an alias-valued token is re-declared so it re-resolves')
  for (const b of blocks) {
    assert.ok(names(b).includes('--ground-base') && names(b).includes('--shadow-low'), 'every block re-declares the semantic layer')
  }
  assert.deepEqual(
    sunsetLight.declarations.find(([n]) => n === '--acme-palette-brand'),
    ['--acme-palette-brand', '#B4441E'],
  )
  assert.equal(dark.scheme, 'dark')
})
