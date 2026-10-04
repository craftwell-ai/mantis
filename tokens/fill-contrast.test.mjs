// Every filled role's label must read against its own fill (WCAG 2.1 AA, 4.5:1).
// The WCAG suite checks inks on grounds; this closes the other half: a button's
// label on the button's own color, resolved through the shadcn alias map.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tokens } from './mantis.tokens.mjs'
import { resolveValue, modesOf } from '../scripts/token-model.mjs'
import { contrast } from '../scripts/contrast.mjs'

const PAIRS = [
  ['primary', 'primary-foreground'],
  ['brand', 'brand-foreground'],
  ['secondary', 'secondary-foreground'],
  ['soft', 'soft-foreground'],
  ['commerce-pink', 'commerce-pink-foreground'],
  ['commerce-blue', 'commerce-blue-foreground'],
  ['sale', 'sale-foreground'],
  ['success', 'success-foreground'],
  // A success banner: green text on the deep green tint.
  ['success-tint', 'success'],
]

// Gradient fills carry text across every stop, so every stop must pass.
const GRADIENT_FILLS = [
  ['badge-hot', 'sale-foreground'],
  ['badge-value', 'sale-foreground'],
]
// Gradient text is drawn on the page's grounds and surfaces.
const GRADIENT_TEXT = ['text-gold', 'text-fade']

const stopsOf = (gradient) => [...gradient.matchAll(/#[0-9a-f]{6}\b|rgba?\([^)]+\)/gi)].map((m) => m[0])

// var(--mantis-x) → source token x; var(--role-leaf) → color.role.leaf.
function resolveAlias(alias, mode) {
  const name = alias.match(/^var\(--([\w-]+)\)$/)?.[1]
  if (!name) throw new Error(`alias ${alias} is not a single var() reference`)
  const prefix = `${tokens.meta.name}-`
  if (name.startsWith(prefix)) return resolveValue(tokens, `{${name.slice(prefix.length)}}`, mode)
  const [group, ...leaf] = name.split('-')
  const node = tokens.color[group]?.[leaf.join('-')]
  if (!node) throw new Error(`alias ${alias} names no semantic color role`)
  return resolveValue(tokens, node[mode], mode)
}

test('filled roles carry a label that clears 4.5:1 on their own fill', () => {
  for (const mode of modesOf(tokens)) {
    for (const [fill, label] of PAIRS) {
      assert.ok(tokens.shadcn[fill] && tokens.shadcn[label], `shadcn map is missing ${fill} or ${label}`)
      const ratio = contrast(resolveAlias(tokens.shadcn[label], mode), resolveAlias(tokens.shadcn[fill], mode))
      assert.ok(ratio >= 4.5, `${label} on ${fill} is ${ratio.toFixed(2)}:1 in ${mode} (need 4.5)`)
    }
  }
})

test('every stop of a gradient fill carries its label at 4.5:1', () => {
  for (const mode of modesOf(tokens)) {
    for (const [fill, label] of GRADIENT_FILLS) {
      const ink = resolveAlias(tokens.shadcn[label], mode)
      const stops = stopsOf(resolveAlias(tokens.shadcn[fill], mode))
      assert.ok(stops.length >= 2, `${fill} resolved to no color stops`)
      for (const stop of stops) {
        const ratio = contrast(ink, stop)
        assert.ok(ratio >= 4.5, `${label} on ${fill} stop ${stop} is ${ratio.toFixed(2)}:1 in ${mode} (need 4.5)`)
      }
    }
  }
})

test('gradient text clears 4.5:1 at every stop on every ground and surface', () => {
  for (const mode of modesOf(tokens)) {
    const grounds = [tokens.color.ground.base, tokens.color.ground.raised, tokens.color.surface.card, tokens.color.surface.inset]
      .map((leaf) => resolveValue(tokens, leaf[mode], mode))
    for (const name of GRADIENT_TEXT) {
      for (const stop of stopsOf(resolveAlias(tokens.shadcn[name], mode)).filter((s) => !s.startsWith('rgba'))) {
        for (const ground of grounds) {
          const ratio = contrast(stop, ground)
          assert.ok(ratio >= 4.5, `${name} stop ${stop} on ${ground} is ${ratio.toFixed(2)}:1 in ${mode} (need 4.5)`)
        }
      }
    }
  }
})

test('chart series clear 3:1 (non-text) on every ground and surface, and differ from each other', () => {
  for (const mode of modesOf(tokens)) {
    const grounds = [tokens.color.ground.base, tokens.color.ground.raised, tokens.color.surface.card, tokens.color.surface.inset]
      .map((leaf) => resolveValue(tokens, leaf[mode], mode))
    const series = Object.keys(tokens.shadcn).filter((key) => /^chart-\d+$/.test(key)).map((key) => [key, resolveAlias(tokens.shadcn[key], mode)])
    assert.ok(series.length >= 5, 'expected at least five chart series')
    for (const [key, color] of series) {
      for (const ground of grounds) {
        const ratio = contrast(color, ground)
        assert.ok(ratio >= 3, `${key} ${color} on ${ground} is ${ratio.toFixed(2)}:1 in ${mode} (need 3)`)
      }
    }
    assert.equal(new Set(series.map(([, color]) => color.toLowerCase())).size, series.length, 'two chart series share a color')
  }
})
