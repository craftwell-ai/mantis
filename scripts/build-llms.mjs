/**
 * Generates public/llms.txt — the machine-readable reasoning layer for this
 * design system — plus its two catalogs, llms-tokens.txt and
 * llms-components.txt. The index stays short so an agent can read it whole and
 * fetch only the catalog it needs.
 *
 * Everything here is derived from the single sources (token module, registry,
 * intent vocabulary, package version) so the file cannot drift from the system
 * it describes. `scripts/build-llms.test.mjs` fails CI if the committed file is
 * stale. Run `node scripts/build-llms.mjs` after touching tokens or the registry.
 *
 * Follows the llms.txt convention (llmstxt.org): H1 + blockquote + H2 sections.
 *
 * Ported from Quill DS's build-llms.mjs, which describes a four-theme,
 * four-accent, chart-heavy system. The Theming section here is generated the
 * same way Quill's was — from `tokens.modes` and `tokens.accents`, via the
 * shared `modesOf` helper — so it says exactly what a given token module
 * defines, whether that is this template's default two modes and no accents
 * or something larger a client has grown into. The chart bullets only render
 * if `tokens.color.chart` exists — it doesn't in the v1 template token set.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { tokens } from '../tokens/mantis.tokens.mjs'
import { INTENT_TAGS } from './registry-intent-tags.mjs'
import { ALL_USAGE } from '../usage/index.mjs'
import { modesOf, walkSource } from './token-model.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'))
const HOME = registry.homepage.replace(/\/$/, '')
const base = registry.items.find((i) => i.type === 'registry:base')

// The default theme sits at `html:root` (specificity 0,1,1) so it wins a
// collision with a consuming app's own bare `:root` rules — see the
// "Overriding a variable" bullet below.
const ROOT_LABEL = '`html:root`'

const link = (name) => `${HOME}/r/${name}.json`

// The index: what Mantis is, how to install and theme it, and where the
// detail lives. Kept short so an agent can read it whole; the token and
// component catalogs are their own files (llms-tokens.txt, llms-components.txt).
export function renderLlms(t = tokens) {
  const blocks = registry.items.filter((i) => i.type === 'registry:block')
  const primitives = registry.items.filter((i) => i.type === 'registry:ui')
  const L = []
  const p = (s = '') => L.push(s)
  const title = registry.name.charAt(0).toUpperCase() + registry.name.slice(1)

  p(`# ${title} Design System`)
  p()
  p(`> ${base.description} Version ${pkg.version}.`)
  p()
  p(`Install any item with the shadcn CLI: \`npx shadcn@latest add ${link(base.name)}\` for the base theme first, then components and blocks the same way. With the \`@${registry.name}\` registry in your components.json, \`npx shadcn@latest add @${registry.name}/<name>\` works too.`)
  p()

  const modes = modesOf(t)
  const accents = Object.keys(t.accents ?? {})
  const [first, second] = modes
  p('## Theming')
  p()
  if (modes.length === 1) {
    p(`- **One theme: \`${first}\`.** It ships at ${ROOT_LABEL} and applies everywhere. There is no other mode: never add a theme toggle, alternate-mode styles or \`data-theme\` islands.`)
  } else {
    p(
      `- **Themes** — ${modes.length}: ` +
        modes.map((m, i) => (i === 0 ? `\`${m}\` (${ROOT_LABEL}, default)` : `\`${m}\` (\`data-theme="${m}"\`)`)).join(', ') +
        `. Put the attribute on \`<html>\`, or on a container for an island inside a \`${first}\` page.`,
    )
    p(
      `- **Islands of a non-default theme only — the asymmetry is deliberate.** The CSS has a \`${first}\` block and one block per other theme, and **no \`[data-theme="${first}"]\` rule**. So \`<div data-theme="${second}">\` inside a \`${first}\` page switches, but \`<div data-theme="${first}">\` inside a \`${second}\` page does **not** switch back. Nest other themes inside the default, never the reverse.`,
    )
  }
  p(
    accents.length
      ? `- **Accents** — ${accents.map((a) => `\`${a}\``).join(', ')}, selected with \`data-accent="<name>"\` on \`<html>\` or a container, in any theme. Without the attribute you get the base accent.`
      : '- **Accent** — one: it lives under `color.accent` as ordinary values, not a runtime-switchable variant.',
  )
  p(`- **Overriding a variable in your app** — write \`html:root { --primary: … }\`, **not** \`:root { … }\`. The theme ships at ${ROOT_LABEL} (specificity 0,1,1), so a bare \`:root\` override (0,1,0) silently loses no matter where it appears in the cascade.`)
  p("- **Radius, type, spacing and shadow are exact.** The theme ships its own `@theme inline` block, so `rounded-*`, `text-*`, spacing utilities and `shadow-*` compile to this system's values — once you delete the `--radius-*` and `--font-sans` lines from your own `@theme inline` block (Tailwind resolves duplicate `@theme` keys last-wins, and yours comes after the `@import`).")
  p('- **Accessibility** — text ≥ 4.5:1, interactive/non-text ≥ 3:1 (WCAG 2.1 AA). Every token pair the components use is tested.')
  p()

  p('## Docs')
  p()
  p(`- [Components](${HOME}/llms-components.txt) — every component and block: what it is for, its intent tags, and its usage guide`)
  p(`- [Tokens](${HOME}/llms-tokens.txt) — the semantic color contract, type, radius, shadow and motion, and the source layer`)
  p()

  p('## Components')
  p()
  for (const u of primitives) p(`- [${u.title ?? u.name}](${link(u.name)})`)
  for (const b of blocks) p(`- [${b.title ?? b.name}](${link(b.name)}) — block`)
  p()

  p('## Usage guides')
  p()
  for (const u of ALL_USAGE) p(`- [${u.name}](${HOME}/usage/${u.name}.md)`)
  p()

  p('## Links')
  p()
  p(`- [Theme item](${link(base.name)}) — the token layer (install first)`)
  p(`- [Full registry index](${HOME}/r/registry.json)`)
  p()
  return L.join('\n')
}

export function renderLlmsTokens(t = tokens) {
  const L = []
  const p = (s = '') => L.push(s)
  p(`# ${registry.name} tokens`)
  p()
  p('> The token contract: semantic color variables components read, plus type, radius, shadow and motion. Every color is also a Tailwind utility (`bg-<name>`, `text-<name>`, `border-<name>`).')
  p()
  p('## Semantic colors')
  p()
  p('The shadcn variables map onto this system\'s color tokens: ' + Object.keys(t.shadcn).map((k) => `\`--${k}\``).join(', ') + '.')
  p()
  p('- **Accessibility** — text ≥ 4.5:1, interactive/non-text ≥ 3:1 (WCAG 2.1 AA).')
  if (t.color.chart) {
    // Honest by construction: no automated gate covers chart tokens, so these
    // bullets state the convention AND that it is unverified.
    p('- **Charts — no automated gate covers chart tokens.** The WCAG tests check text and non-text contrast only. Verify chart series by hand for contrast, colorblind-safety and separation.')
    p(`  - Categorical: \`--chart-1\`…\`--chart-${Object.keys(t.color.chart.series).length}\`. Assign in fixed order; never cycle or repaint survivors when a series is filtered out.`)
    p('  - Magnitude: `--chart-seq-1`…`--chart-seq-5` (one-hue sequential ramp).')
    p('  - Polarity: `--chart-div-1`…`--chart-div-5` (diverging ramp, neutral midpoint — never red/green).')
  }
  p()
  p('## Type, radius, shadow, motion')
  p()
  if (t.textStyles) p(`- **Text styles** (size, line height, weight, tracking in one class): ${Object.keys(t.textStyles).map((k) => `\`text-${k}\``).join(', ')}`)
  p(`- **Fonts:** ${Object.keys(t.font).map((k) => `\`font-${k}\``).join(', ')}`)
  p(`- **Radius:** ${Object.keys(t.radius).map((k) => `\`rounded-${k}\``).join(', ')}`)
  p(`- **Shadows:** ${Object.keys(t.shadow).map((k) => `\`shadow-${k}\``).join(', ')}`)
  if (t.animate) p(`- **Motion:** ${Object.keys(t.animate).map((k) => `\`animate-${k}\``).join(', ')}`)
  p()
  const groups = new Set()
  let sourceCount = 0
  walkSource(t.source, (path) => { sourceCount++; groups.add(path[0]) })
  if (sourceCount) {
    p('## Source layer')
    p()
    p(
      `${sourceCount} tokens under the reference's own names, as \`--${t.meta.name}-<group>-<token>\` custom properties. ` +
        `Components never read them directly (lint fails it); they reach the screen through the semantic tokens above. \`tokens/${t.meta.name}.tokens.json\` (DTCG) carries both layers. ` +
        `Groups: ${[...groups].map((g) => `\`${g}\``).join(', ')}.`,
    )
    p()
  }
  return L.join('\n')
}

export function renderLlmsComponents() {
  const blocks = registry.items.filter((i) => i.type === 'registry:block')
  const primitives = registry.items.filter((i) => i.type === 'registry:ui')
  const byName = Object.fromEntries(ALL_USAGE.map((u) => [u.name, u]))
  const L = []
  const p = (s = '') => L.push(s)
  p(`# ${registry.name} components`)
  p()
  p('> Every component and block in the registry: what it looks like, when to use it, and where its full usage guide lives.')
  p()
  p('## Primitives')
  p()
  p('Installed with the base item; blocks build on them.')
  p()
  for (const u of primitives) {
    const guide = byName[u.name]
    p(`- [${u.title ?? u.name}](${link(u.name)}) — ${u.description}${guide ? ` Use when: ${guide.useWhen[0]} [Guide](${HOME}/usage/${u.name}.md)` : ''}`)
  }
  p()
  // Non-visual items: the cn helper, the agent guide, and the templates' sample content.
  const libs = registry.items.filter((i) => ['registry:lib', 'registry:file', 'registry:component'].includes(i.type))
  if (libs.length) {
    p('## Helpers')
    p()
    for (const u of libs) p(`- [${u.title ?? u.name}](${link(u.name)}) — ${u.description}`)
    p()
  }
  p('## Blocks')
  p()
  p('Compositions of primitives. `intent` lists the jobs a block does; `use_when` says when to reach for it.')
  p()
  for (const b of blocks) {
    const intent = (b.meta?.intent ?? []).join(', ')
    p(`- [${b.title ?? b.name}](${link(b.name)}) — _[${intent}]_ ${b.meta?.use_when ?? b.description}`)
  }
  p()
  p('## Intent vocabulary')
  p()
  for (const [tag, def] of Object.entries(INTENT_TAGS)) p(`- \`${tag}\` — ${def}`)
  p()
  return L.join('\n')
}

export const LLMS_PATH = join(root, 'public/llms.txt')
export const LLMS_TOKENS_PATH = join(root, 'public/llms-tokens.txt')
export const LLMS_COMPONENTS_PATH = join(root, 'public/llms-components.txt')

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(LLMS_PATH, renderLlms())
  writeFileSync(LLMS_TOKENS_PATH, renderLlmsTokens())
  writeFileSync(LLMS_COMPONENTS_PATH, renderLlmsComponents())
  console.log('wrote public/llms.txt, llms-tokens.txt, llms-components.txt')
}
