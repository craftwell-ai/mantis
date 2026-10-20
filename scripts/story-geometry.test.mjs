import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STYLE_PROPS, styleLine } from './story-geometry.mjs'

// Opacity, layer order and timing never move a box, so the capture records the computed values too.
test('records the computed values this release touches, in a fixed order', () => {
  assert.deepEqual(STYLE_PROPS, ['opacity', 'z-index', 'transition-duration', 'transition-timing-function', 'max-width', 'min-width', 'line-height', 'font-size', 'border-top-left-radius'])
  const cs = Object.fromEntries(STYLE_PROPS.map((p, i) => [p, String(i)]))
  assert.equal(styleLine({ getPropertyValue: (p) => cs[p] }, STYLE_PROPS), '0|1|2|3|4|5|6|7|8')
})
