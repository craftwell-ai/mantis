# Mantis

A dark, cinematic design system for AI-native creative tools: prompt composers, model pickers, generation feeds, credits and community galleries. Mantis is a **shadcn registry** built on **Base UI**, so people and coding agents install its tokens and components by name.

## Install

Live at **https://mantis-gold.vercel.app**: the registry, [Storybook](https://mantis-gold.vercel.app/storybook/), [llms.txt](https://mantis-gold.vercel.app/llms.txt) and every usage guide.

In a Next.js app set up with `npx shadcn@latest init` (style `base-nova`), register the namespace in `components.json`:

```json
"registries": { "@mantis": "https://mantis-gold.vercel.app/r/{name}.json" }
```

Then install the base first, and patterns or page templates by name:

```bash
npx shadcn@latest add @mantis/base
npx shadcn@latest add @mantis/prompt-composer @mantis/pricing-page
```

## How consumption works

1. **Install `base` first.** It brings the theme file (`app/mantis-theme.css`), the class helper (`lib/mantis-cn.ts`), the Material Symbols `Icon`, every core component, and `MANTIS.md`, the guide AI coding agents read. All of them are Mantis's own copies, styled by its tokens.
2. **Import the theme.** Add `@import "./mantis-theme.css";` to the top of `app/globals.css`, after `@import "shadcn/tailwind.css";` (keep that one). The CLI does not add it.
3. **Set `data-theme="dark"` on `<html>`.** Mantis has one theme, and it is dark.
4. **Load the fonts with the Google Fonts stylesheet, not `next/font`.** The theme names Inter, Inter Display, Space Grotesk and IBM Plex Mono literally, and `next/font` renames families.
5. **Point your agents at `MANTIS.md`** from your `AGENTS.md` (and `@MANTIS.md` in `CLAUDE.md`).

The `base` item's `meta.usage` in `registry.json` spells out every manual step, including the clean-up of `shadcn init`'s competing CSS block. Verified 2026-10-02 against a fresh Next.js 16 app.

## What's inside

| Layer | Where | What it is |
|---|---|---|
| Source tokens | `tokens/mantis.tokens.mjs` → `source` | The reference's tokens (color, type, space, radius, shadow, motion, z-index, gradients), three tiers: primitives → semantic → component |
| Semantic roles | `tokens/mantis.tokens.mjs` → `color`, `radius`, `text`, `shadow`, `font` | The 13 roles components read, each aliasing a source token |
| Theme CSS | `registry/mantis-theme.css` (generated) | What consumers import |
| DTCG export | `tokens/mantis.tokens.json` (generated) | W3C Design Tokens 2025.10 format, for Figma, Style Dictionary and Tokens Studio |
| Agent index | `AGENTS.md` (generated) | The always-loaded cheat sheet for AI coding agents: rules, every component with its real props, every token utility |
| Design intent | `DESIGN.md` | Why Mantis looks the way it does, and the composition recipes new screens follow |
| Public catalog | `public/llms.txt` → `llms-components.txt`, `llms-tokens.txt` (generated) | The llms.txt index and its two catalogs, for agents outside this repo |
| Agent connections | `.mcp.json` | shadcn MCP (search and install `@mantis/*`) and Storybook MCP (live stories and docs) |
| Lint guards | `eslint.config.mjs` | Fails raw colors, Tailwind's stock palette, arbitrary pixels, `asChild`, Lucide and Radix |
| Storybook | `npm run storybook` → `:6006`, deployed at `/storybook/` | A story, usage guide and axe accessibility check for every component |

## Provenance

- **Reference:** a live web app, captured 2026-09-29 from its computed CSS custom properties (its design-system namespace, the "source tokens").
- **Fidelity:** `exact (harvested)`. One mode, `dark`, harvested; the source ships a single dark theme, so nothing was derived.
- **Accents:** none (single brand).
- **Source token count:** 512 tokens.
  - 484 come from the source's design-system tokens.
  - 25 come from its legacy `--color-*` system: the roles its pages actually render, prefixed `legacy-`.
  - 3 are colors the source hard-codes with no token name: `lime-alpha-08`, `commerce-pink`, `commerce-blue`.
  - Omitted: the 268 `--rgb` duplicate channels, unused legacy tokens, and third-party styles.
- **Renamed, not changed:** the source tokens' own prefix ships as `--mantis-*`, and legacy `--color-*` as `--mantis-legacy-color-*`, with identical values.
- **Hybrid, as rendered (live audit 2026-10-01, `docs/inventory.md`):** page, surfaces and text use the legacy roles (e.g. page `#0f1113`, text `#f7f7f8`); accents and overlays use the source tokens.
- **Values that differ from the source (WCAG 2.1 AA only, approved by the owner):**

| Role | Source | Ships as | Why |
|---|---|---|---|
| `color.text.secondary` | legacy `font-secondary` `#898a8b` (4.39:1 on inset fills) | `#8b8c8d` (4.51:1) | Smallest lightness lift to reach 4.5:1 text contrast (G2, 2026-10-01) |
| `--commerce-pink` (pricing CTA fill) | `#ed1572` (white label 4.24:1) | `#e5126d` (4.53:1) | Nearest passing shade (2026-10-01) |
| Badge `sale` fill | `#ff005b` (white 3.89:1) | `#eb0054` | Nearest passing shade (2026-10-01) |
| Badge `hot` gradient | `#f920d1`→`#ed1572` (white 3.41–4.24:1) | `#da06b3`→`#e5126d` | Nearest passing stops (2026-10-01) |
| Badge `value` gradient | `#3259b4`→`#3c8cff`→`#00c8d2`→`#78c9e6` (white down to 2.06:1) | `#3259b4`→`#086dff`→`#008389`→`#1e7fa2` | Nearest passing stops (2026-10-01) |
| `gold` gradient text | dark ends `#826835`/`#806533` (~3.2–3.6:1) | `#a98745`/`#ab8744` | Nearest passing on every surface (2026-10-01) |
| `color.status.destructive` | `text-danger` `#fa0019` (4.46:1 on the page) | `state-error-fg-soft` `#ff5462` (4.85:1 worst case) | The source's own softer error ink passes everywhere (G1, 2026-09-29) |

- **Icons:** the source's icons are a commercial or custom set and are not copied. Mantis uses Material Symbols **Rounded, weight 300**, the closest licensable match.

- **Known gap:** the source enlarges type sizes at 768px and 1280px widths. Mantis currently ships the base (mobile) sizes only.
- **Content:** no text, images, icons or logos were copied from the reference. Images are Lorem Picsum placeholders, icons are Material Symbols.

## Develop

```bash
npm install
npm run dev              # registry + landing page on :3000
npm run storybook        # component workshop on :6006
npm test                 # token, WCAG, registry and usage tests
npm run test-storybook   # renders every story and runs axe on each
npm run registry:build   # regenerates public/r/*.json
```

Agents working in this repo: `CLAUDE.md` loads `AGENTS.md`; to add a pattern, follow the `mantis-build` skill (`.claude/skills/mantis-build/`).
