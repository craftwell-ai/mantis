# Mantis component inventory

The complete list of what Mantis must build to match the reference product, with the evidence for each item. This is the build list for Phases 3, 5 and 6 (Linear CRA-257, CRA-259).

## How this was audited

| Pass | Coverage | Method |
|---|---|---|
| Public site | 85 pages (every page linked from the home page; near-identical template variants sampled once) | Headless browser harvest of every visible button, link, field, tab, badge, card and heading: computed size, padding, radius, colors, font, case, shadow, blur |
| Logged-in app | 28 routes, including studios, canvas, assets, library, community, profile and all six settings pages | Same harvest run inside a signed-in session (read-only) |
| Overlays | 12 opened states: model pickers (image + video), aspect, quality, duration, add-media panel, preset gallery, ⌘K search, notifications, account menu, tooltip | Opened, measured, closed. Nothing submitted, generated or purchased |
| Mobbin | ~60 curated screens and flows | Used for states the live pass could not trigger (paid-plan screens, generation results) |

Raw measurements (1,268 public + 673 app style signatures, 296 icon shapes) are kept outside the repo. They contain the reference's labels, which Mantis never ships.

**Evidence key:** **L** = measured live · **M** = seen on Mobbin only (not yet measured).

**Status key:** ✅ built · 🔜 planned · ⛔ excluded (reason given)

---

## Token correction found by the audit (approved and applied 2026-10-01)

Phase 1 captured the reference's newer design-system token set (the "source tokens"). The audit shows the **rendered** UI is a hybrid:

- **From the source tokens:** accents and overlays, such as lime, pink, and the white-alpha borders and hovers.
- **From the reference's legacy set:** everyday text, surfaces and the page background.

Of 105 colors in use, only 43 are Mantis tokens today.

Proposed role changes (values measured live):

| Role | Phase 1 (from the source tokens) | Rendered value | Legacy token | Reach |
|---|---|---|---|---|
| `ground.base` (page) | `#131416` | `#0f1113` | `color-surface-tertiary` | html/body on the home page, pricing and the studios |
| `ground.raised`, `surface.card` | `#1c1e21` | `#1c1e20` | `color-surface-primary` | 48 pages |
| `text.primary` | `#ffffff` | `#f7f7f8` | `color-text-primary` | 85/85 pages |
| `text.secondary` | `#8c8c8c` (adjusted) | `#898a8b` → **`#8b8c8d`** (WCAG lift; 4.39 → 4.51 on inset) | `color-font-secondary` | 49 pages |
| `primary-foreground` (label on white/lime) | `#1a1a1a` | `#131517` | `color-page-primary` / `btn-accent-text` | 76 pages |
| `line.base` (hairline) | white 10% | white 5% | `border-subtle` (already captured) | 83 pages |
| `surface.inset` | `#23262a` | unchanged | `background-secondary-strong` | 17 pages |

Also to add as source tokens: `color-font-disabled #737475`, `color-button-secondary #2e3031`, the legacy gray scale, a lime 8% tint (secondary brand button fill), the pricing pink `#ed1572` and blue `#1544ed`, and the switch-off track `#5e636e`.

---

## Icons

**What the reference uses (L):**
- A commercial or custom line set: 24px grid, 1.5 stroke, round caps.
- 296 distinct shapes across the app; 1.5 stroke on 615 uses. About 1,300 are drawn as filled shapes; outline icons exported this way look the same as stroked ones.
- No open-source library matches its path data, so it cannot be copied.

**Decision:** switch `Icon` from Material Symbols *Outlined 400* to **Material Symbols Rounded, weight 300**, with its filled variant where the reference shows solid glyphs. It is the closest licensable match: same stroke weight and round caps, and the only candidate with filled versions. Not pixel-identical. ✅ (applied 2026-10-01)

---

## 1. Foundations

| Item | Evidence | Measured | Status |
|---|---|---|---|
| Color tokens (source tokens, 484) | L | see `tokens/mantis.tokens.mjs` | ✅ |
| Legacy color roles (above) | L | see table above | ✅ approved and applied (G2) |
| Type: Inter body, Inter Display headings, Space Grotesk, IBM Plex Mono | L | display headings uppercase, tight tracking | ✅ |
| Responsive type steps at 768 / 1280px | L | `type-size-400…1400` step up at both widths | ✅ via Heading |
| Radius `050–600`, full | L | chips 8px, inputs 10px, cards 12–16px, dialogs 16–24px | ✅ |
| Shadows (raised, overlay, modal, inset-tile) | L | inset top highlight + soft drop | ✅ |
| Glass / backdrop blur | L | 12px (tab bars), 32px (dialogs) | 🔜 token |
| Motion: durations 120–260ms, easings (swift, emphasized, spring) | L | | ✅ tokens · 🔜 component use |
| Gradients (badge, glass sheen, gloss) | L | | ✅ tokens |
| Icon set | L | see Icons | ✅ Material Symbols Rounded 300 |

## 2. Primitives

| Component | Variants / states (measured) | Evidence | Status |
|---|---|---|---|
| **Button** | **brand lime** (credit cost slot), **primary white**, **secondary** (`#2e3031`), **ghost**, **lime-tint** (lime 8%), **destructive**, **commerce pink / blue**; sizes 24 · 28 · 36 · 40 · 48 · 52px; radius 8 / 10 / 12 | L | ✅ |
| **Icon button** | 28–36px square, ghost and filled | L | ✅ |
| **Badge / tag** | lime-on-lime-20% (10px/700), gradient fill, white-20% neutral (10px/600, tracking 0.2px), pink sale, blue value, status | L | ✅ |
| **Chip (setting chip)** | composer chips: icon + label, `surface` fill, 1px white-4% border | L | ✅ |
| **Input** | 40px (r10, white-5% fill), 44px (r12); search variant with shortcut hint | L | ✅ |
| **Textarea** | prompt style: borderless, 14–18px, auto-grow | L | ✅ |
| **Select / dropdown** | trigger + listbox with check on selected; capitalized options 46–62px | L | ✅ |
| **Combobox** | searchable picker | L | ✅ |
| **Checkbox** | | L | ✅ |
| **Radio / radio card** | 40px pill segments (r10); radio cards with corner check | L + M | ✅ |
| **Segmented control** | aspect ratios; active white segment | L + M | ✅ |
| **Switch** | 24px track, off `#5e636e`, on lime; small 16px variant | L | ✅ |
| **Slider** | 12px white thumb, secondary-gray value | L | ✅ |
| **Stepper** | −/value/+ (batch count) | L | ✅ |
| **Tabs** | underline (52px, white/tertiary), pill (32–40px, full radius), glass tab bar (50px, white-5%, blur 12px) | L | ✅ |
| **Tooltip** | small dark label above trigger | L | ✅ |
| **Popover** | dark surface, white-4% border, shadow | L | ✅ |
| **Menu** | with search, section labels, icon tiles, badges, check on selected | L | ✅ |
| **Dialog** | r16–24, `#131517` or glass `#1c1e20`/95% + blur 32px, white-4% border | L | ✅ |
| **Alert dialog** | type-to-confirm destructive | M | ✅ |
| **Sheet / side panel** | settings rail | L | ✅ |
| **Toast** | dark, status icon | L (CSS only) | ✅ |
| **Avatar** | initials and image, sizes | L | ✅ |
| **Progress / credit meter** | lime fill, dotted meter, stacked bar | L + M | ✅ |
| **Spinner / queue overlay** | | M | ✅ |
| **Skeleton** | grey tiles while loading | L | ✅ |
| **Kbd** | ⌘K hint | L | ✅ |
| **Accordion** | | M | ✅ |
| **Separator** | | L | ✅ |
| **Icon tile** | colored rounded square behind an icon (nav, menus, settings) | L | ✅ |
| **Table** | usage/billing: header filters, pagination | L + M | ✅ |
| **Card** | media card (r16, image fill), glass card (white 5%, r12), outlined card (`#131517`, white-4% border, r16) | L | ✅ |
| **Countdown** | offer timer badge (hh:mm:ss tiles) | L | ✅ built as a pattern (Phase 5) |
| **Announcement bar** | full-width lime bar with CTA | L | ✅ built as a pattern (Phase 5) |

## 3. Patterns

| Pattern | What it is | Evidence | Status |
|---|---|---|---|
| **Top navigation** | logo, section links (lime active), badges, search, pricing with sale tag, assets, avatar | L | ✅ |
| **Prompt composer** | add, element, prompt, model chip, setting chips, batch stepper, lime Generate with credit cost | L | ✅ |
| **Model picker** | searchable list, featured/all groups, icon + name + description, badges, check on selected | L | ✅ |
| **Studio settings panel** | left rail: preset card, references, prompt, model row, setting chips, bitrate, generate | L | ✅ |
| **Preset gallery** | model tabs + search, media tiles with uppercase title | L | ✅ |
| **Add-media panel** | tabs (uploads, elements, generations, liked), grid, skeletons | L | ✅ |
| **⌘K command palette** | search, filter chips, recents, featured cards, two-column trending list | L | ✅ |
| **Notifications panel** | tabs (all, requests, unread), empty state | L | ✅ |
| **Account menu** | identity, credit meter, upsell rows, menu items | L | ✅ |
| **Generation feed / history** | media + metadata rail, list/grid toggle, zoom slider | L + M | ✅ |
| **Media grid (masonry)** | community/explore | L | ✅ |
| **Lightbox + inspector** | prompt, info list, recreate, action grid | M | ✅ |
| **How-it-works strip** | 3 steps with media | L | ✅ |
| **Empty state** | fanned stack, dashed placeholder grid with CTA, radial-glow hero | L | ✅ |
| **Pricing card + plan matrix** | tier colors, billing toggle, credit slider, feature list | L | ✅ |
| **Promo / upsell modal** | | L + M | ✅ |
| **Agent approval card** | human-in-the-loop approve / stop / always allow | M | ✅ |
| **Share dialog** | invite chips, role select, visibility radio cards, copy link | M | ✅ |
| **Feed post** | author, text, media, reactions | M | ✅ |
| **Settings section card** | stacked rounded section cards | L | ✅ |
| **Session list** | device rows with actions | L | ✅ |
| **Usage table + stacked usage bar** | | L + M | ✅ |
| **Onboarding steps** | progress bar, choice cards, multi-select grid | M | ✅ |
| **Marketing hero / feature grid / product tiles** | | L | ✅ |
| **Footer** | | L | ✅ |

## 4. Page templates

| Template | Evidence | Status |
|---|---|---|
| App shell (top nav + content) | L | ✅ |
| App shell with sidebar (studio, settings, supercomputer) | L | ✅ |
| Image studio (centered hero + bottom composer) | L | ✅ |
| Video studio (left settings rail + canvas) | L | ✅ |
| Studio home (hero + composer + project grid) | L | ✅ |
| Explore / community gallery | L | ✅ |
| Profile (sidebar identity + tabbed works + empty states) | L | ✅ |
| Settings (nav + section cards) | L | ✅ |
| Asset library | L | ✅ |
| Pricing | L | ✅ |
| Marketing / tool landing page | L | ✅ |
| Canvas (infinite board + floating toolbar) | L | ✅ shell only |

## 5. Excluded, and why

| Item | Reason |
|---|---|
| The reference's own text, images, logos, AI model names, custom icons | Content rule: never copied. Replaced by fresh copy, Picsum placeholders, Material Symbols, empty logo slots |
| Video player internals, canvas engine, agent runtime | Product functionality, not a design system. Mantis ships their visible chrome (toolbars, controls, panels) only |
| Third-party widgets (cookie banner, Google sign-in button styling) | Not part of the reference's design language |
| Paid-plan-only screens not seen on Mobbin | Not observable on a free account. Will be marked **M** or added if seen later |
| One-off marketing-campaign art (custom page backgrounds such as `#0b0b0b`, hand-drawn lettering) | Campaign assets, not system components |
