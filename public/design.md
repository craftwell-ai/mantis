# Mantis — design intent

How Mantis should *feel*, and the composition habits that produce that feel. AGENTS.md says **which** component and token to use; this file says **why**, so a new screen looks like it belongs.

Every visual fact here was measured from the reference product (see `docs/inventory.md` for the evidence). Where a choice is a Mantis decision rather than a measurement, it says so.

## The feel

**A dark cinema for the work.** The interface is a near-black stage (`background`) whose job is to make generated images and video the brightest thing on screen. Chrome recedes; media glows.

- **Layered near-blacks, not borders.** Depth comes from stepping surfaces up: page `background` → panel `card` → inset `field` / `chip`. Edges, where needed, are hairlines of white at 4–10% (`separator`, `divider`, `glass-border`), never grey lines.
- **Translucency for floating chrome.** Tab bars, toolbars and some dialogs are glass: white at 5% over the content, with blur (12px on tab bars, 32px on dialogs). They float over media instead of boxing it in.
- **One loud color.** Lime (`brand`) is the only saturated color in everyday UI, and it marks *the one thing to do here*: generate, sign up, buy a plan, or the main step of a focused flow. Everything else is white, grey or translucent. When lime appears, the eye goes there, so each view, card or dialog gets one lime action at most.
- **Quiet text.** Body copy is small Inter in off-white (`foreground`), with secondary text in grey (`muted-foreground`). Hierarchy comes from size and weight, not color.
- **Loud headlines.** Marketing and section headings are uppercase Space Grotesk, bold, with tight tracking, often with one word in lime (`HeadingAccent`). They are the exception that makes the quiet UI feel intentional.

## Color, by job

| Job | Use | Never |
|---|---|---|
| The one main call to action: generate, sign up, buy or upgrade a plan, the main marketing CTA, the main action of a focused flow (upload, download, follow) | `Button variant="brand"` (lime); `depth="glossy"` for Generate, `depth="raised"` for marketing and plan buttons | Two lime actions in one view, card or dialog; lime for Save, Continue, links or decoration |
| Everyday confirm or save inside forms, settings and dialogs (Save, Continue, Invite) | `Button` default (white, dark label) | Two filled buttons side by side |
| Secondary actions | `secondary`, `glass`, `outline`, `ghost` | `destructive` to make something stand out |
| Selection and focus | lime: checked boxes, switches that are on, the focus ring (`ring`), the active top-nav link | Lime fills on large areas (the announcement bar and the marketing footer are the only lime areas) |
| Highlights | lime `Badge` `new` or `tag`: "New", a plan or allowance highlight such as "Unlimited", a free-generations counter | Lime badges on everything in a list |
| Sales and offers | `sale`, `badge-hot`, `badge-value`, `commerce-pink` for discount tags and badges | Pink or blue buy buttons (plans buy with lime); pink or blue outside offers |
| Danger | `destructive` (a soft red), confirmed in an `alert-dialog` | Red for errors that are not about loss |
| Category color | `IconTile` colors (blue, purple, pink, orange, mint, brown) | Tile colors as text or fills elsewhere |
| Data series (stacked bars, charts) | `chart-1` … `chart-5`, always with a legend that names each one | Tile or commerce colors for data |

## Shape and density

- **Radius grows with size.** Chips and small buttons are 8px, inputs and controls 10px (`rounded-control`), cards 12–16px, dialogs 16–24px. Pills (`rounded-full`) are for tags, segmented tabs and avatars.
- **Controls are compact.** Buttons run 24–52px tall; most app controls are 32–40px. The reference is a dense tool, not a spacious marketing page — except on marketing pages, which go big.
- **Media fills its frame.** Media cards are image-first with text on or under the image, not beside a thumbnail.

## Motion

- **Hover dims, press dims more.** Interactive surfaces go to 80% brightness on hover and 60% on press, over 200ms. Nothing scales or bounces.
- **Loading shimmers.** Skeletons use the vertical shimmer (`animate-shimmer`); queued work shows a `Spinner` with a status word.
- Respect `prefers-reduced-motion`: the primitives already stop spinning and shimmering for it.

## Composition recipes

These are the shapes the reference repeats. Build new screens from them.

- **Composer:** a panel holding a prompt `Textarea variant="prompt"`, a row of setting chips (`Select` chip triggers, `Stepper` for batch size) and, at the right end, the one lime Generate button with its credit cost.
- **Picker:** a `Popover` or `DropdownMenu` with a search field at the top, group labels, rows of icon + name + one-line description, a badge where something is new, and a check on the selected row. Long lists use `Combobox`.
- **Settings page:** a left nav whose rows lead with an `IconTile`, and stacked `card` sections, each with a title, a short description and its controls.
- **Gallery:** a grid of media `Card`s with an uppercase title; filters as pill `Tabs` above it.
- **Empty state:** a dashed placeholder or soft radial glow, one sentence saying what goes here, and one button to start.

## Content

All copy is written fresh for the product being built: plain, specific, sentence case (headlines excepted). Placeholder images come from Picsum (`https://picsum.photos/seed/<slug>/<w>/<h>`) with real `alt` text. Logos are empty labelled slots. Nothing — text, imagery, icons, logos or model names — is copied from the reference.

## Mantis decisions (not measurements)

- **Icons** are Material Symbols Rounded at weight 300: the closest licensable match to the reference's custom set, not a copy of it.
- **A few colors are lifted for contrast** (WCAG 2.1 AA): secondary text, the commerce pink, the sale and badge gradients, the destructive red. They are listed in CLAUDE.md. Never move them back toward the reference.
- **Text inputs stay borderless** at rest, exactly like the reference, by owner decision. Checkboxes and radios do get a 3:1 border.
- **Grey text stays on stacked glass**, exactly like the reference, by owner decision: panels and tiles that stack glass or the field fill on a card, a menu or more glass keep their see-through surface and the grey `muted-foreground`, even though it measures 3.7–4.4:1 there. Only that grey text carries `data-contrast-exempt`; nothing else may.
