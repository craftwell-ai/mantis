---
name: mantis-build
description: Build a screen, pattern or block with the Mantis design system — a prompt composer, picker, settings page, pricing card, any new UI in this repo. Use whenever adding or changing UI here, so it composes existing Mantis components and tokens, passes the lint guards and axe, and ships with its usage guide and story.
---

# Build with Mantis

AGENTS.md (already loaded through CLAUDE.md) is the index: components, their real props, token utilities, rules. This skill is the procedure.

## 1. Plan from what exists

1. Find the closest **composition recipe** in `DESIGN.md` (composer, picker, settings page, gallery, empty state) and the matching row in `docs/inventory.md` §3–4 if it is a planned pattern.
2. List the primitives you will use from AGENTS.md › Components. If something seems missing, check again under another name (a "segmented control" is `toggle-group variant="segment"`, a "chip" is a `Select` chip trigger or `Badge`).
3. Only if no primitive fits, stop and ask before adding one. A new primitive is a design-system change, not a pattern detail.

## 2. Write the block

- File: `registry/<name>.tsx`, kebab-case name, exporting one PascalCase component.
- Import primitives from `@/components/ui/<name>`; icons only via `<Icon name="…" />`.
- Colors, radius, shadows and type come from token utilities only. If a value seems to need a hex code or `[13px]`, there is a token or scale step for it; `npm run lint` will reject the raw value anyway, and its message names the fix.
- Lime `brand` only on the one main call to action of the view (generate, sign up, buy a plan, or the main action of a focused flow); everyday Save/Continue/Invite stay white. One lime action and one filled button per view, card or dialog.
- Content: write real, specific copy for a creative-AI product; Picsum seeds for images with real `alt`; logos as empty labelled slots. Never reuse the reference product's wording, model names or imagery.
- Accessibility: every control has a visible label or `aria-label`; headings in order; nothing conveyed by color alone.

## 3. Document it

- `usage/<name>.usage.mjs` with `kind: 'block'`: summary, useWhen, alternatives, rules (`visual: true` rules need a Do/Don't pair in the story), a11y, tokens. Copy the shape of an existing guide such as `usage/stepper.usage.mjs`.
- `stories/<name>.stories.tsx`: a default story, the important states (empty, loading, error, long content), and `DoDontPair` stories for each visual rule. Follow `stories/stepper.stories.tsx`.

## 4. Register and regenerate

```bash
node scripts/register-block.mjs <name> "<title>" "<what it is>" <intent,intent> "<when to reach for it>"
node scripts/build-tokens.mjs && node scripts/build-llms.mjs && node scripts/build-usage.mjs && node scripts/build-agents.mjs
npm run registry:build
```

Intent tags come from `scripts/registry-intent-tags.mjs`; the script rejects unknown ones.

## 5. Verify, then say done

```bash
npm run lint && npx tsc --noEmit && npm test
pkill -f "storybook dev -p <port>"; npm run test-storybook   # stop YOUR dev server first (only the port you started) or the run hangs
```

Then look at it: start Storybook and use the Storybook MCP `stories-preview` tool (or a screenshot) to compare against the recipe in DESIGN.md. axe passing is necessary, not sufficient — the screen must also look like Mantis.

Report what you built, which primitives it uses, and the check results. If a check failed, say so with its output; never switch an axe rule or lint rule off to get a green run.
