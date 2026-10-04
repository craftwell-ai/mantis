import { test } from 'node:test'
import assert from 'node:assert/strict'
import { luminance, contrast, hexToHsl, hslToHex, parseColor, toHex } from './contrast.mjs'

test('luminance of pure white is 1, pure black is 0', () => {
  assert.ok(Math.abs(luminance('#FFFFFF') - 1) < 1e-9)
  assert.ok(Math.abs(luminance('#000000') - 0) < 1e-9)
})

test('contrast of black on white is 21:1, self-contrast is 1:1', () => {
  assert.ok(Math.abs(contrast('#000000', '#FFFFFF') - 21) < 0.01)
  assert.ok(Math.abs(contrast('#777777', '#777777') - 1) < 1e-9)
})

test('contrast matches a known WCAG pair', () => {
  // #767676 on #FFFFFF is the canonical ~4.54:1 AA-passing grey
  const ratio = contrast('#767676', '#FFFFFF')
  assert.ok(ratio > 4.5 && ratio < 4.6, `expected ~4.54, got ${ratio}`)
})

test('hex -> HSL -> hex round-trips within 1/255 per channel', () => {
  for (const hex of ['#C4684B', '#20180E', '#F5EDDD', '#00FF00', '#123456']) {
    const back = hslToHex(hexToHsl(hex))
    const dist = (a, b, i) => Math.abs(parseInt(a.slice(i, i + 2), 16) - parseInt(b.slice(i, i + 2), 16))
    for (const i of [1, 3, 5]) assert.ok(dist(hex, back, i) <= 1, `${hex} -> ${back} channel drift`)
  }
})

test('hexToHsl handles 3-digit hex and lowercase', () => {
  assert.deepEqual(hexToHsl('#fff'), hexToHsl('#FFFFFF'))
})

test('parseColor reads every opaque CSS color form a source ships', () => {
  assert.equal(toHex('#36c'), '#3366CC')
  assert.equal(toHex('rgb(51, 102, 153)'), '#336699')
  assert.equal(toHex('rgb(51 102 153)'), '#336699')
  assert.equal(toHex('hsl(210 50% 40%)'), '#336699')
  assert.equal(toHex('oklch(0.6279553606 0.2576833077 29.2338851923)'), '#FF0000')
  assert.equal(toHex('oklch(100% 0 0)'), '#FFFFFF')
  assert.equal(toHex('oklab(0 0 0)'), '#000000')
})

test('translucent colors parse but have no contrast on their own', () => {
  assert.deepEqual(parseColor('rgba(35, 39, 44, 0.14)'), { r: 35, g: 39, b: 44, a: 0.14 })
  assert.ok(Number.isNaN(luminance('rgba(35, 39, 44, 0.14)')))
  assert.throws(() => toHex('rgba(35, 39, 44, 0.14)'), /translucent/)
})

test('contrast accepts oklch the same as hex', () => {
  assert.equal(contrast('oklch(1 0 0)', '#000000').toFixed(2), '21.00')
})
