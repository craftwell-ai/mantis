# Changelog

## [1.9.0] - 2026-10-19
- Colour transparency steps (bg-brand/50 reads the source's alpha series), breakpoints, panel and menu widths (w-panel, min-w-menu…), ring-focus and blur-stage are Mantis tokens; mantis-check flags off-scale transparency and arbitrary breakpoints, reads radius lines in any @theme block, and no longer flags line-height shorthand; repo lint stops numeric opacity, z-index, ring-3 and stock blurs; flaky stories fixed. Same pixels, except the home page's header and install box move to the 80% and 90% steps

## [1.8.0] - 2026-10-19
- Opacity, layer, container-width and motion utilities read Mantis tokens (opacity-disabled, z-floating, max-w-md, duration-normal), text sizes take Mantis line heights, and mantis-check flags the rest, including shadcn radius lines left after the theme import (radius-override)

## [1.7.0] - 2026-10-17
- Size tokens: icons (size-icon-3xs…3xl, 8–28px), controls (h-control-2xs…3xl, Button's own ladder) and the 44px tap target (h-tap) are named tokens, and the primitives and blocks use them. Same pixels. mantis-cn knows the names, so a size passed to a component replaces its own. mantis-check suggests them (h-9 → h-control) and reports a theme or mantis-cn too old for them.

## [1.6.1] - 2026-10-16
- mantis-check uses quill-check's rule ids and labels: off-scale steps and Tailwind's own named values are both `scale` (was off-scale and stock-value), and the report pads labels to 12 like quill-check, so the Quill CLI shows both systems' findings the same way.

## [1.6.0] - 2026-10-16
- mantis-check enforces the Mantis scales: off-scale Tailwind steps (p-13, w-105, border-4), Tailwind's own named values (leading-normal, tracking-wide, font-light), hard-coded numbers in style={{ }}, and raw spacing, radius, type, border, shadow and colour values in app .css files are findings. Bracket fixes name the nearest Mantis step (p-[13px] → p-3) and cover border, shadow, weight, line height and tracking.

## [1.5.0] - 2026-10-16
- Tailwind's spacing, border, ring and outline widths, font weights and leading steps now read Mantis tokens: p-4 compiles to var(--mantis-space-400), border-2 to var(--mantis-border-width-thick). Same pixels; new border-0.5 and border-1.5 classes.

## [1.4.0] - 2026-10-12
- Each of the nine page templates states its layout: a `Composition` line in the item's `docs`, listing its pieces in order, so tools know how a page is stacked and not only what it uses

## [1.3.0] - 2026-10-12
- New registry item `check`: `npx shadcn@latest add @mantis/check` installs `scripts/mantis-check.mjs`, a self-check for apps built on Mantis that lists every place the code stepped outside the system, with the fix

## [1.2.0] - 2026-10-12
- Published icons as drawings: `public/icons/<name>.svg` for every shipped icon, plus `public/icons/index.json`
- Each guide in `public/usage/index.json` carries a `hash` (the SHA-256 of its JSON), so tools notice a reworded rule

## [1.1.1] - 2026-10-12
- Home page: the studio settings preview uses the neon city photos, in line with the rest of the samples

## [1.1.0] - 2026-10-12
- Sample pictures in blocks, templates and stories are now free Unsplash photos chosen to share one look: a neon-lit street or city view at night with a purple cast (`photo(spot, width, height)` in the sample content). Picsum's random photos and the stock footage are gone
- New `placeholder(width, height)` draws television static for a spot with no picture yet, and `PLACEHOLDER_CLIP` is a short static clip for the video player

## [1.0.4] - 2026-10-12
- Video studio page: the sample's newest clip is real night-street footage, so the canvas shows the video player; the preset picture matches it

## [1.0.3] - 2026-10-11
- Maintainer rules: Paper is the design source of truth and is synced after every Storybook release; Figma is no longer updated
- Removed the unused Figma variable reader (`scripts/figma-variables.mjs`); nothing in Mantis read from it

## [1.0.2] - 2026-10-10
- Home page: the Canvas card's Reference step shows a file name like the other steps, not a blurred gradient

## [1.0.1] - 2026-10-09
- Changelog: the 1.0.0 entry now lists the usage guides published as data, which shipped in 1.0.0 but was left out
- The bump script dates entries by the local calendar, not UTC

## [1.0.0] - 2026-10-07
- First stable release: from here, nothing published is renamed or removed without a major version bump
- Home page, favicon and the mantisdesignsystem.com address
- New blocks: workflow canvas, event map, video player, usage chart, compare slider and upload dropzone
- Every usage guide is also published as data (`/usage/<name>.json`), with a list of all guides at `/usage/index.json`, for tools that read the system
- Site footer lays out from its own width, so it no longer breaks in a narrow area on a wide screen
- Paper boards for every pattern and template, built by script from Storybook
- A version bump and changelog entry now go with every change
- Pushing to main now deploys the site; no deploy command is needed

## [0.1.0] - 2026-07-26
- Template package baseline.
