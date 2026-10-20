# Token Gaps (opacity, layers, widths, motion, radius, line heights) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the last places where a built Mantis page falls back to Tailwind's own values: opacity, z-index, container widths and motion read Mantis tokens, mantis-check flags what does not, the radius install path is proven, and the text line-height change is measured for the owner to decide.

**Architecture:** Same pattern as 1.5.0 (spacing) and 1.7.0 (sizes): new sections in `tokens/mantis.tokens.mjs` become runtime variables on `html:root` plus `@theme inline` keys in the namespaces Tailwind 4.3.3 reads (`--opacity-*`, `--z-index-*`, `--container-*`, `--transition-duration-*`, `--ease-*`, `--default-transition-*`). mantis-check gets matching rules. Every change is proven pixel- and timing-identical by compiling (unit tests) and by rendering every story and the home page before and after, comparing computed styles, not only layout boxes.

**Tech Stack:** Tailwind 4.3.3 (`compile` from `tailwindcss`), node:test, Playwright (already a dev dependency), `cn` 0.4.0 (`createCn`).

**Spec:** the owner's request of 2026-10-19 (items A–E), quoted in the session; findings below were verified by compiling against `registry/mantis-theme.css` the same day.

## Global Constraints

- No new dependencies in Mantis. The radius test app lives in the scratchpad, outside the repo, and is deleted afterwards.
- Do not deploy or publish. Push to `main` only with the owner's OK. One version bump: `minor` → 1.8.0, one squashed commit, tag `v1.8.0` when pushed.
- No visual change: every story and the home page render with identical computed values before and after (Tasks 1 and 9), except where the owner approves a listed change.
- Components read semantic tokens, never `--mantis-*`.
- Every new token-named utility is registered in `lib/mantis-cn.ts` (CLAUDE.md rule from 1.7.0).
- `AGENTS.md` stays under 26,000 bytes (currently 25,748).
- Values in Mantis code with no token are listed for the owner, never hidden behind allow-comments.

## Decisions the owner makes before execution

| # | Question | Recommendation |
|---|---|---|
| D1 | **Layer names.** Mantis code uses z-index 10 (a control lifted over its neighbours: 7 uses), 20 (sticky top bars: 4), 50 (every popup: dialog, sheet, menu, select, popover, tooltip: 16), -10 (decoration behind content: 8) and 40 (home page header: 1). The source scale names 10 "dropdown", 20 "sticky", 50 "popover". | Mantis's own names, with values taken from the source tokens: `z-raised` (10), `z-sticky` (20), `z-floating` (50), and `-z-raised` for -10. The source's names would put `z-dropdown` on an avatar badge and `z-popover` on a dialog. The home header moves from 40 to `z-sticky` (20) only if the render check shows no change; otherwise it is listed. |
| D2 | **Container widths.** Mantis's shipped code uses `max-w-xs`…`4xl`, `6xl`, `7xl` (in 4 primitives, 26 blocks and the home page; stories add `5xl`). | Keep Tailwind's names and back them with Mantis tokens, `xs` through `7xl`, all 11 at today's pixel values. Three come straight from the source breakpoints (`xs` = mobile 320px, `3xl` = tablet 768px, `7xl` = desktop 1280px); eight are authored. mantis-check then flags only what is not a token: `3xs`, `2xs`, `prose` and bracket widths. Renaming to roles (`max-w-dialog`, `max-w-page`) is a bigger change with visual moves (Quill did this after 1.28.0); a later release if wanted. |
| D3 | **`opacity-30`** on the blurred backdrop picture in `lightbox-inspector` has no token (Mantis has `disabled` 50% and `muted` 40%). | Leave it as is and list it; decide later between a new `opacity-backdrop` token (30%) or `opacity-muted` (a visible change). |
| D4 | **The `radius-override` check rule.** Built only if Task 2 shows shadcn's lines can win. | Build it if a user who skips one clean-up step gets shadcn's radii, even when the docs are right: the step is manual and easy to miss. |
| D5 | **Line heights (E).** Task 10 measures; the owner keeps or drops the change after seeing the list. | Decide after Task 10. |

### Owner decisions (2026-10-19, binding)

- D1 agreed: `z-raised` / `z-sticky` / `z-floating`. **Also prove a toast still shows above an open dialog** when both sit on the floating layer (Task 4).
- D2 agreed: `max-w-md` etc. stay, backed by Mantis tokens at today's values.
- D3 changed: **add `opacity-scrim` (30%)** as an authored token; the lightbox backdrop uses it (Task 3).
- D4 changed: **build `radius-override` regardless** of Task 2's result; still run Task 2 and report it.
- D5 agreed: Task 10 stops and shows what moves.
- Added: `cn` knows every new name this release adds (curves, durations, opacity, layers, widths, blur), with tests (Tasks 3–6, 8b).
- Added: `blur-3xl` in `lightbox-inspector`: map to a Mantis blur token if one fits at the same pixels, otherwise mantis-check flags it and it is reported (Task 8b).
- Added: the accordion icon `**:data-[slot=accordion-trigger-icon]:size-4` → `size-icon-md` (Task 8b).
- Added: an end-to-end mantis-check run on a probe app after the change confirms `opacity-50`, `opacity-40`, `opacity-30` and `opacity-[0.3]` are flagged with `opacity-disabled` / `opacity-muted` / `opacity-scrim` as the fix (Task 9).
- Known leak for a later release, not now: colour transparency modifiers (`bg-brand/50`) are hand-picked numbers.

## What the investigation found (2026-10-19, verified by compiling)

- `opacity-50` → `opacity: 50%`; `z-10` → `z-index: 10`; `max-w-md` → `var(--container-md)` (Tailwind's); `duration-200` → `200ms`; `ease-in-out` → `var(--ease-in-out)` (Tailwind's, same curve as the source's).
- Tailwind reads `--opacity-*`, `--z-index-*`, `--container-*` and `--transition-duration-*` theme keys (verified: `z-modal`, `duration-normal` and `opacity-disabled` compile once a key exists; `--z-modal` and `--duration-normal` alone do not).
- **Trap:** an `--opacity-*` key also feeds colour transparency (`bg-brand/50`). The source opacity tokens are bare numbers (`.5`), and `color-mix(in oklab, var(--brand) .5, transparent)` is invalid CSS, so remapping `opacity-50` to the source token would make every `/50` colour solid. Only named keys, with percentage values, are safe.
- Plain `transition`, `transition-colors` and the rest use Tailwind's default 150ms and default curve; the source has a 150ms token and the same curve.
- mantis-check misses: `opacity-50`, `opacity-[0.3]`, `z-10`, `z-[5]`, `max-w-md` (and every container width), `max-w-prose`, `duration-[250ms]`, `ease-[cubic-bezier(…)]`.
- **Existing bug:** `cn('ease-out', 'ease-swift')` keeps both classes; Mantis's four ease names were never registered in `lib/mantis-cn.ts`.
- Every `text-*` size's current line height equals a Mantis line-height token in pixels (xs 16, sm 20, base 24, lg 28, xl 28, 2xl 32, 3xl 36, 4xl 40, 5xl 48, 6xl 56). Today they are ratios (`calc(1.25 / 0.875)`); a token is a length. A ratio scales with a nested element's own font size and a length does not, so nested text with a different font size and no `text-*` of its own can move. `text-2xs` has no line height today and takes its parent's.
- The install docs (`registry.json` › base › `meta.usage`, step 2) already tell users to delete shadcn's `--radius-*` lines. Whether a user following them gets Mantis's radii is untested (Task 2).
- Also found, not in this plan: `blur-3xl` in `lightbox-inspector` (Tailwind's own filter blur, 64px); `**:data-[slot=accordion-trigger-icon]:size-4` in `accordion` (missed by the 1.7.0 icon codemod); colour transparency modifiers (`bg-brand/50`) stay plain percentages; `tw-animate-css` enter/exit and `animate-spin` use their own timings; `meta.usage` still says "Spacing is Tailwind's default scale" (fixed in Task 8).

## Review Focus

1. A colour with a transparency modifier (`bg-brand/50`, `ring-ring/50`) after the opacity keys land: must compile to a valid `color-mix` with the same percentage as before. Test in Task 3.
2. `cn` merging a token name over a numeric class passed by a caller (`cn('z-50', 'z-floating')`, `cn('duration-200', 'duration-normal')`, `cn('opacity-50', 'opacity-disabled')`): only the second survives. Tests in Tasks 3, 4, 6.
3. Container queries (`@md:`, `@2xl:` in `event-map`, `video-player`) read the same `--container-*` keys: the breakpoints must not move. Test in Task 5.
4. Negative layers (`-z-raised`) compile to `calc(var(...) * -1)` and compute to -10. Test in Task 4.
5. An app on an older theme writes `z-floating` or `max-w-md`: `z-floating` has no CSS and `max-w-md` still reads Tailwind's value. The existing `unresolved` theme check must name the new tokens too. Test in Task 7.

---

### Task 0: Branch and workspace

- [ ] `git switch -c token-gaps` from `main` (abb87f8 or later). Create the ledger: `../subagent-driven-development/scripts/sdd-workspace docs/superpowers/plans/2026-10-19-token-gaps.md`.

### Task 1: Measure computed styles, not only boxes, and capture "before"

`scripts/story-geometry.mjs` records width, height and position. Opacity, z-index and timing do not move boxes, so it must also record the computed values this plan touches.

**Files:** Modify `scripts/story-geometry.mjs`. Test: `scripts/story-geometry.test.mjs` (create).

- [ ] **Step 1: Failing test.** Export `styleLine(cs)` and assert it lists the properties in a fixed order:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STYLE_PROPS, styleLine } from './story-geometry.mjs'
test('records the computed values this release touches', () => {
  assert.deepEqual(STYLE_PROPS, ['opacity', 'z-index', 'transition-duration', 'transition-timing-function', 'max-width', 'min-width', 'line-height', 'font-size', 'border-top-left-radius'])
  const cs = Object.fromEntries(STYLE_PROPS.map((p, i) => [p, String(i)]))
  assert.equal(styleLine({ getPropertyValue: (p) => cs[p] }), '0|1|2|3|4|5|6|7|8')
})
```

- [ ] **Step 2:** `node --test scripts/story-geometry.test.mjs` → FAIL (`STYLE_PROPS` not exported).
- [ ] **Step 3:** Add `export const STYLE_PROPS = [...]` and `export const styleLine = (cs) => STYLE_PROPS.map((p) => cs.getPropertyValue(p)).join('|')`. In `measure()`, append `' ' + styleLine(cs)` to each line. `measure` runs inside the page through `page.evaluate`, so pass `STYLE_PROPS` in as an argument rather than closing over it. Guard the import of `playwright` so the test can import the module: move `chromium` into a dynamic `await import('playwright')` inside `capture`.
- [ ] **Step 4:** Add a `capture-url <url> <out.json>` command that measures one page (the home page) with the same `measure()`.
- [ ] **Step 5:** `node --test scripts/story-geometry.test.mjs` → PASS.
- [ ] **Step 6: Capture "before".** Build Storybook into the scratchpad (`npx storybook build -o $SCRATCH/sb-before`), capture it twice (`before.json`, `before-again.json`). Build and start the site (`npm run build && npx next start -p 3100`), capture `/` twice (`home-before.json`, `home-before-again.json`), then stop the server. Builds stay in the scratchpad; `scripts/contrast-exempt.test.mjs` fails on builds inside the repo.
- [ ] **Step 7:** Commit `scripts/story-geometry.mjs` and the test: `test(geometry): record computed opacity, layer, timing, width and line height`.

### Task 2: Radius install test (D)

**Files:** none in the repo. Scratch app at `$SCRATCH/radius-app`, deleted at the end of the task.

- [ ] **Step 1:** `cd $SCRATCH && npx create-next-app@latest radius-app --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-npm --yes`, then in it `npx shadcn@latest init` choosing style `base-nova` (record the exact prompts and versions in the ledger).
- [ ] **Step 2:** Follow the README and `meta.usage` exactly: add the `registries` line to `components.json`, `npx shadcn@latest add https://mantisdesignsystem.com/r/base.json` (reads the published 1.7.0 registry; nothing is published), then steps 1–4 of `meta.usage`.
- [ ] **Step 3:** Add a page with `<div className="rounded-xs">`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-control`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-4xl`. `npm run build && npx next start -p 3200`; read each `border-top-left-radius` with Playwright (`page.$$eval`).
- [ ] **Step 4:** Compare with Mantis: xs 2, sm 4, md 6, lg 8, control 10, xl 12, 2xl 16, 3xl 20, 4xl 24 (px). Record the table.
- [ ] **Step 5:** Repeat once with step 2's radius deletion skipped (the shadcn `--radius-*` lines left in place), and record that table too. Also list every other key shadcn's `@theme inline` block defines that Mantis's theme also defines, and whether it wins.
- [ ] **Step 6:** Stop the server; `rm -rf $SCRATCH/radius-app`. Write both tables to the ledger.
- [ ] **Outcomes:**
  - The docs-followed table matches Mantis, and the skipped-step table does not: go on to Task 7's `radius-override` rule (D4).
  - The docs-followed table does not match: fix `meta.usage` and README in Task 8 so it does, re-run this task from Step 1 to prove it, then build the rule in Task 7.
  - Both match: record it and skip the rule.

### Task 3: Opacity tokens (A)

**Files:** Modify `tokens/mantis.tokens.mjs` (new `opacity` section), `scripts/build-tokens.mjs`, `lib/mantis-cn.ts`, `scripts/build-check.mjs` (`opacities` in check data), `scripts/check/mantis-check.template.mjs`, `components/ui/*.tsx` and `registry/*.tsx` (codemod). Tests: `scripts/build-tokens.test.mjs`, `scripts/tailwind-theme.test.mjs`, `scripts/mantis-cn.test.mjs`, `scripts/mantis-check.test.mjs`.

**Interfaces:** Produces `tokens.opacity = { disabled, muted, scrim }` (scrim authored `0.3`, D3), runtime `--opacity-<key>` (a percentage), theme key `--opacity-<key>: var(--opacity-<key>)`, check data `DATA.opacities = { disabled: 50, muted: 40, scrim: 30 }` (percent).

- [ ] **Step 1: Failing tests.**
  - `tailwind-theme.test.mjs`: `opacity-disabled` written as `opacity: var(--opacity-disabled)`, and computed in Chromium as `0.5` (with `opacity-50` computing to `0.5` as the stock reference); `opacity-muted` → `0.4`. `bg-brand/50`, `text-foreground/50` and `ring-ring/50` compile exactly as they do without Mantis's opacity keys (Review Focus 1).
  - `build-tokens.test.mjs`: the default block has `--opacity-disabled: calc(var(--mantis-opacity-disabled) * 100%);` and the theme has `--opacity-disabled: var(--opacity-disabled);`.
  - `mantis-cn.test.mjs`: `OPACITIES` equals `Object.keys(tokens.opacity)`; `cn('opacity-50', 'opacity-disabled') === 'opacity-disabled'`; `cn('disabled:opacity-50', 'disabled:opacity-muted') === 'disabled:opacity-muted'`.
  - `mantis-check.test.mjs`: `opacity-50` → rule `scale`, fix starts `→ opacity-disabled (50%)`; `opacity-40` → `opacity-muted (40%)`; `opacity-30` → `→ opacity-scrim (30%)`; `opacity-20` → `→ opacity-scrim (30%)` plus the list `disabled 50% · muted 40% · scrim 30%`; `opacity-[0.3]` → rule `bracket`, `→ opacity-scrim (30%)`; `opacity-0`, `opacity-100`, `hover:opacity-100` → no finding; inline `style={{ opacity: 0.5 }}` → rule `inline-style`, fix `className="opacity-disabled"`; CSS `opacity: .5;` → rule `css-value`, fix `var(--opacity-disabled)`.
- [ ] **Step 2:** Run each → FAIL for the stated reason (no rule / no key).
- [ ] **Step 3: Implement.**
  - Token module, after `size`: `opacity: { disabled: '{opacity-disabled}', muted: '{opacity-muted}', scrim: '0.3' },` (scrim authored: the lightbox's blurred backdrop picture, owner decision 2026-10-19) with a comment: the source stores them as numbers; they are emitted as percentages because Tailwind also reads `--opacity-*` for colour transparency, where only a percentage is valid.
  - `build-tokens.mjs`: default block `...Object.entries(t.opacity ?? {}).map(([key, value]) => \`  --opacity-${key}: calc(${cssValue(t, value)} * 100%);\`)`; theme `...Object.keys(t.opacity ?? {}).map((key) => \`  --opacity-${key}: var(--opacity-${key});\`)`.
  - `mantis-cn.ts`: `export const OPACITIES = ['disabled', 'muted', 'scrim']` and `opacity: [{ opacity: OPACITIES }]` in `classGroups`.
  - `build-check.mjs`: `opacities: Object.fromEntries(Object.entries(resolved(t, t.opacity)).map(([k, v]) => [k, Math.round(Number(v) * 100)]))`.
  - Template: `opacityRule(base)` matching `/^opacity-(\d+)$/` (skip 0 and 100) and `/^opacity-\[(\d*\.?\d+%?)\]$/`, the exact token when the percentage matches, else the two nearest plus the list. Call it in `classFinding` beside `stockRule` (app code only, not shipped files). Add `['opacity', ['opacity', 'opacity']]` to `PROPERTIES` with its own branch in `valueRule` (unitless, 0 and 1 allowed).
- [ ] **Step 4: Codemod** in `components/ui` and `registry` (31 uses): `(^|[\s"'`:])((?:[\w-]+:)*)opacity-50\b` → `$1$2opacity-disabled`. `registry/lightbox-inspector.tsx` `opacity-30` → `opacity-scrim`. Leave `opacity-0` and `opacity-100`. Run `node scripts/build-tokens.mjs && node scripts/build-check.mjs`.
- [ ] **Step 5:** All tests of this task → PASS; `npm test` green.
- [ ] **Step 6:** Commit `feat(tokens): opacity-disabled and opacity-muted`.

### Task 4: Layer tokens (A, D1)

**Files:** Same set as Task 3, plus `app/page.tsx`. Tests in the same four test files.

**Interfaces:** Produces `tokens.layer = { raised: '{z-index-dropdown}', sticky: '{z-index-sticky}', floating: '{z-index-popover}' }`, runtime `--z-<key>`, theme `--z-index-<key>: var(--z-<key>)`, `DATA.layers = { raised: 10, sticky: 20, floating: 50 }`.

- [ ] **Step 1: Failing tests.**
  - Theme: `z-raised`, `z-sticky`, `z-floating` read `var(--z-…)` and compute to 10, 20, 50; `-z-raised` computes to -10 (Review Focus 4).
  - cn: `cn('z-50', 'z-floating') === 'z-floating'`; `cn('-z-10', '-z-raised') === '-z-raised'`.
  - Check: `z-10` → `scale`, `→ z-raised (10)`, with the list `raised 10 · sticky 20 · floating 50 (every popup)`; `z-30` → nearest two; `-z-10` → `-z-raised (-10)`; `z-[5]` → `bracket`; `z-0`, `z-auto` → none; `style={{ zIndex: 10 }}` → `inline-style`; CSS `z-index: 50` → `css-value`, `var(--z-floating)`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Implement** as in Task 3: token section with a comment that the names are Mantis's and the values the source's; build-tokens default block and theme keys; `LAYERS` in `mantis-cn.ts` with `z: [{ z: LAYERS }]`; `layers` in check data; `layerRule` in the template (negative steps keep the minus); `['z-index', ['layer', 'z']]` in `PROPERTIES` (a unitless integer).
- [ ] **Step 4: Codemod.** `z-50` → `z-floating` (16 uses in `components/ui`, 1 `focus:z-50` in `app-shell`), `z-10` → `z-raised` (incl. `focus:`, `focus-visible:`, `after:`), `-z-10` → `-z-raised`, `z-20` → `z-sticky`. `app/page.tsx` `z-40` → `z-sticky` (D1). Regenerate.
- [ ] **Step 5:** Tests → PASS; `npm test` green.
- [ ] **Step 5b: Toast over dialog (owner).** Read how `components/ui/sonner.tsx` and sonner's own CSS set the toaster's layer. In the built Storybook, open a dialog story, fire a toast from a test page (Playwright: `toast()` through the story's toaster, or a story that does both), and confirm with `document.elementFromPoint` at the toast's centre that the toast is on top. Record the result in the ledger; if the dialog covers the toast, stop and report.
- [ ] **Step 6:** Commit `feat(tokens): layer tokens z-raised, z-sticky, z-floating`.

### Task 5: Container widths (B, D2)

**Files:** Same set (no codemod: names stay). Tests in the same files.

**Interfaces:** Produces `tokens.container = { xs: '{breakpoint-mobile}', sm: '24rem', md: '28rem', lg: '32rem', xl: '36rem', '2xl': '42rem', '3xl': '{breakpoint-tablet}', '4xl': '56rem', '5xl': '64rem', '6xl': '72rem', '7xl': '{breakpoint-desktop}' }`, runtime `--container-<key>`, theme `--container-<key>: var(--container-<key>)` (self-reference, the 1.7.0 pattern: the unlayered runtime value wins), `DATA.containers` in px.

- [ ] **Step 1: Failing tests.**
  - Theme: every `max-w-<key>`, `w-<key>`, `min-w-<key>` reads `var(--container-<key>)`, and each runtime value equals Tailwind's stock `--container-<key>` in px. The container-query variant `@md:flex` compiles to `@container (width >= 28rem)` exactly as stock (Review Focus 3); if Tailwind needs a literal there, say so in a ledger ruling and keep the theme key literal for that one.
  - Check: `max-w-prose` → `scale`, fix lists the container widths; `max-w-3xs` (256px) → `→ max-w-xs (320px)…`; `max-w-[640px]` → `bracket`, `→ max-w-2xl (672px) or max-w-xl (576px)` (today it says "no size step above 96px"); `w-[317px]` likewise; `h-[400px]` keeps today's height message; `max-w-md` → none; `style={{ maxWidth: 448 }}` → `inline-style`, `className="max-w-md"`.
  - cn: `cn('max-w-md', 'max-w-sm') === 'max-w-sm'` (stock cn already knows these names; the test guards it).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Implement.** Token section with a comment naming the three source breakpoints; build-tokens; check data; template: `containerRule` for `(max-w|min-w|w|basis)-(3xs|2xs|prose)`, and width prefixes above 96px go to the nearest container widths instead of `TOO_BIG` (`max-w-`, `min-w-`, `w-`, `basis-`; heights unchanged).
- [ ] **Step 4:** Tests → PASS; `npm test` green.
- [ ] **Step 5:** Commit `feat(tokens): container widths as Mantis tokens`.

### Task 6: Motion (C)

**Files:** `scripts/build-tokens.mjs`, `tokens/mantis.tokens.mjs` (comment only), `lib/mantis-cn.ts`, template, `components/ui/*`, `registry/*`, `app/*` (codemod `duration-(--duration-x)` → `duration-x`). Tests in the same files.

**Interfaces:** Theme gains `--transition-duration-<name>: var(--duration-<name>)` for `fast`, `quick`, `normal`, `slow`; `--transition-duration-<ms>: var(--mantis-duration-…)` for every source duration value (0, 80, 100, 120, 130, 150, 160, 180, 200, 220, 260, 300, 350, 400, 500, 700, 800, 1000, 1200, 1300, 1400; a named source token preferred when two share a value); `--default-transition-duration: var(--mantis-duration-150)`; `--default-transition-timing-function: var(--mantis-ease-in-out)`; `--ease-in`, `--ease-out`, `--ease-in-out` → the source's equal curves.

- [ ] **Step 1: Failing tests.**
  - Theme: `duration-normal` reads `var(--duration-normal)` and computes to 200ms; `duration-200` reads `var(--mantis-duration-normal)` and computes to 200ms; `duration-75` stays `75ms` (no token); `transition` and `transition-colors` compute to 150ms and `cubic-bezier(0.4, 0, 0.2, 1)`; `ease-in`, `ease-out`, `ease-in-out` compute to the stock curves.
  - The tokens comment "Tailwind has no duration theme key" is removed (it was wrong; verified 2026-10-19).
  - cn: `cn('duration-200', 'duration-normal') === 'duration-normal'`; `cn('ease-out', 'ease-swift') === 'ease-swift'` (the existing bug).
  - Check: `duration-200` → `motion`, `→ duration-normal (200ms)`; `duration-[250ms]` → `motion`, nearest two named; `ease-[cubic-bezier(0,0,1,1)]` → `motion`, `→ a Mantis curve: ease-in · ease-out · ease-in-out · ease-swift · ease-emphasized · ease-spring · ease-out-expo`; `duration-normal`, `ease-swift` → none; CSS `transition-duration: 200ms` → `css-value`, `var(--duration-normal)`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Implement** in `build-tokens.mjs` (theme array, after the ease line); `DURATIONS` and `EASES` in `mantis-cn.ts` with `duration: [{ duration: DURATIONS }]`, `ease: [{ ease: EASES }]`; template motion rule fixes and the two bracket cases.
- [ ] **Step 4: Codemod** `duration-\(--duration-(fast|quick|normal|slow)\)` → `duration-$1` (52 uses). The one template string in `registry/` that builds `duration-(--duration-${name})` becomes `duration-${name}`. Regenerate.
- [ ] **Step 5:** Tests → PASS; `npm test` green.
- [ ] **Step 6:** Commit `feat(tokens): duration and ease utilities read Mantis motion`.

### Task 7: Install checks: older themes, and radius-override (D4)

**Files:** template (`checkEntry`), `scripts/mantis-check.test.mjs`.

- [ ] **Step 1: Failing tests.**
  - An app whose `mantis-theme.css` predates 1.8.0 and that uses `z-floating`, `opacity-disabled` or `duration-normal` gets one `unresolved` finding naming them, with the reinstall command (Review Focus 5). The 1.7.0 size check is generalised: "the names the app uses that its theme does not define".
  - Always (D4, owner): an entry stylesheet with `@import "./mantis-theme.css";` followed later by `@theme inline { --radius-sm: calc(var(--radius) * 0.6); }` → rule `radius-override`, value `--radius-sm: calc(var(--radius) * 0.6)`, on that line, fix `→ shadcn's radius line overrides Mantis's: rounded-sm renders 4.8px, Mantis's is 4px. Delete it (Mantis's theme defines every radius)`. A `--radius-*` line above the import, or `--radius-sm: var(--radius-sm)`, → none. The rule reads the stylesheet's text (mantis-check does not compile Tailwind), so it knows shadcn's `calc(var(--radius) * n)` shape and plain lengths; any other value is reported as "reads <value>".
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement (`radius-override` added to `RULE_LABEL` as `radius` and to the rule list in CLAUDE.md). **Step 4:** PASS, `npm test` green. **Step 5:** Commit `feat(check): new token names and radius overrides in the install check`.

### Task 8: Docs and generated files

**Files:** `scripts/build-agents.mjs` (+ test), `registry.json` (`base` `meta.usage`, `mantis-cn` description), `usage/*.usage.mjs` where a guide names `opacity-50`, `z-50` or `duration-(--duration-…)`, `CLAUDE.md`, `README.md` if Task 2 requires.

- [ ] **Step 1: Failing tests** in `build-agents.test.mjs`: the Tokens section names `opacity-disabled`, `z-floating`, `max-w-md`, `duration-normal`; the Motion line says `duration-normal`, not `duration-(--duration-normal)`; `AGENTS.md` < 26,000 bytes (existing test).
- [ ] **Step 2:** FAIL. **Step 3:** Add one line, tightening the Motion line and rule 1 to stay under the cap: `- **Opacity, layers, widths, motion:** \`opacity-disabled\` 50% \`opacity-muted\` 40% · \`z-raised\` 10 \`z-sticky\` 20 \`z-floating\` 50 · \`max-w-xs\`…\`7xl\` · \`duration-fast\`/\`quick\`/\`normal\`/\`slow\`, \`ease-swift\`….`. Replace "Spacing is Tailwind's default scale…" in `meta.usage` with the 1.5.0 truth. CLAUDE.md: provenance bullets for opacity (percent because of colour transparency), layers (names Mantis's, values the source's), containers (three from source breakpoints, eight authored, D2), motion (theme keys exist; the old comment was wrong). Run the four build scripts and `npm run registry:build`.
- [ ] **Step 4:** PASS. **Step 5:** Commit `docs: opacity, layer, width and motion tokens`.

### Task 8b: Leftovers the owner added

- [ ] Accordion: `**:data-[slot=accordion-trigger-icon]:size-4` → `size-icon-md` (16px both). Covered by the Task 9 render compare.
- [ ] `blur-3xl` (64px) in `lightbox-inspector`: Mantis blurs are chip 8, glass 12, dialog 32. If none equals 64px, keep the class, make mantis-check flag stock `blur-*` steps like it flags stock `backdrop-blur-*` (test: `blur-3xl` → `motion`, fix lists the Mantis blurs), and report the value to the owner.
- [ ] cn: test that `cn('blur-3xl', 'blur-dialog') === 'blur-dialog'` and `cn('backdrop-blur-sm', 'backdrop-blur-glass') === 'backdrop-blur-glass'`; register `BLURS` if they fail.
- [ ] Commit `fix: accordion icon size token; flag stock blur steps`.

### Task 9: Prove no visual change

- [ ] Build Storybook into `$SCRATCH/sb-after`, capture `after.json`; start the site, capture `home-after.json`.
- [ ] `node scripts/story-geometry.mjs compare before.json after.json before-again.json` and the same for the home page. Expected: 0 changes beyond the before/before-again noise.
- [ ] The Quill CLI's `allowedValues` on old and new `public/r/base.json` (memory: a new theme key can loosen its Paper check). Expected: any newly allowed value is a named token; record the diff.
- [ ] End-to-end (owner): the probe app from the investigation (`opacity-50`, `opacity-40`, `opacity-30`, `opacity-[0.3]`, `z-10`, `max-w-prose`, `duration-[250ms]`, `ease-[…]`, `blur-3xl`) with the new `mantis-check.mjs`: each is flagged, opacity with `opacity-disabled` / `opacity-muted` / `opacity-scrim` as the fix.
- [ ] mantis-check on this repo: before 188 findings; record the new count and every new finding class.
- [ ] Gates: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run test-storybook` (Storybook dev server stopped).
- [ ] Anything that moved: find the cause, fix or rule, re-run.

### Task 10: Line heights (E) — measure, then stop

**Files:** `scripts/build-tokens.mjs`, `tokens/mantis.tokens.mjs`, `scripts/tailwind-theme.test.mjs`. Separate commit so it can be dropped.

- [ ] **Step 1: Failing test:** each `text-<size>` (xs…6xl) writes `line-height: var(--tw-leading, var(--mantis-type-line-height-<n>))` and computes, on its own element, to the same px as stock (16, 20, 24, 28, 28, 32, 36, 40, 48, 56). `text-2xs` is unchanged (no line height of its own).
- [ ] **Step 2:** FAIL. **Step 3:** `tokens.textLeading = { xs: '{type-line-height-300}', sm: '{type-line-height-600}', base: '{type-line-height-700}', lg: '{type-line-height-800}', xl: '{type-line-height-800}', '2xl': '{type-line-height-1000}', '3xl': '{type-line-height-1100}', '4xl': '{type-line-height-1200}', '5xl': '{type-line-height-1300}', '6xl': '{type-line-height-1400}' }`, emitted as `--text-<key>--line-height`. **Step 4:** PASS.
- [ ] **Step 5:** Capture Storybook and the home page again and compare against Task 9's "after". List every element whose line height or box changed: story, element path, before → after, and why (the nested font size).
- [ ] **Step 6:** Commit on the branch, and **stop**. Report the list to the owner (D5). Kept: the commit joins the release. Dropped: `git revert` it.

### Task 11: Review and release prep

- [ ] Whole-branch review by a fresh reviewer; fix pass per executing-plans.
- [ ] Squash into one commit, `npm run version:bump -- minor "Opacity, layer, width and motion utilities read Mantis tokens; mantis-check flags the rest"` → 1.8.0. Gates again.
- [ ] **Stop.** Push, tag and the Paper sync each wait for the owner's yes. Paper has `opacity` and `container` token types (sync those); it has no z-index or duration types, which the report says.
