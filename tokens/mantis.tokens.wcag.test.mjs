import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tokens } from './mantis.tokens.mjs'
import { contrast } from '../scripts/contrast.mjs'
import { modesOf, resolveValue, walkSource, applyAccent, semanticLeaves } from '../scripts/token-model.mjs'

const MODES = modesOf(tokens)
// A semantic leaf holds one value per mode — always a string. A group nests
// further objects instead. Testing the VALUES' shape, not a key name, means a
// default mode named 'base' or 'card' (an ordinary Figma collection name that
// also happens to be a token role) can never be mistaken for a leaf.
const isLeaf = (v) => v && typeof v === 'object' && Object.keys(v).length > 0 && Object.values(v).every((x) => typeof x === 'string')

// The base system and every accent over it: each is something a person can
// select, so each is held to the same thresholds.
const VIEWS = [
  ['base', tokens],
  ...Object.keys(tokens.accents ?? {}).map((name) => [`accent '${name}'`, applyAccent(tokens, name)]),
]
// A value may alias the source layer; resolve it in that mode before measuring.
const at = (view, value, mode) => resolveValue(view, value, mode)

/** Every color leaf's dotted path, relative to `tokens.color` (`text.primary`, …). */
const colorLeafPaths = () => {
  const out = []
  const walk = (node, path) => {
    for (const [k, v] of Object.entries(node)) {
      const p = path ? `${path}.${k}` : k
      if (isLeaf(v)) out.push(p)
      else if (v && typeof v === 'object') walk(v, p)
    }
  }
  walk(tokens.color, '')
  return out.sort()
}

// Color leaves that no contrast assertion reaches, each with the ruling that
// says so. THE LEDGER BELOW IS THE POINT, not the entry in it: `accent.base`
// reached a final review as a CRITICAL not because a threshold was wrong but
// because nothing referenced it at all, and an unreached leaf is
// indistinguishable from a passing one in a green suite. The completeness
// assertion at the end of the structural-parity test closes that class — a leaf
// is either named by one of the three contrast tests below or it is listed
// here, in words, and a new leaf that is neither fails the build.
// The SOURCE LAYER is exempt as a class, and this is the ruling: its raw steps
// (a full palette ramp, say) reach the screen only through a semantic role in
// tokens.color, because no generated component reads a source token directly —
// scripts/styling-contract.test.mjs (bespoke) and scripts/registry-meta.test.mjs
// (init) fail if one does. Every role is measured below, in every mode and every
// accent, with its aliases resolved. A step nothing routes to is a swatch in
// the documentation, not text or a control.
const CONTRAST_EXEMPT = {
  'line.base':
    'Decoration and non-identifying separation only. `tokens.shadcn` routes it to the `border` slot, which ' +
    'shadcn spends on card and popover edges, separators and table rules — decoration, or a boundary on a ' +
    'control that is identified by its own visible text label. WCAG 2.1 SC 1.4.11 requires 3:1 only for visual ' +
    'information REQUIRED to identify a component or its state, so none of these needs a 3:1 boundary. The one ' +
    'boundary that IS the sole identifier of a control — the border of an empty text input, shadcn\'s `input` ' +
    'slot — routes to `line.control`, which IS held to 3:1 on every ground below. Measured as shipped, ' +
    'composited over the four grounds: 1.30-1.31:1 light, 1.45-1.48:1 dark. Raising it to clear 3:1 would turn ' +
    'every hairline a consumer inherits into a heavy rule, which is a design regression bought for a criterion ' +
    'that does not apply — so the right move here was to write the ruling down, not to move the value or narrow ' +
    'a gate around it. Two mechanical facts for whoever revisits this: `contrast()` reads any OPAQUE CSS color ' +
    '(hex, rgb(), hsl(), oklch(), oklab()) and returns NaN on the rgba() form this leaf ships, so it cannot be ' +
    'dropped into any loop below without compositing it over the ground first (it would fail loudly rather than ' +
    'pass silently); and `deriveDarkRamp` copies a non-hex light value straight into `dark`, which is why ' +
    "references/ingestion.md §6d's rgba hand-pass is mandatory.",
}

test('every color leaf carries both modes (structural parity)', () => {
  const walk = (obj, path) => {
    for (const [k, v] of Object.entries(obj)) {
      if (isLeaf(v)) {
        for (const m of MODES) assert.equal(typeof v[m], 'string', `${path}.${k} missing mode '${m}'`)
        // Parity in the other direction: an EXTRA key the source layer's own
        // guard below already catches on itself, but nothing caught it here.
        // splitFigmaCollections returns modes: ['light'] when no theme
        // collection is named (a live-URL harvest of a site with no dark
        // rules does the same); an agent then derives dark and pastes it in
        // without anyone setting tokens.modes back to ['light', 'dark'] — the
        // client ships with no dark mode at all and the derived values are
        // never measured. A key on a leaf that MODES does not know about is
        // exactly that: silently unmeasured, unshipped-as-a-theme data.
        for (const m of Object.keys(v)) assert.ok(MODES.includes(m), `${path}.${k} has a '${m}' value, but '${m}' is not in tokens.modes`)
      } else if (v && typeof v === 'object') walk(v, `${path}.${k}`)
    }
  }
  walk(tokens.color, 'color')
  walk(tokens.shadow, 'shadow')

  // The second structural guarantee: parity of COVERAGE, not just of modes.
  // Folded in here rather than added as a seventh test because the token glob
  // is pinned at 6/6 in SKILL.md and references/ingestion.md §6f, and a check
  // is not worth silently invalidating a documented count over.
  const covered = new Set(
    [...groundsFor('light'), ...inksFor('light'), ...accentFillsFor('light'), ...marksFor('light')].map(([n]) => n),
  )
  const leaves = colorLeafPaths()
  for (const leaf of leaves) {
    assert.ok(
      covered.has(leaf) || leaf in CONTRAST_EXEMPT,
      `color.${leaf} is reached by no contrast assertion in this file and carries no exemption. That is exactly ` +
        `how 'accent.base' shipped below 4.5:1 with this suite green — it was not judged safe, it was simply ` +
        `never looked at. Give it a role in references/ingestion.md §6b and add it to the ink, accent-fill or ` +
        `non-text-mark list below, or add it to CONTRAST_EXEMPT with the written reason it needs no threshold.`,
    )
  }
  for (const [leaf, reason] of Object.entries(CONTRAST_EXEMPT)) {
    assert.ok(leaves.includes(leaf), `CONTRAST_EXEMPT names color.${leaf}, which is not in the token tree`)
    assert.ok(
      !covered.has(leaf),
      `color.${leaf} is BOTH asserted and exempted — drop the exemption, it now reads as a licence that isn't one`,
    )
    assert.ok(reason.length > 0, `CONTRAST_EXEMPT['${leaf}'] must carry a reason, not an empty string`)
  }

  // Every alias resolves in every mode (resolveValue throws, naming the alias).
  for (const [, leaf] of semanticLeaves(tokens)) for (const m of MODES) resolveValue(tokens, leaf[m], m)
  for (const group of [tokens.radius, tokens.text, tokens.spacing ?? {}, tokens.font]) {
    for (const value of Object.values(group)) resolveValue(tokens, value, MODES[0])
  }
  walkSource(tokens.source, (path, leaf) => {
    for (const m of Object.keys(leaf.$modes ?? {})) {
      assert.ok(MODES.includes(m), `source.${path.join('.')} has a '${m}' value, but '${m}' is not in tokens.modes`)
    }
    for (const m of MODES) resolveValue(tokens, `{${path.join('.')}}`, m)
  })
  // An accent's color overrides need every mode, like the leaves they replace.
  for (const [name, spec] of Object.entries(tokens.accents ?? {})) walk(spec.color ?? {}, `accents.${name}.color`)
})

// Every backdrop a consumer actually paints text or a non-text indicator onto —
// not just `ground.base`. Both contrast tests below were titled "on every
// ground" while looping over MODES and reading `ground.base` alone, so
// `surface.card` could hold any value at all: setting `surface.card.light` to
// #3A3F45 (a dark card in a light theme — an ordinary design choice) puts
// `--text-primary` at ~1.4:1 on every shadcn Card and Popover with the suite
// fully green. This is the same defect final review found in the sibling skill
// (finding I2), fixed here the same way rather than a second way.
//
// Read out of the token tree rather than hand-listed, so a client that adds a
// surface leaf is covered without editing this file. `ground.*` and `surface.*`
// are the backdrop groups BY DEFINITION — references/ingestion.md §6b's role
// map assigns them `0` precisely because they are "the thing contrast is
// measured against" — and `tokens.shadcn` routes real shadcn slots to every
// one of them: `background` -> ground.base, `card` -> surface.card,
// `muted` -> surface.inset, and `ground.raised` backs elevated surfaces in the
// generated theme CSS.
//
// Non-hex leaves (`line.base` is an rgba() hairline) live under `line.*`, not
// here, so everything this returns is safe to hand to `contrast()`, which reads
// any OPAQUE CSS color (hex, rgb(), hsl(), oklch(), oklab()).
const groundsFor = (mode, view = tokens) => [
  ...Object.entries(view.color.ground).map(([k, v]) => [`ground.${k}`, at(view, v[mode], mode)]),
  ...Object.entries(view.color.surface).map(([k, v]) => [`surface.${k}`, at(view, v[mode], mode)]),
]

// `status.*` is in the ink list, at the TEXT threshold, on purpose — one rule
// for the whole system: if a color can carry text, it is checked as text.
// `tokens.shadcn` maps `destructive: var(--status-destructive)` and shadcn
// renders that slot as literal text (`text-destructive` on form messages) as
// readily as it fills with it. `status.warning` has no shadcn slot at all
// today, but a client's agents add components against these tokens, and "no
// shipped component pairs them yet" is a property of the catalog on the day of
// the audit, not a property of the token. A gate scoped to today's catalog
// weakens silently every time the catalog grows; this one does not.
//
// The cost of the rule was one placeholder value. Final review measured
// `status.warning` at 4.27:1 on `surface.inset` in light — under 4.5, and
// invisible because nothing checked it. It was darkened (#8A6D2C -> #816629,
// worst case now 4.75:1) rather than the gate being narrowed to fit it.
// references/ingestion.md §6b already assigned `status.* -> 4.5`; this test is
// what makes that entry true rather than aspirational.
//
// Hoisted out of the test bodies so the coverage ledger above measures the SAME
// lists the assertions use. Inlined, the two would drift the first time a leaf
// was added to one and not the other — and a coverage check that reads a stale
// copy of the roster is the inert-pin defect one level up.
const inksFor = (mode, view = tokens) => [
  ...Object.entries(view.color.text).map(([k, v]) => [`text.${k}`, at(view, v[mode], mode)]),
  ['accent.text', at(view, view.color.accent.text[mode], mode)],
  ...Object.entries(view.color.status).map(([k, v]) => [`status.${k}`, at(view, v[mode], mode)]),
]

test('text tokens clear 4.5:1 on every ground surface (WCAG 2.1 AA)', () => {
  for (const [viewName, view] of VIEWS) {
    for (const m of MODES) {
      const inks = inksFor(m, view)
      for (const [groundName, ground] of groundsFor(m, view)) {
        for (const [inkName, ink] of inks) {
          const ratio = contrast(ink, ground)
          assert.ok(
            ratio >= 4.5,
            `${viewName} ${inkName} ${ink} is ${ratio.toFixed(2)}:1 on ${m} ${groundName} ${ground} (need 4.5)`,
          )
        }
      }
    }
  }
})

// The gap final review rated CRITICAL in the sibling skill, and this file
// carried it too: `accent.base` was checked by nothing. It is the most
// contrast-critical leaf in the system, and it carries a TEXT role, not a
// decorative one. `tokens.shadcn` maps `primary: var(--accent-base)` and
// `primary-foreground: var(--ground-base)`, and shadcn's default Button variant
// is exactly `bg-primary text-primary-foreground` — so this pair is the primary
// button's own label wherever a consumer renders one, in every repo generated
// from this template. `accent.deep` is the same pair on hover in the generated
// theme.
//
// With neither gated and neither constrained by references/ingestion.md §6b's
// role map (both fell through to `0`, which makes `deriveDark` return a bare
// lightness flip), a reviewer put 8 of 12 real brand accents below 4.5:1 in
// light mode and 6 of 12 in dark with this suite green every time. §6b is fixed;
// this is the assertion that stops the same hole reopening by hand.
//
// Contrast is symmetric, so this single 4.5 assertion closes both halves of both
// modes AND subsumes the 3:1 non-text threshold `ring` needs against
// `ground.base` (the wider indicator check is the next test).
//
// The destructive slot's label is the same shape — `ground.base` on
// `status.destructive` — and is already asserted above, from the other
// direction: `status.destructive` measured as ink against `ground.base` IS
// `ground.base` measured against `status.destructive`.
const accentFillsFor = (mode, view = tokens) =>
  ['base', 'deep'].map((k) => [`accent.${k}`, at(view, view.color.accent[k][mode], mode)])

test('accent fills clear 4.5:1 against the label they carry (WCAG 2.1 AA)', () => {
  for (const [viewName, view] of VIEWS) {
    for (const m of MODES) {
      const label = at(view, view.color.ground.base[m], m)
      for (const [leafName, fill] of accentFillsFor(m, view)) {
        const name = leafName.split('.')[1]
        const ratio = contrast(label, fill)
        assert.ok(
          ratio >= 4.5,
          `${viewName} accent.${name} ${fill} carries a ground.base ${label} label at ${ratio.toFixed(2)}:1 in ${m} ` +
            `(need 4.5 — this is shadcn's bg-primary/text-primary-foreground pair)`,
        )
      }
    }
  }
})

// SC 1.4.11 non-text contrast, on every backdrop the mark can land on:
//   line.control  `tokens.shadcn.input` — the input border
//   accent.base   `tokens.shadcn.primary` — selected states, progress fills,
//                 active rails, and any focus ring a consumer routes to primary
//   accent.deep   the hover/active half of the same fills
// A ring draws outside the border box, over whatever surface the control sits
// on — which is any of the four grounds, not just the page. `accent.*` is
// additionally held to 4.5 against `ground.base` by the test above; 3 is the
// correct floor for the remaining surfaces, where these leaves are only ever a
// non-text indicator.
const marksFor = (mode, view = tokens) => [
  ['line.control', at(view, view.color.line.control[mode], mode)],
  ['accent.base', at(view, view.color.accent.base[mode], mode)],
  ['accent.deep', at(view, view.color.accent.deep[mode], mode)],
]

test('non-text indicators clear 3:1 on every ground surface (WCAG 2.1 AA, SC 1.4.11)', () => {
  for (const [viewName, view] of VIEWS) {
    for (const m of MODES) {
      const marks = marksFor(m, view)
      for (const [groundName, ground] of groundsFor(m, view)) {
        for (const [markName, mark] of marks) {
          const ratio = contrast(mark, ground)
          assert.ok(
            ratio >= 3,
            `${viewName} ${markName} ${mark} is ${ratio.toFixed(2)}:1 on ${m} ${groundName} ${ground} (need 3)`,
          )
        }
      }
    }
  }
})

test('shadcn contract routes through semantic tokens, never raw hexes', () => {
  for (const [key, val] of Object.entries(tokens.shadcn)) {
    assert.match(val, /^var\(--/, `shadcn.${key} must reference a CSS variable, got '${val}'`)
  }
  for (const key of ['background', 'foreground', 'primary', 'muted', 'border', 'input', 'ring']) {
    assert.ok(key in tokens.shadcn, `shadcn contract missing '${key}'`)
  }
})

// Every hex/rgba/shadow value this template ships as a placeholder. If the
// ingestion procedure's §6a strip is skipped, `deriveDarkRamp` preserves the
// `dark` half of every one of these (`v.dark ?? derive(...)`), and a client
// ships this system's slate-blue brand in dark mode while every other gate —
// including this file's own WCAG tests — stays green, because a placeholder
// darkened against a placeholder ground still passes contrast. This is the
// only check that can see that failure mode.
//
// #FFFFFF is deliberately excluded: it is the one value here plausible as a
// real client color (a pure-white ground or card), so including it would cry
// wolf on legitimate brands and teach agents to ignore this test.
//
// The two DARK shadow values are deliberately excluded too — found by actually
// running this guard against a hand-authored, non-template palette (the E2E
// dry run, Task 10): `0 1px 2px rgba(0, 0, 0, 0.4)` / `0 20px 32px rgba(0, 0,
// 0, 0.5)` are plain black at conventional alpha, the ordinary industry choice
// for a dark-mode elevation shadow regardless of brand — ingestion.md §6a even
// tells the agent to author these by hand, and "by hand, correctly" plausibly
// lands on exactly this. That is a real false positive, not a hypothetical
// one: an agent who did §6d/§6e correctly would still fail this test on shadow
// alone. The LIGHT shadow values stay in the set — they are tinted with the
// template's own specific near-black ink (rgb(23,25,28)), which an agent
// filling in the client's own ink is very unlikely to reproduce by chance, so
// a match there still reliably means "this was never touched."
const PLACEHOLDERS = new Set([
  '#FAFAF8', '#17191C', '#1E2126', '#F0F0EC', '#22262B', '#23272C', '#E8EAED',
  '#525A63', '#A8B0B9', '#3B6EA8', '#7FA8D4', '#2C5380', '#9FBEDE', '#71787F',
  '#848C94', '#A83B3B', '#D48F7F', '#816629', '#D4BE7F',
  'rgba(35, 39, 44, 0.14)', 'rgba(232, 234, 237, 0.14)',
  '0 1px 2px rgba(23, 25, 28, 0.08)', '0 20px 32px rgba(23, 25, 28, 0.16)',
])

// Identity gate, not a value gate: in THIS package (the template pack itself,
// tokens.meta.name === 'ds') every one of these values is the legitimate,
// intentional default — the test would fail on every fresh checkout. Once a
// client repo renames the token module (SKILL.md Step 4a sets
// tokens.meta.name to the client's name), this same file activates and the
// check becomes real. `{ skip }` reports the skip visibly in `node --test`
// output instead of silently passing, so a run that skips 0 tests in a client
// repo is itself a signal something is wrong.
test(
  'no template placeholder value survives into a named (non-template) token module',
  { skip: tokens.meta.name === 'ds' ? 'template package — these are the legitimate placeholder defaults, not a client brand' : false },
  () => {
    const hits = []
    const walk = (obj, path) => {
      for (const [k, v] of Object.entries(obj)) {
        const p = path ? `${path}.${k}` : k
        if (isLeaf(v)) {
          for (const m of MODES) if (PLACEHOLDERS.has(v[m])) hits.push(`${p}.${m} = ${v[m]}`)
        } else if (v && typeof v === 'object') walk(v, p)
      }
    }
    walk(tokens.color, 'color')
    walk(tokens.shadow, 'shadow')
    assert.equal(
      hits.length,
      0,
      `template placeholder value(s) survived into '${tokens.meta.name}'. Three known causes, ` +
        `not mutually exclusive — check which mode(s) are hit below: (1) only '.dark' paths hit → ` +
        `the strip-before-derive step (references/ingestion.md §6a) was skipped, so derivation ` +
        `preserved the template's dark instead of deriving the client's; (2) BOTH '.light' and ` +
        `'.dark' hit on the same color leaf → that leaf's light value was never filled in with an ` +
        `extracted/authored value at all; (3) any 'shadow.*' path hit → shadow is never touched by ` +
        `derivation (§6a/§6d), so it was never hand-authored. Surviving path(s):\n  ${hits.join('\n  ')}`,
    )
  },
)
