/**
 * Token build step — TEMPLATE, copied verbatim into every generated client
 * repo. Reads the single token source (tokens/<name>.tokens.mjs) and emits
 * the artifacts every consumer needs: globals.css (Tailwind v4 `@theme inline`
 * + `html:root` + one `html[data-theme]`/`html[data-accent]` block per mode
 * and accent) via marker injection into the app's existing file, a
 * `registry:base` theme CSS for shadcn distribution carrying that same
 * `@theme inline`, a DTCG export for design-tool round-tripping, and the
 * Storybook manager theme plus the mode/accent lists its toolbars read.
 *
 * Emits every mode in `tokens.modes`, every accent in `tokens.accents`, and
 * the whole source layer (`tokens/mantis.tokens.mjs`'s `source`) — not just the
 * light/dark pair Quill DS's build-tokens.mjs (this file's ancestor) shipped.
 * The registry theme and globals.css now share one `@theme inline`: a
 * consumer's `rounded-*`, `text-*`, spacing and `shadow-*` utilities compile
 * to this system's own exact values, once meta.usage's step 2 deletes the
 * stock `@theme` lines that define the same keys.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tokens } from '../tokens/mantis.tokens.mjs'
import { modesOf, themeBlocks, cssValue, cssLiteral, resolveValue } from './token-model.mjs'
import { exportDtcg } from './dtcg-io.mjs'
import { toHex, parseColor } from './contrast.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

export const MARKER_START = '/* @tokens:start */'
export const MARKER_END = '/* @tokens:end */'

// Selector LIST, not a single compound selector — CSS computes specificity
// per complex selector in the list, so each arm keeps its own job:
//   html[data-theme="dark"]  — specificity (0,1,1), wins the cascade tie
//                              against a same-file, same-specificity stock
//                              `:root`/`.dark` block (see renderGlobals below).
//   [data-theme="dark"]      — specificity (0,1,0), the ORIGINAL bare form,
//                              kept so a scoped island — a `<div
//                              data-theme="dark">` inside an otherwise-light
//                              page — still matches. `html[data-theme="dark"]`
//                              alone only matches when the attribute sits on
//                              `<html>` itself; an island div is never
//                              `<html>`, so without this second arm dark
//                              islands silently stopped switching (a real
//                              regression, caught by the reviewer, not
//                              hypothetical: SKILL.md's own `@custom-variant
//                              dark (&:where([data-theme="dark"],
//                              [data-theme="dark"] *))` explicitly documents
//                              island support as part of the contract).

// `html:root` rather than bare `:root` — one extra type selector, specificity
// (0,1,1) instead of (0,1,0). Verified necessary against a real consumer
// (Task 10 E2E): `shadcn init` writes its own unlayered `:root { --background:
// oklch(...) }` / `.dark { ... }` block into the SAME globals.css our
// `@import` lands in. Since `@import` must precede other rules (CSS spec), it
// can never be re-ordered to come after that block, so at equal (0,1,0)
// specificity the LATER stock declaration always wins the cascade tie — every
// alias (`--background`, `--card`, ...) silently stayed on the consumer's
// stock light/dark theme, in both modes, with no error anywhere.
//
// This is belt-and-braces, not the primary fix, and it has a real limit:
// (0,1,1) beats an ACCIDENTAL same-specificity collision (the stock block
// above), but it also beats a DELIBERATE later `:root { ... }` a consumer
// writes on purpose — that override is silently ignored too, by the same
// mechanism. The principled fix is SKILL.md Step 7's instruction to delete
// the stock `:root`/`.dark` block from the consumer's globals.css so there is
// only one source of truth; this specificity bump exists for the run where
// that step gets skipped, not as a substitute for it.

// Selectors — each arm has one job (see the two notes above):
//   default mode        html:root
//   mode m              html[data-theme="m"], [data-theme="m"]
//   accent a            html[data-accent="a"], [data-accent="a"]
//   accent a in mode m  html[data-theme="m"][data-accent="a"], [data-theme="m"][data-accent="a"], [data-theme="m"] [data-accent="a"]
// The html-qualified arms win the same-file collision with shadcn init's stock
// block; the bare arms keep scoped islands working. An accent-in-mode arm is
// (0,2,x), so it outranks both its mode block and its accent's default block.
function selectorFor(block, first) {
  const theme = `[data-theme="${block.mode}"]`
  const accent = `[data-accent="${block.accent}"]`
  if (!block.accent) return block.mode === first ? 'html:root' : `html${theme}, ${theme}`
  if (block.mode === first) return `html${accent}, ${accent}`
  // The html-qualified equivalent of the bespoke fix: add the descendant arm
  // in the other order. Without it, `<html data-accent="x">` wrapping
  // `<div data-theme="dim">` matched only `html${theme}, ${theme}`, which
  // re-declares the base semantic layer and silently reverts the accent
  // inside that island. This block already follows the mode-only block in
  // source order, so it wins the cascade correctly once it actually matches.
  return `html${theme}${accent}, ${theme}${accent}, ${theme} ${accent}, ${accent} ${theme}`
}

function buildCss(t) {
  const [first] = modesOf(t)
  // Aliases are re-declared in every block: a custom property inherits its
  // already-substituted value, so `--primary: var(--accent-base)` declared on
  // html:root would keep the default answer inside a [data-theme] or
  // [data-accent] island unless the island declares it again.
  const aliasLines = Object.entries(t.shadcn).map(([key, value]) => `  --${key}: ${value};`)
  const blocks = themeBlocks(t).map((block) => {
    const lines = block.declarations.map(([name, value]) => `  ${name}: ${value};`)
    // `--radius` stays the one runtime knob a consumer's stock calc() scale
    // reads, anchored on `lg` (unchanged — see meta.usage); default block only.
    if (!block.accent && block.mode === first) lines.push(`  --radius: ${cssValue(t, t.radius.lg)};`)
    // Durations are plain variables: Tailwind has no duration theme key, so
    // components read them as duration-(--duration-normal).
    if (!block.accent && block.mode === first) lines.push(...Object.entries(t.motion?.duration ?? {}).map(([key, value]) => `  --duration-${key}: ${cssValue(t, value)};`))
    lines.push(...aliasLines)
    const scheme = !block.accent && block.mode !== first ? `  color-scheme: ${block.scheme};\n\n` : ''
    return `${selectorFor(block, first)} {\n${scheme}${lines.join('\n')}\n}`
  })
  const theme = [
    ...Object.entries(t.font).map(([key, value]) => `  --font-${key}: ${cssLiteral(t, 'fontFamily', value)};`),
    ...Object.keys(t.shadcn).map((key) => `  --color-${key}: var(--${key});`),
    ...Object.entries(t.radius).map(([key, value]) => (key === 'lg' ? '  --radius-lg: var(--radius);' : `  --radius-${key}: ${cssValue(t, value)};`)),
    ...Object.entries(t.text).map(([key, value]) => `  --text-${key}: ${cssValue(t, value)};`),
    ...Object.entries(t.spacing ?? {}).map(([key, value]) => `  --spacing-${key}: ${cssValue(t, value)};`),
    ...Object.keys(t.shadow).map((key) => `  --shadow-${key}: var(--shadow-${key});`),
    // Optional composite type styles: size plus line height, tracking and weight.
    ...Object.entries(t.textStyles ?? {}).flatMap(([key, style]) => [
      `  --text-${key}: ${style.size};`,
      style.lineHeight && `  --text-${key}--line-height: ${style.lineHeight};`,
      style.letterSpacing && `  --text-${key}--letter-spacing: ${style.letterSpacing};`,
      style.fontWeight && `  --text-${key}--font-weight: ${style.fontWeight};`,
    ].filter(Boolean)),
    // Optional motion: tokens.animate names become animate-* utilities.
    ...Object.entries(t.animate ?? {}).map(([key, value]) => `  --animate-${key}: ${value};`),
    // Optional backdrop blur and easing: backdrop-blur-* and ease-* utilities.
    ...Object.entries(t.blur ?? {}).map(([key, value]) => `  --blur-${key}: ${value};`),
    ...Object.entries(t.motion?.ease ?? {}).map(([key, value]) => `  --ease-${key}: ${cssValue(t, value)};`),
  ]
  return { theme: theme.join('\n'), blocks: blocks.join('\n\n') }
}

export function renderGlobals(t) {
  const css = buildCss(t)
  // Keyframes ship with the theme so a consumer's animate-* utilities work.
  const keyframes = Object.entries(t.keyframes ?? {}).map(([name, body]) => `@keyframes ${name} {\n${body}\n}`).join("\n\n")
  return `@theme inline {\n${css.theme}\n}\n\n${css.blocks}\n${keyframes ? `\n${keyframes}\n` : ""}`
}

// The file a consumer imports now carries the same @theme mapping, so their
// rounded-*, text-*, spacing and shadow-* utilities compile to this system's
// exact values — once they delete the stock @theme lines that define the same
// keys. Tailwind resolves duplicate @theme keys last-wins and their block comes
// after our @import, so a stock line left in place silently wins; meta.usage
// step 2 names the lines.
export function renderRegistryTheme(t) {
  return renderGlobals(t)
}

export function injectBetweenMarkers(fileText, generated) {
  const start = fileText.indexOf(MARKER_START)
  const end = fileText.indexOf(MARKER_END)
  // A reversed pair (END before START) still passes two indexOf !== -1 checks,
  // so it needs its own guard — without it, the slice below produces garbled
  // duplicate output instead of failing loudly.
  if (start === -1 || end === -1 || start > end) {
    throw new Error('injectBetweenMarkers: markers not found or out of order')
  }
  return fileText.slice(0, start + MARKER_START.length) + '\n' + generated + '\n' + fileText.slice(end)
}

export const renderDtcg = exportDtcg

// --- Storybook manager theme ---
// Storybook's own chrome (sidebar, toolbar, docs pages) reads as this system
// rather than Storybook's default blue. Default-mode values only: the manager
// UI is a single theme; the stories themselves switch through the toolbar.
export function renderManager(t) {
  const [first] = modesOf(t)
  // Storybook's manager theming is built on `polished`, which only parses
  // hex/rgb/hsl — it throws (PolishedError #5, `parseToRgb`) on an oklch()/
  // oklab()/color() string and takes the whole manager UI down with it (a
  // blank page, verified — the story PREVIEWS still render fine in
  // `test-storybook`'s isolated vitest context, which never loads the
  // manager, so this is invisible to that gate). A capture that names
  // colors in oklch (the DTCG 2025 shape this engine now imports) reaches
  // here unless normalized, so route every manager color through the same
  // hex conversion the WCAG suite already trusts.
  //
  // Only ONE shape is safe to hand through unconverted: a translucent color
  // (alpha < 1) — `toHex` refuses those on purpose (compositing over a
  // ground is the caller's job), but Storybook's manager renders `rgba()`
  // natively, and the one color role that is genuinely translucent by
  // design, `color.line.base`, is never one of the fields this function
  // reads. Everything else `parseColor` cannot read — a DTCG
  // `color(display-p3 …)` value (`dtcg-io.mjs`'s `colorText()` emits that
  // verbatim for any color space outside srgb/oklch/oklab), a named color
  // like `rebeccapurple`, a typo — is NOT safe to forward: that is exactly
  // the shape of string that broke the manager UI in the first place, so an
  // unreadable color throws here, naming the token and the value, rather
  // than reaching `polished` disguised as a "fallback".
  const hex = (value, path) => {
    const parsed = parseColor(value)
    if (!parsed) throw new Error(`renderManager: color.${path} = '${value}' is not a color parseColor/toHex can read`)
    if (parsed.a < 1) return value
    return toHex(value)
  }
  const L = (leaf, path) => hex(resolveValue(t, leaf[first], first), path)
  return {
    brandTitle: t.meta.name.charAt(0).toUpperCase() + t.meta.name.slice(1),
    fontBase: cssLiteral(t, 'fontFamily', resolveValue(t, t.font.sans, first)),
    appBg: L(t.color.ground.base, 'ground.base'),
    appContentBg: L(t.color.ground.base, 'ground.base'),
    appPreviewBg: L(t.color.ground.base, 'ground.base'),
    appBorderColor: L(t.color.line.control, 'line.control'),
    barBg: L(t.color.ground.raised, 'ground.raised'),
    barTextColor: L(t.color.text.secondary, 'text.secondary'),
    barSelectedColor: L(t.color.accent.text, 'accent.text'),
    barHoverColor: L(t.color.accent.text, 'accent.text'),
    colorPrimary: L(t.color.accent.base, 'accent.base'),
    colorSecondary: L(t.color.accent.base, 'accent.base'),
    textColor: L(t.color.text.primary, 'text.primary'),
    textMutedColor: L(t.color.text.secondary, 'text.secondary'),
    textInverseColor: L(t.color.ground.base, 'ground.base'),
    inputBg: L(t.color.surface.card, 'surface.card'),
    inputBorder: L(t.color.line.control, 'line.control'),
    inputTextColor: L(t.color.text.primary, 'text.primary'),
  }
}

// The theme and accent toolbars in .storybook/preview.tsx read these, so a
// third mode or a brand variant shows up there without a code change.
export function renderStorybookModes(t) {
  return { themeModes: modesOf(t), accents: Object.keys(t.accents ?? {}) }
}

// --- main (not exercised by unit tests) ---
function main() {
  // The template package itself is not a Next.js app, so it has no
  // app/globals.css to inject into — but every generated client repo (built
  // from the shadcn registry-template) does. Skip injection rather than
  // failing hard, so this script is runnable both here and post-generation.
  const globalsPath = join(root, 'app/globals.css')
  if (existsSync(globalsPath)) {
    writeFileSync(globalsPath, injectBetweenMarkers(readFileSync(globalsPath, 'utf8'), renderGlobals(tokens)))
  } else {
    console.log('build-tokens: app/globals.css not found — skipped globals injection')
  }

  const registryDir = join(root, 'registry')
  mkdirSync(registryDir, { recursive: true })
  writeFileSync(join(registryDir, `${tokens.meta.name}-theme.css`), renderRegistryTheme(tokens))

  const tokensDir = join(root, 'tokens')
  mkdirSync(tokensDir, { recursive: true })
  writeFileSync(join(tokensDir, `${tokens.meta.name}.tokens.json`), JSON.stringify(renderDtcg(tokens), null, 2) + '\n')

  const storybookDir = join(root, '.storybook')
  mkdirSync(storybookDir, { recursive: true })
  const { themeModes, accents } = renderStorybookModes(tokens)
  writeFileSync(
    join(storybookDir, 'manager-theme.generated.mjs'),
    '// GENERATED by scripts/build-tokens.mjs — do not edit.\n' +
      `export const managerTheme = ${JSON.stringify(renderManager(tokens), null, 2)}\n` +
      `export const themeModes = ${JSON.stringify(themeModes)}\n` +
      `export const accents = ${JSON.stringify(accents)}\n`,
  )
}

if (import.meta.url === `file://${process.argv[1]}`) main()
