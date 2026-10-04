# generation-feed (block)

A person's generation history: an edge-to-edge grid of results with a zoom slider that changes tile size, or a list that puts each result beside its prompt, model, settings and time, with Reuse prompt and Download. Shows skeletons while loading, a shimmering tile for work still generating, and a dashed placeholder when empty.

### When to use
- A studio or library page shows everything someone has generated, newest first, and they switch between scanning pictures and reading prompts.
- People need to find an earlier result and reuse its prompt or download it.

### Reach for instead
- **media-grid** — when the grid shows other people's work in a community or explore gallery, with authors and likes
- **project-card** — when each item is a whole project with a name, not a single generation
- **empty-state** — when you need a richer first-run screen than the built-in empty placeholder

### Rules
- **Do:** Let the pictures fill the grid with 2px gutters and keep per-tile actions hidden until hover or focus. **Don't:** Wrap every tile in a card with a title, border and a row of always-visible buttons.
- **Do:** Use glass and ghost buttons for Reuse prompt and Download in each entry; keep the one lime Generate in the composer. **Don't:** Put a lime Recreate button on every row, so the page shows a dozen generate actions.
- **Do:** Pass `loading` until the first page arrives, so skeleton tiles hold the layout; show the empty placeholder only when the result is truly empty. **Don't:** Flash "Nothing generated yet" while the request is still in flight.
- **Do:** Write `alt` as a short description of what the result shows; the prompt lives in the list rail. **Don't:** Reuse the full prompt as alt text, so screen readers read a paragraph per tile.

### Accessibility
- The layout switch is a toggle group labelled "Layout" with "Grid" and "List" items; the zoom slider is labelled "Tile size" and shows zoom-out and zoom-in icons at its ends.
- Each tile opens through a full-tile button named "Open: &lt;alt>"; hover actions are real buttons in the tab order and become visible on focus.
- On touch screens, which cannot hover, tile actions are always shown.
- A generating tile announces "Generating" through a status role; the feed sets `aria-busy` while loading.
- Model and settings in the list rail are a description list, so they are read as labelled values.

### Design tokens
`--field` · `--skeleton` · `--glass` · `--glass-border` · `--chip` · `--chip-foreground` · `--separator` · `--muted-foreground` · `--foreground` · `--ring`

