import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tokens } from '../tokens/mantis.tokens.mjs'
import {
  renderGlobals,
  renderRegistryTheme,
  renderDtcg,
  renderManager,
  renderStorybookModes,
  injectBetweenMarkers,
  MARKER_START,
  MARKER_END,
} from './build-tokens.mjs'

// A self-contained, all-literal fixture — never derived from the live
// `tokens` import. A real ingestion run routinely SPLICES the semantic
// layer as aliases into `tokens.source` (references/ingestion.md §6a: "where
// the source names the role, the leaf aliases it in every mode"), so
// `tokens.color.ground.base.light` in a generated repo is exactly as likely
// to read `'{Theme.page}'` as `'#FAFAF8'`. These tests assert what the
// RENDER FUNCTIONS do with known values, not what a given client's capture
// happened to produce — asserting against the live import (as this file did
// before Task 14's end-to-end run exposed it) makes every substring/equality
// check below fail the moment a role is alias-mapped instead of literal,
// even though rendering is working correctly (the alias resolves to a
// `var(--…)` reference, not the raw `{Group.token}` text). Only `meta` and
// `shadcn` are drawn from the real import: `meta.name` is a structural fact
// (drives generated CSS variable names) and `shadcn` values are always
// `var(--<semantic-name>)` regardless of how the semantic layer was sourced.
const fixture = {
  meta: tokens.meta,
  modes: ['light', 'dark'],
  color: {
    ground: { base: { light: '#FFFFFF', dark: '#101114' }, raised: { light: '#F5F5F5', dark: '#1A1B1E' } },
    surface: { card: { light: '#FFFFFF', dark: '#1A1B1E' }, inset: { light: '#EBEBEB', dark: '#202226' } },
    text: { primary: { light: '#111214', dark: '#F5F5F5' }, secondary: { light: '#4B4F55', dark: '#B7BCC2' } },
    accent: { base: { light: '#2B5FAD', dark: '#8DB8EB' }, deep: { light: '#1F477F', dark: '#A9CBF2' }, text: { light: '#1F477F', dark: '#A9CBF2' } },
    line: { base: { light: 'rgba(17, 18, 20, 0.14)', dark: 'rgba(245, 245, 245, 0.14)' }, control: { light: '#6B6F75', dark: '#8B8F95' } },
    status: { destructive: { light: '#A23B3B', dark: '#E39A8F' }, warning: { light: '#7A5E1E', dark: '#E0C77E' } },
  },
  radius: { xs: '0.125rem', sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
  text: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.5rem' },
  spacing: {},
  shadow: {
    low: { light: '0 1px 2px rgba(0, 0, 0, 0.08)', dark: '0 1px 2px rgba(0, 0, 0, 0.4)' },
    pop: { light: '0 20px 32px rgba(0, 0, 0, 0.16)', dark: '0 20px 32px rgba(0, 0, 0, 0.5)' },
  },
  font: { sans: '"Fixture Sans", system-ui, sans-serif' },
  accents: {},
  source: {},
  shadcn: tokens.shadcn,
}

test('globals CSS declares :root light values and [data-theme="dark"] overrides', () => {
  const css = renderGlobals(fixture)
  assert.match(css, /:root\s*{/)
  assert.match(css, /\[data-theme="dark"\]\s*{/)
  assert.ok(css.includes(fixture.color.ground.base.light), 'light ground hex missing')
  assert.ok(css.includes(fixture.color.ground.base.dark), 'dark ground hex missing')
  assert.ok(!/classicLight|classicDark/.test(css), 'Quill 4-mode residue leaked into the port')
})

test('globals CSS maps shadcn variables through @theme inline', () => {
  const css = renderGlobals(fixture)
  assert.match(css, /@theme inline/)
  for (const key of Object.keys(fixture.shadcn)) {
    assert.ok(css.includes(`--${key}:`) || css.includes(`--color-${key}:`), `shadcn var '${key}' not emitted`)
  }
})

test('globals CSS anchors --radius on fixture.radius.lg and aliases the @theme lg step to it', () => {
  // Mirrors the registry-theme radius pin: the registry app must anchor on
  // the SAME --radius property a consumer inherits, or the two would disagree
  // on what "lg" means the moment either token value changes independently.
  const css = renderGlobals(fixture)
  const darkStart = css.indexOf('html[data-theme="dark"]')
  assert.notEqual(darkStart, -1, 'dark block marker not found — test fixture assumption broken')
  const [lightBlock, darkBlock] = [css.slice(0, darkStart), css.slice(darkStart)]
  assert.ok(
    lightBlock.includes(`  --radius: ${fixture.radius.lg};`),
    '--radius anchor missing from the light/root block',
  )
  assert.ok(!/--radius:\s/.test(darkBlock), '--radius must not be redeclared in the dark block')
  assert.ok(
    css.includes('  --radius-lg: var(--radius);'),
    '@theme --radius-lg must reference the --radius anchor by var(), not restate the literal — ' +
      'two independent literals could silently drift apart',
  )
  for (const step of ['xs', 'sm', 'md']) {
    assert.ok(
      css.includes(`  --radius-${step}: ${fixture.radius[step]};`),
      `@theme --radius-${step} must keep its explicit exact value — only lg is anchor-derived`,
    )
  }
})

test('registry theme CSS carries the exact @theme scales a consumer compiles against', () => {
  const css = renderRegistryTheme(fixture)
  const theme = css.slice(css.indexOf('@theme inline {'), css.indexOf('}'))
  assert.ok(theme.startsWith('@theme inline {'), 'the consumer-facing file now ships the @theme mapping')
  for (const [step, value] of Object.entries(fixture.radius)) {
    if (step !== 'lg') assert.ok(theme.includes(`  --radius-${step}: ${value};`), `rounded-${step} must compile to ${value}`)
  }
  for (const [step, value] of Object.entries(fixture.text)) assert.ok(theme.includes(`  --text-${step}: ${value};`))
  for (const key of Object.keys(fixture.shadow)) assert.ok(theme.includes(`  --shadow-${key}: var(--shadow-${key});`))
  assert.match(css, /\[data-theme="dark"\]/)
})

test('registry theme CSS anchors --radius on fixture.radius.lg, in the light block only', () => {
  // Pin for the radius-delivery change: a consumer's own stock `@theme`
  // computes every `--radius-*` step from this single variable via calc(), so
  // this is the only property that actually carries the client's roundness
  // into a consumer app. Dropping the line (or hardcoding a stock value like
  // 0.625rem instead of reading fixture.radius.lg) must fail this test —
  // verified by temporarily deleting the emitting line and re-running, see
  // the PR description; do not weaken this to a substring check that would
  // also pass on a stray unrelated `--radius:` elsewhere in the file.
  const css = renderRegistryTheme(fixture)
  const darkStart = css.indexOf('html[data-theme="dark"]')
  assert.notEqual(darkStart, -1, 'dark block marker not found — test fixture assumption broken')
  const [lightBlock, darkBlock] = [css.slice(0, darkStart), css.slice(darkStart)]
  assert.ok(
    lightBlock.includes(`  --radius: ${fixture.radius.lg};`),
    '--radius must be emitted in the light/root block, equal to fixture.radius.lg',
  )
  assert.ok(
    !/--radius:\s/.test(darkBlock),
    'radius is not a themed concept — --radius must NOT be redeclared in the dark block',
  )
})

test('theme selectors are html-scoped for specificity while keeping island support', () => {
  // Regression pin for the Task 10 E2E's most severe finding, in both
  // directions. A plain substring check (`css.includes(':root')`) would still
  // pass on a reverted bare `:root` — the exact form matters, not just
  // presence, because a consumer's `shadcn init` writes its own unlayered
  // `:root { --background: ... }` / `.dark { ... }` block into the SAME
  // globals.css our @import lands in. @import must precede other rules (CSS
  // spec), so it can never be moved after that block, and at tied (0,1,0)
  // specificity the LATER stock declaration always wins — silently, in both
  // themes, with no error anywhere a test could see. `html:root` bumps us to
  // (0,1,1) so we win regardless of source order.
  for (const css of [renderGlobals(fixture), renderRegistryTheme(fixture)]) {
    assert.ok(css.includes('html:root {'), 'light block must use the exact `html:root {` selector')
    assert.ok(
      css.includes('html[data-theme="dark"], [data-theme="dark"] {'),
      'dark block must keep BOTH the html-scoped arm (specificity, beats a same-file stock block) ' +
        'AND the bare attribute arm (island support — a scoped `<div data-theme="dark">` is never `<html>`, ' +
        'so `html[data-theme="dark"]` alone stops matching it)',
    )
    assert.ok(!/^:root\s*{/m.test(css), 'must not regress to a bare `:root` selector (loses the specificity fix)')
    assert.ok(
      !/^\[data-theme="dark"\]\s*{/m.test(css),
      'must not regress to a dark block with ONLY the bare attribute arm (loses the specificity fix and reopens the cascade bug)',
    )
  }
})

test('DTCG export uses $value/$type and round-trips both modes', () => {
  const dtcg = renderDtcg(fixture)
  const brand = dtcg.color.ground.base
  assert.equal(brand.$type, 'color')
  assert.equal(brand.$extensions.modes.light, fixture.color.ground.base.light)
  assert.equal(brand.$extensions.modes.dark, fixture.color.ground.base.dark)
  assert.equal(brand.$value, fixture.color.ground.base.light)
})

test('Storybook chrome is themed from the light token values', () => {
  const m = renderManager(fixture)
  assert.equal(m.brandTitle, fixture.meta.name.charAt(0).toUpperCase() + fixture.meta.name.slice(1))
  assert.equal(m.fontBase, fixture.font.sans)
  assert.equal(m.appBg, fixture.color.ground.base.light)
  assert.equal(m.colorPrimary, fixture.color.accent.base.light)
  assert.equal(m.textColor, fixture.color.text.primary.light)
  for (const [key, value] of Object.entries(m)) assert.equal(typeof value, 'string', `${key} must be a string`)
})

// Regression pin for the most severe defect Task 14's end-to-end run found:
// Storybook's manager theming (built on `polished`) only parses hex/rgb/hsl,
// and a DTCG capture legitimately names colors in oklch — renderManager used
// to forward that string untouched, which took the whole manager UI down to
// a blank page with no signal from `test-storybook` (it never loads the
// manager). Without this test, that defect has no automated guard at all.
test('renderManager converts every non-hex color (oklch) to a 6-digit hex, and leaves fontBase alone', () => {
  const oklchFixture = {
    ...fixture,
    color: {
      ...fixture.color,
      ground: { base: { light: 'oklch(0.97 0.01 100)', dark: 'oklch(0.1 0.01 100)' }, raised: { light: 'oklch(0.9 0.02 120)', dark: 'oklch(0.2 0.02 120)' } },
      surface: { ...fixture.color.surface, card: { light: 'oklch(0.85 0.03 140)', dark: 'oklch(0.25 0.03 140)' } },
      text: { primary: { light: 'oklch(0.2 0.01 250)', dark: 'oklch(0.9 0.01 250)' }, secondary: { light: 'oklch(0.4 0.01 250)', dark: 'oklch(0.7 0.01 250)' } },
      accent: { ...fixture.color.accent, base: { light: 'oklch(0.5 0.15 260)', dark: 'oklch(0.7 0.1 260)' }, text: { light: 'oklch(0.35 0.15 260)', dark: 'oklch(0.75 0.1 260)' } },
      line: { ...fixture.color.line, control: { light: 'oklch(0.5 0.02 250)', dark: 'oklch(0.6 0.02 250)' } },
    },
  }
  const m = renderManager(oklchFixture)
  const HEX = /^#[0-9A-F]{6}$/
  const colorFields = [
    'appBg', 'appContentBg', 'appPreviewBg', 'appBorderColor', 'barBg', 'barTextColor',
    'barSelectedColor', 'barHoverColor', 'colorPrimary', 'colorSecondary', 'textColor',
    'textMutedColor', 'textInverseColor', 'inputBg', 'inputBorder', 'inputTextColor',
  ]
  for (const key of colorFields) assert.match(m[key], HEX, `${key} should be a 6-digit hex, got '${m[key]}'`)
  assert.equal(m.fontBase, oklchFixture.font.sans, 'fontBase is not a color and must pass through untouched')
})

test('renderManager throws, naming the token, on a color parseColor cannot read', () => {
  const badFixture = {
    ...fixture,
    color: {
      ...fixture.color,
      accent: { ...fixture.color.accent, base: { light: 'color(display-p3 0.5 0.2 0.8)', dark: fixture.color.accent.base.dark } },
    },
  }
  assert.throws(() => renderManager(badFixture), /accent\.base/, 'must name the failing token path')
})

test('marker injection replaces only the marked region', () => {
  const file = `/* hand-written */\n${MARKER_START}\nOLD\n${MARKER_END}\n/* also hand-written */`
  const out = injectBetweenMarkers(file, 'NEW')
  assert.ok(out.includes('NEW') && !out.includes('OLD'))
  assert.ok(out.startsWith('/* hand-written */'))
  assert.ok(out.endsWith('/* also hand-written */'))
})

test('marker injection fails loudly on missing or malformed markers', () => {
  assert.throws(() => injectBetweenMarkers('no markers here', 'NEW'), /marker/i)
  assert.throws(() => injectBetweenMarkers(`${MARKER_START}\nonly a start\n`, 'NEW'), /marker/i)
  assert.throws(
    () => injectBetweenMarkers(`${MARKER_END}\nreversed\n${MARKER_START}`, 'NEW'),
    /marker/i,
    'reversed markers must throw rather than emit garbled output',
  )
})

// The fixture's own default mode, not a hardcoded 'light' — a system whose
// default mode is named something else must still be walked correctly.
const mapLeaves = (node, fn) =>
  Object.fromEntries(Object.entries(node).map(([k, v]) => [k, fixture.modes[0] in v ? fn(v) : mapLeaves(v, fn)]))
const multi = {
  ...fixture,
  modes: ['light', 'dark', 'dim'],
  color: mapLeaves(fixture.color, (leaf) => ({ ...leaf, dim: leaf.dark })),
  shadow: mapLeaves(fixture.shadow, (leaf) => ({ ...leaf, dim: leaf.dark })),
  spacing: { 4: '{space.4}' },
  source: {
    palette: { blue: { 600: { $type: 'color', $value: '#1F5FAD', $modes: { dark: '#8DB8EB', dim: '#8DB8EB' } } } },
    space: { 4: { $type: 'dimension', $value: '16px' } },
  },
  accents: { sunset: { color: { accent: { base: { light: '#B4441E', dark: '#F0A07F', dim: '#F0A07F' } } } } },
}
const name = tokens.meta.name

test('every mode and accent gets an html-scoped block that keeps its island arm', () => {
  const css = renderRegistryTheme(multi)
  assert.ok(css.includes('html[data-theme="dim"], [data-theme="dim"] {\n  color-scheme: dark;'))
  assert.ok(css.includes('html[data-accent="sunset"], [data-accent="sunset"] {'))
  // Four arms: the html-scoped and bare forms of the same-element case, the
  // mode nested under the accent, and — the reverse nesting this fix adds —
  // the accent nested under the mode, e.g. <html data-accent="sunset"><div
  // data-theme="dim">. Without the fourth arm that div matched only
  // `html[data-theme="dim"], [data-theme="dim"]`, which re-declares the base
  // semantic layer and silently reverts the accent inside that island.
  assert.ok(css.includes(
    'html[data-theme="dim"][data-accent="sunset"], [data-theme="dim"][data-accent="sunset"], ' +
      '[data-theme="dim"] [data-accent="sunset"], [data-accent="sunset"] [data-theme="dim"] {',
  ))
})

test('every theme block re-declares the shadcn aliases, so an island re-resolves them', () => {
  const blocks = renderRegistryTheme(multi).split('\n}\n').filter((block) => block.includes('--ground-base:'))
  assert.equal(blocks.length, 6, 'three modes, plus the accent in each')
  // Read the alias from the real map: Mantis points --primary at the source's
  // white button (approved at G1), not the template's var(--accent-base).
  for (const block of blocks) assert.ok(block.includes(`  --primary: ${tokens.shadcn.primary};`))
})

test('spacing and source tokens reach the @theme and the theme blocks', () => {
  const css = renderRegistryTheme(multi)
  const theme = css.slice(css.indexOf('@theme inline {'), css.indexOf('}'))
  assert.ok(theme.includes(`  --spacing-4: var(--${name}-space-4);`))
  assert.ok(css.includes(`  --${name}-palette-blue-600: #1F5FAD;`))
})

test('Storybook toolbars list every mode and accent', () => {
  assert.deepEqual(renderStorybookModes(multi), { themeModes: ['light', 'dark', 'dim'], accents: ['sunset'] })
})

test('animations declared in the token module ship in the theme with their keyframes', () => {
  const animated = {
    ...fixture,
    animate: { shimmer: 'shimmer 2s infinite' },
    keyframes: { shimmer: '  0% { transform: translateY(100%); }\n  100% { transform: translateY(-150%); }' },
  }
  const css = renderRegistryTheme(animated)
  assert.ok(css.includes('  --animate-shimmer: shimmer 2s infinite;'), 'animate-* utility missing from @theme')
  assert.ok(css.includes('@keyframes shimmer {'), 'keyframes missing from the theme file')
  assert.ok(!renderRegistryTheme(fixture).includes('@keyframes'), 'a module without keyframes must not emit any')
})

test('composite text styles emit size, line height, tracking and weight together', () => {
  const styled = { ...fixture, textStyles: { 'display-lg': { size: '3rem', lineHeight: '3.5rem', letterSpacing: '-0.02em', fontWeight: '700' } } }
  const css = renderRegistryTheme(styled)
  for (const line of ['--text-display-lg: 3rem;', '--text-display-lg--line-height: 3.5rem;', '--text-display-lg--letter-spacing: -0.02em;', '--text-display-lg--font-weight: 700;']) {
    assert.ok(css.includes(`  ${line}`), `missing ${line}`)
  }
})
