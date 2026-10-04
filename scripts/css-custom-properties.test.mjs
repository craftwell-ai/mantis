import { test } from 'node:test'
import assert from 'node:assert/strict'
import { harvestCss, groupsToDocs } from './css-custom-properties.mjs'
import { importDtcg } from './dtcg-io.mjs'

// Invented stylesheet with the shapes real sites ship: an @import, a comment,
// a dark attribute theme, a media-query theme, a layer and a nested rule.
const CSS = `
@import url("fonts.css");
/* brand */
:root { --brand-500: #1F5FAD; --space-4: 16px; --surface: var(--brand-500); --ease: cubic-bezier(0.2, 0, 0, 1); --font-body: "Test Sans", system-ui, sans-serif; }
[data-theme="dark"] { --surface: #101214; }
@media (prefers-color-scheme: dark) { :root { --surface: #111316; } }
@layer theme { .card { color: red; --card-pad: 24px; &:hover { --card-pad: 28px; } } }
`

test('custom properties are grouped by selector and condition', () => {
  const groups = harvestCss(CSS)
  assert.deepEqual(Object.keys(groups), [':root', '[data-theme="dark"]', '@media (prefers-color-scheme: dark) :root', '.card'])
  assert.equal(groups[':root']['--surface'], 'var(--brand-500)')
  assert.deepEqual(groups['.card'], { '--card-pad': '24px' }, 'plain properties and nested rules are left out')
})

test('each mode takes its selectors; aliases stay aliases; types are read from the values', () => {
  const docs = groupsToDocs(harvestCss(CSS), { light: [':root'], dark: [':root', '[data-theme="dark"]'] })
  const { modes, source } = importDtcg(docs)
  assert.deepEqual(modes, ['light', 'dark'])
  assert.deepEqual(source.surface, { $type: 'color', $value: '{brand-500}', $modes: { dark: '#101214' } })
  assert.deepEqual(source['space-4'], { $type: 'dimension', $value: '16px' })
  assert.deepEqual(source.ease, { $type: 'cubicBezier', $value: [0.2, 0, 0, 1] })
  assert.equal(source['font-body'].$type, 'fontFamily')
})

test('naming a selector the stylesheet does not have fails loudly', () => {
  assert.throws(() => groupsToDocs(harvestCss(CSS), { light: [':root'], dark: ['.dark'] }), /no selector '\.dark'/)
})

test('quoted semicolon in property value does not truncate', () => {
  const css = ':root { --label: "Save; Continue"; }'
  const groups = harvestCss(css)
  assert.equal(groups[':root']['--label'], '"Save; Continue"')
})

test('data URI with semicolons and braces is harvested completely', () => {
  const css = ':root { --bg: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==); }'
  const groups = harvestCss(css)
  assert.equal(groups[':root']['--bg'], 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==)')
})

test('braces inside quoted strings do not desync the scanner', () => {
  const css = ':root { --tmpl: "{count} items"; --next: red; }'
  const groups = harvestCss(css)
  assert.equal(groups[':root']['--tmpl'], '"{count} items"')
  assert.equal(groups[':root']['--next'], 'red', 'declaration after quoted braces is harvested')
})
