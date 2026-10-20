# Token Follow-ups (1.9.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the follow-ups left after 1.8.0: colour transparency, the 64px blur, breakpoints, panel and menu widths, the focus-ring width, the deferred mantis-check fixes, the repo's own lint, and the Storybook test flakes.

**Architecture:** The 1.7.0/1.8.0 pattern: a section in `tokens/mantis.tokens.mjs` → runtime variables on `html:root` and `@theme` keys in the namespaces Tailwind 4.3.3 reads (literal keys where a media or container query reads them) → a matching mantis-check rule and `lib/mantis-cn.ts` registration → codemod of Mantis code → proof by compiling and by comparing every story's and the home page's computed styles before and after (`scripts/story-geometry.mjs`).

**Tech Stack:** Tailwind 4.3.3, node:test, Playwright, `cn` 0.4.0. No new dependencies.

**Spec:** the owner's request of 2026-10-20 ("work on the items you listed in your notes"), meaning the open list in memory `token-enforcement-followups.md`; owner decisions below.

## Global Constraints

- No new dependencies. No deploy or publish without the owner's yes; one squashed commit, `minor` → 1.9.0, tag `v1.9.0` when pushed; Paper sync after the deploy.
- No visual change except where the owner approves a listed change. Every story and the home page are compared before and after.
- Components read semantic tokens, never `--mantis-*`. Every new token-named utility is registered in `lib/mantis-cn.ts`.
- `AGENTS.md` stays under 26,000 bytes (25,989 today): tighten before adding.
- Values with no token are listed for the owner, not hidden behind allow-comments.

## What the investigation found (2026-10-20)

- **Colour transparency.** 97 uses at 13 amounts: /5, /10, /15, /20, /30, /40, /50 (54 uses), /60, /70, /80, /90, and /82 and /85 (home page only). The source's own alpha series (`color-lime-alpha-*`, `color-pink-alpha-*`, `color-transparent-*`) is 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90: every amount Mantis code uses except the two on the home page.
- **Breakpoints.** 142 uses: `sm:` 52, `md:` 40, `lg:` 36, `xl:` 8, `2xl:` 6; no arbitrary `min-[…]:`. Tailwind's 640/768/1024/1280/1536px. The source names mobile 320, tablet 768 (= md), desktop 1280 (= xl), wide 1920.
- **Focus ring.** `ring-3` 57 uses plus `ring-[3px]` 3, all focus and invalid rings; Mantis border widths stop at 2px. No source token for it (the source has `color-border-focus`, a colour).
- **64px blur.** `blur-3xl` once (lightbox backdrop). Mantis blurs: chip 8, glass 12, dialog 32.
- **Panel and menu widths** in shipped code (registry + primitives): 224 `w-56` (canvas, settings sidebars), 240 `w-60` (app-shell sidebar), 256 `w-64` (account menu, workflow, gallery filters), 288 `w-72` (popover, sidebars, top-nav menus), 320 `w-80` (inspectors), 352 `w-88` (model picker, video studio), 384 `w-96` (notifications, lightbox); menu minimums 128 `min-w-32` and 144 `min-w-36`. They already read Mantis's 4px unit, so the inspector shows a Mantis variable; the gap is that nothing names them and mantis-check flags each one in app code (`w-64` → "no size step above 96px").
- **Repo findings.** mantis-check reports 181 on this repo: 120 in stories (demo frames: `w-64` 13, `w-80` 10, `w-72` 10, `w-56` 7…), 33 in the home page and app, 4 raw colours, 1 false positive (the repo's own `globals.css` inlines the tokens between `@tokens` markers instead of importing the theme).
- **Off the control ladder.** Toggle `sm` is `h-7` (28px) and the tabs line bar 52px: both read Mantis's spacing unit already.
- **Flakes.** project-card › Library fails under load when `findByRole('menu')` returns the previous menu while it is closing; model-picker › No results and event-map › Choosing a tool failed once each in 1.6.0.

## Decisions the owner makes before execution

| # | Question | Recommendation |
|---|---|---|
| E1 | **Colour transparency scale.** | Adopt the source's alpha series as Mantis's steps: 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90%. `bg-brand/50` then reads `var(--alpha-50)` at the same pixels; mantis-check flags any other amount (`/82`, `/[0.33]`) with the nearest step. |
| E2 | **The home page's `/82` and `/85`** (sticky header background, one hero layer). | Move them onto the scale (`/80`, `/90`): a 2–5% change in how see-through two home-page layers are, nowhere else. Or keep them and list them. |
| E3 | **Breakpoints.** | Mantis owns `sm` `md` `lg` `xl` `2xl` at Tailwind's pixels (md = the source's tablet, xl = its desktop), as literals because media queries cannot read variables. mantis-check flags arbitrary `min-[…]:` / `max-[…]:` breakpoints. No visual change. |
| E4 | **Focus ring width.** | A `ring-focus` token, 3px (measured from the primitives); `ring-3` and `ring-[3px]` in Mantis code become `ring-focus`. |
| E5 | **The 64px blur.** | A `blur-stage` token, 64px, for a blurred backdrop picture; the lightbox uses it. |
| E6 | **Panel and menu widths.** | Size tokens named by job: `panel-sm` 224, `sidebar` 240, `panel` 256, `panel-md` 288, `panel-lg` 320, `panel-xl` 352, `panel-2xl` 384, and `menu` 128, `menu-lg` 144 (as `w-`, `min-w-`, `max-w-`). The codemod renames only uses that are already exactly these widths, so nothing moves; the one-offs (192, 176, 160, 144-wide thumbnails, the sample-content placeholders, the 720px command palette) are listed. |
| E7 | **Toggle sm (28px) and the tabs line bar (52px).** | Leave them: both read Mantis's spacing unit. Closed as "not a leak". |
| E8 | **The combobox chip's remove button** sits at 50% at rest (`opacity-disabled`, after the 1.8.0 rename). | Leave the value (any change is visible). |

## Review Focus

1. `bg-brand/50`, `ring-ring/50` and `hover:bg-glass/80` must compute to the same colour; an `opacity-*` utility must still compute to its percentage (both read `--opacity-*`).
2. Every `sm:`…`2xl:` media query must compile to the same `@media` as stock, and the `@container` queries must stay as they are.
3. `cn('ring-3', 'ring-focus')`, `cn('w-64', 'w-panel')`, `cn('bg-brand/50', 'bg-brand/40')` keep only the second.
4. An app on the 1.8.0 theme that uses `ring-focus`, `w-panel` or `blur-stage` gets the `unresolved` finding naming them.
5. The test fixes must not weaken what the stories check: each still proves the same behaviour, just without the race.

---

### Task 1: Before captures
- [ ] Branch `token-followups` from `main` (72d4b58). Ledger via `sdd-workspace`.
- [ ] Build Storybook into the scratchpad twice-captured (`before.json`, `before-again.json`); build and start the site, capture the home page twice.

### Task 2: Colour transparency scale (E1, E2)
- [ ] Failing tests: `tailwind-theme.test.mjs`: each step `bg-brand/<n>` writes `color-mix(in oklab, var(--brand) var(--alpha-<n>), transparent)` and computes to `<n>%`; `opacity-50` still computes to 50%; `bg-brand/82` stays a literal (no key). `build-tokens.test.mjs`: runtime `--alpha-<n>: <n>%` and theme `--opacity-<n>: var(--alpha-<n>)`. `mantis-check.test.mjs`: `bg-brand/82` → `scale`, `→ bg-brand/80 (80%)`; `ring-ring/[0.33]` → `bracket`, nearest step; `bg-brand/50`, `bg-brand/disabled` → none; shipped files not judged. `mantis-cn.test.mjs`: `cn('bg-brand/50', 'bg-brand/40') === 'bg-brand/40'`.
- [ ] Token module: `alpha: { 5: '5%', 10: '10%', 15: '15%', 20: '20%', 30: '30%', 40: '40%', 50: '50%', 60: '60%', 70: '70%', 80: '80%', 90: '90%' }` with a comment naming the source series. build-tokens: runtime and theme lines. build-check: `alphas`. Template: `alphaRule` on `<colour-prefix>-<name>/<n>` and `/[…]`, app code only.
- [ ] E2: home page `/82` → `/80`, `/85` → `/90` (or list them, per the owner).
- [ ] Commit `feat(tokens): colour transparency steps from the source's alpha series`.

### Task 3: Breakpoints (E3)
- [ ] Failing tests: the plain `@theme` block defines `--breakpoint-sm…2xl` at Tailwind's pixels; `sm:flex`…`2xl:flex` and `max-md:flex` compile to the stock `@media`; mantis-check flags `min-[900px]:flex` (`scale`, nearest breakpoint) and leaves `md:` alone.
- [ ] Token module `breakpoint: { sm: '40rem', md: '{breakpoint-tablet}', lg: '64rem', xl: '{breakpoint-desktop}', '2xl': '96rem' }`; build-tokens adds them to the literal `@theme` block (resolved, like the container widths). Check rule and data.
- [ ] Commit `feat(tokens): breakpoints as Mantis tokens`.

### Task 4: Focus ring and the 64px blur (E4, E5)
- [ ] Failing tests: `ring-focus` writes `var(--ring-width-focus)`… computes to 3px; `--blur-stage` 64px and `blur-stage` computes like `blur-3xl`; check: `ring-3` → `scale`, `→ ring-focus (3px)`; `blur-3xl` → `blur-stage (64px)`; cn merges both.
- [ ] Token module: `ringWidth: { focus: '3px' }` (authored, measured), `blur.stage: '64px'`. Codemod `ring-3` and `ring-[3px]` → `ring-focus` (60 uses) and the lightbox's `blur-3xl` → `blur-stage`.
- [ ] Commit `feat(tokens): ring-focus and blur-stage`.

### Task 5: Panel and menu widths (E6)
- [ ] Failing tests: each name in `w-`, `min-w-`, `max-w-` reads `var(--size-<name>)` and equals the old step's pixels; cn merges (`cn('w-64', 'w-panel') === 'w-panel'`); check: `w-64` → `→ w-panel (256px)` instead of "no size step"; the misspelt-name guard covers the new names.
- [ ] Token module: the names added to `size` (they become `--size-*` and the width families, like `control`). `max-w-` is added to the size families (Tailwind reads `--max-width-*`; verify by compiling first).
- [ ] Codemod in registry, primitives, stories, home and app: only exact matches (`w-64` → `w-panel`…). List every other wide width with its file.
- [ ] Commit `feat(tokens): panel and menu widths`.

### Task 6: Install check, cn and docs
- [ ] The `unresolved` install check names the new tokens on an older theme (Review Focus 4); `lib/mantis-cn.ts` lists them; `scripts/mantis-cn.test.mjs` checks the lists against the tokens.
- [ ] AGENTS.md: tighten first (shorter Fill/Single role lists or Shadows line written once-prefixed like Radius), then one line for alpha steps, `ring-focus`, `blur-stage`, panel widths and `-z-raised`. Under 26,000 bytes.
- [ ] `registry.json` mantis-cn description, `meta.usage` heading reworded to what is true ("Mantis's named utilities read Mantis tokens; Tailwind's numbers are flagged by mantis-check"), CLAUDE.md provenance bullets, `eslint.config.mjs` message (`duration-normal`), and new repo lint rules for numeric `opacity-`, `z-`, stock `blur-*`, `ring-3`.
- [ ] Commit `docs: 1.9.0 tokens; lint rules for the new names`.

### Task 7: mantis-check minors from the 1.8.0 review
- [ ] Failing tests then fixes: single-line `@theme inline { --radius-xs: 3px; }` is read; a `--radius-*` inside a `/* … */` comment is not; `ease-[var(--ease-swift)]` is not a finding; the mantis-cn staleness check counts class names only, not CSS `var()` reads; the repo's own `globals.css` (tokens inlined between the `@tokens` markers) counts as wired.
- [ ] Commit `fix(check): radius parser, curve variables, mantis-cn staleness, inlined tokens`.

### Task 8: Repo findings
- [ ] Re-run mantis-check on the repo. Rename what equals a token exactly (pixel-identical) in stories, home and app; list the rest by file for the owner (home page bespoke values such as `w-97.5`, `pb-120`, `max-w-150`). Expected: well under 181, with every remaining finding explained.
- [ ] Commit `chore: repo code on the new tokens`.

### Task 9: Storybook flakes
- [ ] project-card › Library: `openMenu` waits until no menu is open before clicking, then waits for the new menu (the one with `data-open`). Same review for model-picker › No results and event-map › Choosing a tool (read their failures first; fix the race, never loosen the assertion).
- [ ] Proof: run each story file 10 times under load (the full suite running in parallel) with 0 failures.
- [ ] Commit `test: stories wait for the popup they opened`.

### Task 10: Prove, review, release prep
- [ ] Storybook and home page captures after; compare against Task 1. Expected: 0 changes except E2 (if chosen) and the codemods' identical renames. Toast/dialog and Quill CLI `allowedValues` checks as in 1.8.0.
- [ ] Gates: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run test-storybook`.
- [ ] One fresh reviewer on the whole branch; one fix pass.
- [ ] Squash, `npm run version:bump -- minor "…"` → 1.9.0, gates again. **Stop**: push, tag and Paper sync wait for the owner. Paper: alpha steps (opacity type), breakpoints (breakpoint type), panel widths (container or spacing type); no Paper type for ring width or blur.
