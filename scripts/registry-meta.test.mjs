import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { tokens } from '../tokens/mantis.tokens.mjs'
import { INTENT_TAG_NAMES } from './registry-intent-tags.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'))
const blocks = registry.items.filter((i) => i.type === 'registry:block')
const bases = registry.items.filter((i) => i.type === 'registry:base')

// The base item's `meta.usage` is the ONLY thing a future consumer — a
// different agent, or a human months later in another project — ever reads
// about integration. Four steps are manual and every one of them fails
// SILENTLY when skipped, so a length check alone is not enough: a plausible
// paragraph that omits, say, the `data-theme` attribute ships a repo whose
// dark mode simply does not exist and says nothing about why. Each topic below
// is therefore asserted by a marker that the real instruction cannot avoid
// containing. Keep the regexes tolerant of wording; keep the topic list closed.
const BASE_USAGE_TOPICS = [
  [
    'importing the theme CSS',
    /@import/,
    '`shadcn add` copies the registry:base file but never adds the @import — say so, and say it must go at the top with the other @import rules',
  ],
  [
    "removing shadcn init's competing :root / .dark block",
    /\.dark/,
    "shadcn init writes a second source of truth for the same variable names into the same globals.css; name the properties to delete, say the `.dark` block goes entirely, and say --radius/--chart-*/--sidebar-* stay",
  ],
  [
    'setting data-theme on <html>',
    /data-theme/,
    'dark mode does not exist without the attribute — it is required, not a convention',
  ],
  [
    'loading the font',
    /font/i,
    'the font arrives through a manual path, not the theme CSS, and a missing font falls back silently rather than erroring',
  ],
  [
    'the light-island asymmetry',
    // Deliberately does NOT accept a bare `data-theme="light"`. That string is
    // satisfied by any sentence merely listing the attribute's values (e.g. a
    // step 3 reworded to `SET data-theme="light" or data-theme="dark"`), which
    // would let the whole asymmetry go undocumented while the gate stayed
    // green — demonstrated, not hypothetical. The markers below can only be
    // written by prose that is actually making the claim.
    /light island|light-island|dark islands only|not switch back/i,
    'only a dark arm is emitted, so `<div data-theme="light">` inside a dark page does NOT switch back — consumers hit this and have no other way to learn it. Naming the attribute value is not enough; state the asymmetry',
  ],
  [
    'the override recipe',
    /html:root/,
    'the light block ships at `html:root` (0,1,1), so a consumer override written as bare `:root` (0,1,0) silently loses — tell them to use `html:root`',
  ],
]

test('every block carries a machine-readable intent tag from the controlled vocabulary', () => {
  for (const b of blocks) {
    const intent = b.meta?.intent
    assert.ok(
      Array.isArray(intent) && intent.length > 0,
      `block '${b.name}' is missing meta.intent — every block must declare at least one intent tag`,
    )
    for (const tag of intent) {
      assert.ok(
        INTENT_TAG_NAMES.includes(tag),
        `block '${b.name}' uses intent '${tag}', which is not in the controlled vocabulary (scripts/registry-intent-tags.mjs)`,
      )
    }
  }
})

test('every block explains when to use it (meta.use_when)', () => {
  for (const b of blocks) {
    const useWhen = b.meta?.use_when
    assert.ok(
      typeof useWhen === 'string' && useWhen.trim().length >= 20,
      `block '${b.name}' needs a substantive meta.use_when sentence for AI/agent selection`,
    )
  }
})

test('the registry has a base item', () => {
  // scripts/build-llms.mjs does `items.find(i => i.type === 'registry:base')`
  // and immediately reads `.description` off it — a registry with no base item
  // crashes the llms build, and there is nothing for a consumer to install first.
  assert.ok(bases.length > 0, "registry.json has no 'registry:base' item — the one-install entry point is missing")
})

test('every base item declares its component roster via registryDependencies', () => {
  // Found missing entirely in a Task 2 E2E run: templates/registry.json's base
  // item shipped with no registryDependencies key at all, so `shadcn add
  // @<name>/base` installed only the theme CSS and none of the roster
  // primitives — silently, since a missing/empty array is not a CLI error.
  // No other test in this file catches that; the base item's job (SKILL.md
  // Step 2 — "the primitives are not vendored... they are listed as
  // registryDependencies on the base item") depends entirely on this key.
  //
  // Deliberately NOT asserting the list equals Step 2's default roster
  // exactly: the roster is meant to be trimmed or extended per client (Step 2
  // says confirm it with the user before scaffolding, and Step 2's own `form`
  // caveat expects some clients to drop it). A fixed-roster assertion here
  // would fail on every legitimate customization; a generated client repo
  // carries this same test file forward; and a fixed base roster provides
  // less coverage against the exact failure that occurred. Non-empty-array is
  // the check that catches "the field disappeared" without also rejecting the
  // procedure's own designed flexibility.
  for (const b of bases) {
    const deps = b.registryDependencies
    assert.ok(
      Array.isArray(deps) && deps.length > 0,
      `base item '${b.name}' has no non-empty registryDependencies — the roster it is supposed to be the one-install entry point for` +
        ' will not actually install (SKILL.md Step 2)',
    )
    for (const dep of deps) {
      assert.ok(
        typeof dep === 'string' && dep.trim().length > 0,
        `base item '${b.name}' has a registryDependencies entry that is not a non-empty string: ${JSON.stringify(dep)}`,
      )
    }
  }
})

test('every base item carries a meta.usage that covers the manual consumer steps', () => {
  for (const b of bases) {
    const usage = b.meta?.usage
    assert.ok(
      typeof usage === 'string',
      `base item '${b.name}' has no meta.usage string — it is the only integration instruction a downstream consumer ever sees`,
    )
    assert.ok(
      usage.trim().length >= 400,
      `base item '${b.name}' has a stub meta.usage (${usage.trim().length} chars) — it must actually spell out the manual integration steps, not gesture at them`,
    )
    for (const [topic, marker, why] of BASE_USAGE_TOPICS) {
      assert.ok(
        marker.test(usage),
        `base item '${b.name}' meta.usage never covers ${topic} — ${why}`,
      )
    }
  }
})

test('no registry file reads the source layer — semantic tokens only', () => {
  // Same condition the WCAG suite's source-layer exemption rests on. The theme
  // CSS is the one file that declares these properties, so it is skipped.
  const theme = `registry/${tokens.meta.name}-theme.css`
  const paths = registry.items.flatMap((item) => (item.files ?? []).map((f) => f.path)).filter((p) => p !== theme)
  for (const path of paths) {
    const text = readFileSync(join(root, path), 'utf8')
    assert.ok(
      !text.includes(`--${tokens.meta.name}-`),
      `${path} reads a source-layer token (--${tokens.meta.name}-…). Route it through a semantic role and a shadcn alias.`,
    )
  }
})

// Mantis owns a growing set of primitives (its look differs from stock shadcn),
// so the rule is general rather than a fixed list: no owned component uses
// Lucide, any that draws icons depends on this registry's icon item, and base
// installs this registry's copy of every owned primitive, never shadcn's stock one.
test('owned primitives draw Material Symbols through Icon, never Lucide', () => {
  const owned = registry.items.filter((item) => item.type === 'registry:ui' && item.name !== 'icon')
  for (const name of ['dialog', 'dropdown-menu', 'sonner']) {
    assert.ok(owned.some((item) => item.name === name), `this registry must ship its own ${name}`)
  }
  for (const item of owned) {
    for (const file of item.files) {
      const text = readFileSync(join(root, file.path), 'utf8')
      assert.ok(!text.includes('lucide-react'), `${file.path} still imports lucide-react`)
      if (/from ["']@\/components\/ui\/icon["']/.test(text)) {
        assert.ok(item.registryDependencies?.some((dep) => dep.endsWith('/icon')), `${item.name} draws icons, so it must depend on this registry's icon item`)
      }
    }
  }
  for (const name of ['dialog', 'dropdown-menu', 'sonner']) {
    const text = readFileSync(join(root, `components/ui/${name}.tsx`), 'utf8')
    assert.match(text, /from ["']@\/components\/ui\/icon["']/, `components/ui/${name}.tsx must draw its icons with Icon`)
  }
  const base = bases[0]
  for (const { name } of owned) {
    if (!base.registryDependencies.some((dep) => dep === name || dep.endsWith(`/${name}`))) continue
    assert.ok(base.registryDependencies.some((dep) => dep.endsWith(`/${name}`)), `base must install this registry's ${name}, not shadcn's`)
    assert.ok(!base.registryDependencies.includes(name), `base still pulls shadcn's stock ${name}`)
  }
})

test('every @mantis/* dependency names an item this registry ships', () => {
  // A dangling @mantis/<name> makes `shadcn add` fail in the consumer's app.
  const names = new Set(registry.items.map((item) => item.name))
  for (const item of registry.items) {
    for (const dep of item.registryDependencies ?? []) {
      if (!dep.startsWith('@mantis/')) continue
      assert.ok(names.has(dep.slice('@mantis/'.length)), `${item.name} depends on ${dep}, which registry.json does not define`)
    }
  }
})
