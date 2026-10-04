import { test } from 'node:test'
import assert from 'node:assert/strict'
import { importDtcg, exportDtcg, normalizeValue, modeSlug } from './dtcg-io.mjs'
import { validateDtcg } from './validate-dtcg.mjs'

test('one document per mode: $value from the first, $modes only where another differs', () => {
  const light = { color: { $type: 'color', page: { $value: '#FFFFFF' }, ink: { $value: '#1A1C1E' } }, space: { 4: { $type: 'dimension', $value: '16px' } } }
  const dark = { color: { $type: 'color', page: { $value: '#101214' }, ink: { $value: '#E8EAED' } }, space: { 4: { $type: 'dimension', $value: '16px' } } }
  const { modes, source, tokenCount, warnings } = importDtcg({ Light: light, Dark: dark })
  assert.deepEqual(modes, ['light', 'dark'])
  assert.equal(tokenCount, 3)
  assert.deepEqual(warnings, [])
  assert.deepEqual(source.color.page, { $type: 'color', $value: '#FFFFFF', $modes: { dark: '#101214' } })
  assert.deepEqual(source.space['4'], { $type: 'dimension', $value: '16px' })
})

test('one document with $extensions.modes reads every mode, in the declared order', () => {
  const doc = {
    $extensions: { modes: ['light', 'dark', 'dim'] },
    surface: { $type: 'color', $value: '#FFFFFF', $extensions: { modes: { light: '#FFFFFF', dark: '#101214', dim: '#2A2E33' } } },
  }
  const { modes, source } = importDtcg({ light: doc })
  assert.deepEqual(modes, ['light', 'dark', 'dim'])
  assert.deepEqual(source.surface.$modes, { dark: '#101214', dim: '#2A2E33' })
})

test('DTCG 2025 value objects become CSS text', () => {
  assert.equal(normalizeValue({ colorSpace: 'srgb', components: [0.2, 0.4, 0.6] }), '#336699')
  assert.equal(normalizeValue({ colorSpace: 'srgb', components: [0.2, 0.4, 0.6], alpha: 0.5 }), 'rgba(51, 102, 153, 0.5)')
  assert.equal(normalizeValue({ colorSpace: 'srgb', components: [0, 0, 0], hex: '#1a1c1e' }), '#1A1C1E')
  assert.equal(normalizeValue({ colorSpace: 'oklch', components: [0.62, 0.19, 259] }), 'oklch(0.62 0.19 259)')
  assert.equal(normalizeValue({ value: 16, unit: 'px' }), '16px')
  assert.equal(normalizeValue({ value: 200, unit: 'ms' }), '200ms')
})

test('group $type is inherited, $description kept, aliases stay aliases', () => {
  const doc = {
    palette: { $type: 'color', blue: { $value: '#1F5FAD', $description: 'Links and focus' } },
    brand: { $type: 'color', $value: '{palette.blue}' },
  }
  const { source } = importDtcg({ light: doc })
  assert.deepEqual(source.palette.blue, { $type: 'color', $value: '#1F5FAD', $description: 'Links and focus' })
  assert.equal(source.brand.$value, '{palette.blue}')
})

test('a token missing from one mode is reported, not guessed', () => {
  const { source, warnings } = importDtcg({ light: { a: { $type: 'color', $value: '#FFFFFF' } }, dark: {} })
  assert.equal(source.a.$value, '#FFFFFF')
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /missing from the 'dark' document/)
})

test('mode names become attribute-safe slugs', () => {
  assert.equal(modeSlug('Light'), 'light')
  assert.equal(modeSlug('High Contrast'), 'high-contrast')
})

test('export then import round-trips the source layer and every mode', () => {
  const tokens = {
    meta: { name: 'acme' },
    modes: ['light', 'dark', 'dim'],
    color: { ground: { base: { light: '#FFFFFF', dark: '#101214', dim: '{palette.gray}' } } },
    radius: { sm: '4px' },
    text: { base: '16px' },
    font: { sans: 'Inter, sans-serif' },
    shadow: { low: { light: 'none', dark: 'none', dim: 'none' } },
    source: {
      palette: {
        gray: { $type: 'color', $value: '#2A2E33' },
        brand: { $type: 'color', $value: '{palette.gray}', $modes: { dark: '#8DB8EB' } },
      },
    },
  }
  const doc = exportDtcg(tokens)
  assert.equal(validateDtcg(doc).ok, true)
  assert.equal(doc.color.ground.base.$extensions.modes.dim, '{source.palette.gray}')
  const back = importDtcg({ light: doc }, { root: 'source' })
  assert.deepEqual(back.modes, tokens.modes)
  assert.deepEqual(back.source, tokens.source)
})

test('mode list from per-token $extensions.modes alone, first-seen order, default first', () => {
  const doc = {
    primary: { $type: 'color', $value: '#0066CC', $extensions: { modes: { light: '#0066CC', dark: '#4D94FF' } } },
    secondary: { $type: 'color', $value: '#FF6B35', $extensions: { modes: { light: '#FF6B35', dark: '#FFB399', 'high-contrast': '#FF3300' } } },
    neutral: { $type: 'color', $value: '#666666' },
  }
  const { modes, source } = importDtcg({ light: doc })
  assert.deepEqual(modes, ['light', 'dark', 'high-contrast'])
  assert.deepEqual(source.primary.$modes, { dark: '#4D94FF' })
  assert.deepEqual(source.secondary.$modes, { dark: '#FFB399', 'high-contrast': '#FF3300' })
  assert.equal(source.neutral.$modes, undefined)
})

test('a token that exists only in a non-default document is not added to source', () => {
  const { source, warnings } = importDtcg({
    light: { base: { $type: 'color', $value: '#FFFFFF' } },
    dark: { base: { $type: 'color', $value: '#101214' }, extra: { $type: 'color', $value: '#FF0000' } },
  })
  assert.equal(source.base.$value, '#FFFFFF')
  assert.equal(source.extra, undefined)
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /extra exists only in the 'dark' document — add it to the 'light' document to import it/)
})

test('exportDtcg with spacing and accents exports all semantic groups and extensions', () => {
  const tokens = {
    meta: { name: 'acme' },
    modes: ['light', 'dark'],
    color: { primary: { light: '#0066CC', dark: '#4D94FF' } },
    radius: { sm: '4px' },
    text: { base: '16px' },
    font: { sans: 'Inter' },
    shadow: { low: { light: 'none', dark: 'none' } },
    spacing: { 4: '16px', 8: '32px' },
    accents: { primary: '#FF6B35', secondary: '#00AA00' },
    source: {},
  }
  const doc = exportDtcg(tokens)
  assert.equal(validateDtcg(doc).ok, true)
  assert.deepEqual(doc.spacing['4'], { $type: 'dimension', $value: '16px' })
  assert.deepEqual(doc.spacing['8'], { $type: 'dimension', $value: '32px' })
  assert.deepEqual(doc.$extensions.accents, { primary: '#FF6B35', secondary: '#00AA00' })
})

test('exportDtcg detects a colour leaf by shape, not by the default mode name', () => {
  // Shaped like the real template: ground/accent groups whose nested role key
  // ('base') happens to share the default mode's name. The old `first in
  // value` test misread the whole GROUP object (`{ base: {...}, raised: {...} }`)
  // as if it were the leaf, and serialized it as one garbled token — $value
  // set to a nested object instead of a color string — rather than recursing
  // into ground.base / ground.raised as their own real color tokens.
  const tokens = {
    meta: { name: 'acme' },
    modes: ['base', 'dark'],
    color: {
      ground: { base: { base: '#FFFFFF', dark: '#101214' }, raised: { base: '#F5F5F5', dark: '#1A1C1F' } },
      accent: { base: { base: '#3B6EA8', dark: '#7FA8D4' } },
    },
    radius: {},
    text: {},
    font: {},
    shadow: {},
    source: {},
  }
  const doc = exportDtcg(tokens)
  assert.deepEqual(doc.color.ground.base, {
    $type: 'color',
    $value: '#FFFFFF',
    $extensions: { modes: { base: '#FFFFFF', dark: '#101214' } },
  })
  assert.deepEqual(doc.color.ground.raised.$extensions.modes, { base: '#F5F5F5', dark: '#1A1C1F' })
  assert.deepEqual(doc.color.accent.base.$extensions.modes, { base: '#3B6EA8', dark: '#7FA8D4' })
  assert.equal(validateDtcg(doc).ok, true)
})
