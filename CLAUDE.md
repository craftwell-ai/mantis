# CLAUDE.md: Mantis design system

@AGENTS.md

AGENTS.md (imported above) is how to *use* Mantis: components, props, tokens, rules. This file is how to *maintain* it.

## What this repo is

- A **shadcn registry** (namespace `@mantis`) built on **Base UI** (`@base-ui/react`, shadcn style `base-nova`). Consumers install with `npx shadcn@latest add @mantis/<item>`.
- **`registry.json`** is the catalog: every item's title, description, dependencies and (for blocks) `meta.intent` / `meta.use_when`. Agents choose components by reading it, so descriptions must say what a thing is for.
- **`registry/`** holds item source files; **`components/ui/`** holds the installed primitives Storybook renders.
- **`tokens/mantis.tokens.mjs` is the single source of truth.** Everything under "Never hand-edit" below is generated from it.

## Where it lives

- **Live:** https://mantis-gold.vercel.app (Vercel project `mantis`, team `craftwell-ais-projects`, public). Registry at `/r/<name>.json`, Storybook at `/storybook/`, guides at `/usage/<name>.md`, `llms.txt`, `design.md`.
- **Deploy:** `vercel deploy --prod --scope craftwell-ais-projects` after the gates below pass. `npm run build` builds Storybook into `public/storybook` first. Deploying is outward-facing: only with the owner's OK.
- `components.json` keeps `@mantis` pointed at `http://localhost:3000` on purpose, so work in this repo installs unpublished changes from `npm run dev`.

## Workflow rules

- After ANY change to `registry.json` or `registry/`, run `npm run registry:build` and commit the regenerated `public/r/`.
- After touching tokens, `registry.json`, `usage/` or any `components/ui` props, run `node scripts/build-tokens.mjs`, `node scripts/build-llms.mjs`, `node scripts/build-usage.mjs` and `node scripts/build-agents.mjs`, then commit. `scripts/build-llms.test.mjs` asserts byte equality, so a stale `llms.txt` fails CI.
- Verify before declaring done: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run test-storybook`.
- Stop any running `npm run storybook` before `npm run test-storybook`: the two share Vite and the test run can hang indefinitely while the dev server is up. A first test run after adding stories can fail while Vite optimizes dependencies; re-run once before investigating.
- Never remove or rename a published item without checking who consumes it.
- **Base UI, not Radix.** Compose triggers with the `render` prop (`<DialogTrigger render={<Button variant="outline" />}>…</DialogTrigger>`), never `asChild`. A link that looks like a button is a real `<a>` with `className={buttonVariants({…})}`; `Button` with `render={<a>}` gets `role="button"` and is announced as a button.

## Token rules

- Components read **semantic tokens and shadcn aliases only** (`--background`, `--primary`, `--ground-base`, `--text-secondary`…), never the source layer (`--mantis-*`). `scripts/registry-meta.test.mjs` fails any registry file that reads `--mantis-`. A new need gets a new semantic role or alias in the token module, not a raw source token.
- **One mode: `dark`.** The source ships a single dark theme; `tokens.modes` is `['dark']` and there are no accents. Do not invent a light mode or accents. If one is ever wanted, it is an authored addition and goes through a confirmation with the owner.
- Color roles: lime (`accent.base`, `--ring`) is the brand color. It marks **the one primary call to action on a screen** (generate, sign up, buy or upgrade a plan, the main marketing CTA, or the main action of a focused flow such as upload, download, follow), plus focus, selection and highlight badges (New, plan/allowance tags). One lime action per view or card; no large lime areas besides the announcement bar and the marketing footer (owner decision, 2026-10-02, matching the reference). **`--primary` is white**, the everyday confirm/save action in forms, settings and dialogs. Pink and blue source colors are for sale/discount/value tags and badges only; plans are bought with the lime button, not commerce blue.
- A new color needs a new semantic role, not a new hue for decoration.

## Never hand-edit generated files

- `app/globals.css`: **only** between `/* @tokens:start */` and `/* @tokens:end */`; the rest of the file is hand-maintained
- `registry/mantis-theme.css`
- `tokens/mantis.tokens.json`
- `public/llms.txt`
- `public/r/*.json`
- `components/ui/icons.generated.ts`
- `.storybook/manager-theme.generated.mjs`
- `public/usage/*.md`

Edit `tokens/mantis.tokens.mjs`, `registry.json` or `usage/*.usage.mjs` and regenerate. CI regenerates and runs `git add -A && git diff --cached --exit-code`, so a hand-edit fails the build anyway.

## Provenance and fidelity

- **Reference:** a live web app, harvested 2026-09-29 from the CSS custom properties of its design system (the "source tokens"). **Fidelity: `exact (harvested)`.**
- **Modes:** `dark` only, harvested (the source's `default-light` and `default-dark` selectors share one rule with identical values). Nothing derived. **Accents:** none. **Source tokens:** 484.
- **Renamed, not changed:** the source tokens' own prefix → `--mantis-*`; the source's legacy `--color-*` roles → `--mantis-legacy-color-*`. Omitted: 268 `--rgb` channel duplicates, unused legacy tokens, third-party widget styles.
- **Hybrid source (G2, approved 2026-10-01, evidence in `docs/inventory.md`):** the live product renders page, surfaces and text from its legacy roles, and accents and overlays from its source tokens. The semantic roles follow what renders:
  - `ground.base` → `legacy-color-surface-tertiary` (#0f1113)
  - `ground.raised` / `surface.card` → `legacy-color-surface-primary` (#1c1e20)
  - `text.primary` → `legacy-color-text-primary` (#f7f7f8)
  - `line.base` → `color-border-subtle` (white 5%)
  - `--primary-foreground` → `legacy-color-btn-accent-text` (#131517)
- `color-lime-alpha-08`, `color-commerce-pink` (#ed1572) and `color-commerce-blue` (#1544ed) are hard-coded in the source with no token name; Mantis names them.
- **Values that differ from the source (WCAG 2.1 AA, approved by the owner):**
  - `color.text.secondary`: legacy `font-secondary` `#898a8b` (4.39:1 on inset) → `#8b8c8d` (4.51:1). G2, 2026-10-01.
  - `--commerce-pink`: source `#ed1572` (white label 4.24:1) → `color-commerce-pink-aa` `#e5126d` (4.53:1). 2026-10-01. `tokens/fill-contrast.test.mjs` holds every label-on-fill pair to 4.5:1.
  - Badges (2026-10-01): sale `#ff005b`→`#eb0054`; hot gradient stops →`#da06b3`/`#e5126d`; value gradient stops →`#3259b4`/`#086dff`/`#008389`/`#1e7fa2`; gold text dark ends →`#a98745`/`#ab8744`. `tokens/fill-contrast.test.mjs` checks every gradient stop.
  - `color.status.destructive`: source `text-danger` `#fa0019` (4.46:1) → alias `{color-state-error-fg-soft}` `#ff5462` (4.85:1 worst case). G1, 2026-09-29.
- **Text inputs stay borderless (owner decision, 2026-10-02):** inputs and field textareas match the source exactly, with a white 5% fill, no border and a lime focus ring. This is a known WCAG 1.4.11 gray area at rest, chosen deliberately after a side-by-side comparison. Do not add a resting border. Checkboxes and radios are different: they DO use the 3:1 control border (`--input`), because nothing else shows them.
- **Secondary grey stays on stacked glass (owner decision, 2026-10-02):** where the source stacks see-through surfaces (glass or the field fill, both white 5%, over a card, menu or another glass layer), Mantis does the same and keeps the grey `text-muted-foreground` (#8b8c8d). Measured by axe: 4.33:1 on one layer over a card or menu, 4.39:1 on two layers over the page, 3.71:1 on two layers over a card, all below AA 4.5:1. Chosen deliberately to match the source; earlier workarounds (inset, outlined or card surfaces in their place) were reverted. The mechanism is the `data-contrast-exempt` attribute on the grey text element itself: `.storybook/preview.tsx` skips axe's color-contrast rule for that element only. Use it **only on secondary grey text on stacked glass; never use `data-contrast-exempt` elsewhere**, never on a container, and never on primary text. `scripts/contrast-exempt.test.mjs` holds the allow-list of files that may use it.
- **Small contrast lifts in components (2026-10-02):** the destructive button tint is 10% (20% put its red text at 4.49:1 inside dialogs), and inactive tabs in the glass tab bar are white 70% (the grey read 4.33:1 when the bar sits on a card).
- **Icons:** Material Symbols Rounded, weight 300 (owner-approved 2026-10-01). The source's icon set is commercial or custom and is never copied.
  - **Never "correct" these back toward the source value.** That reintroduces a contrast failure.
- **Known gaps:** the source's responsive type steps (768px / 1280px) are not yet emitted. Source `text-tertiary` `#626262` is 3.02:1 on the page, so use it only for disabled text, never for readable content. White on the source's solid red destructive button is 4.13:1; the destructive button must not use that pair.
- **Nothing-copied check (G3), 2026-09-29:** no findings. No source text, model names, images, icons or logos in any component, story, guide or page.

## The content rule

Styles, properties, tokens, layouts, component anatomy and interaction patterns
are replicated exactly. **The source's writing and imagery are never copied**:
they are its proprietary content. Everything the generated system renders gets
its own content instead:

| Source content | Replace with |
|---|---|
| Text — headlines, taglines, body copy, button and link labels, empty/error/onboarding messages, microcopy | Real sentences written fresh for that spot and the client's domain. Not lorem ipsum, and not a reworded version of the source's sentence. |
| Photos and illustrations | A placeholder area holding a Lorem Picsum photo (Picsum serves Unsplash photos; no key): `https://picsum.photos/seed/<slug>/<width>/<height>`. `<slug>` is a short word naming the spot (`hero`, `team`, `product`), so each spot gets its own random photo that stays put across reloads. Give it `alt` text describing the placeholder's role. |
| Icons | Google Material Symbols through the system's own `Icon` component (`<Icon name="close" />`). Add any name you need to `scripts/icons.manifest.mjs` and run `node scripts/build-icons.mjs`. Never the source's icon set or its custom icons. |
| Logos and logo-like marks | An empty placeholder area sized for the logo, with an accessible label (`role="img"`, `aria-label="<Client> logo"`). Never the source's logo, and never a redrawn lookalike. |

This covers every artifact the run produces: components and blocks, the
system's own pages, samples, stories, and docs.

## Icons

Only from `components/ui/icon` (Material Symbols). To add one: put its name in `scripts/icons.manifest.mjs`, run `node scripts/build-icons.mjs`, then `npm run registry:build`, and commit.

## Paper boards

The Paper file "Mantis Design System" has one page per item: `❖` components, `◆` patterns, `▣` templates, each A–Z. The pattern and template boards are generated from the live Storybook, so rebuild them after a pattern change is deployed:

- `npm run paper:boards` rebuilds all of them; `npm run paper:boards -- pricing-card` only the named ones. Paper must be running with the file open (the scripts call Paper's local MCP endpoint).
- Which stories a board shows is listed in `scripts/paper/boards.mjs`. A story is captured in the state its interaction test ends in, so check the picture, not the story name.
- Review the result in `.paper-build/boards/` (git-ignored). Icons the boards use are written to `design/svg/` and committed.
- The component (`❖`) boards and Foundations are hand-maintained; the scripts only move them when pages need reordering.

## Maintained copies of shadcn components

`dialog`, `dropdown-menu` and `sonner` are this registry's own copies of shadcn's `base-nova` versions, with Material Symbols in place of Lucide. When shadcn updates one upstream, take the new file and re-apply only the icon swap.

## Stories and usage guides

A new item or roster primitive ships its usage guide (`usage/<name>.usage.mjs`, listed in `usage/index.mjs`) and story (`stories/<name>.stories.tsx`) in the same change. Run `node scripts/build-usage.mjs`; `npm run test-storybook` must pass. axe runs on every story, so never switch a rule off to get a green run. Fix the component.
