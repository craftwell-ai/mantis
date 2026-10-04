# media-grid (block)

A masonry gallery of community work in mixed aspect ratios with 4px gutters. Hovering or focusing a picture reveals its author and Recreate and Like actions over a dark scrim; a Load more button (and optional load-on-scroll) adds pages, with skeleton tiles while they arrive.

### When to use
- An explore or community page shows many people's images and clips at their natural shapes.
- The list is long and paged, and should keep loading as someone scrolls.

### Reach for instead
- **generation-feed** — when the work is the viewer's own history, with prompts, a zoom slider and a list view
- **card** — when there are only a few items and each needs a title and description under it

### Rules
- **Do:** Pass each item's real `width` and `height` so portraits, squares and landscapes keep their shape in the masonry. **Don't:** Crop everything to squares, which cuts heads and horizons out of community work.
- **Do:** Leave the author and actions in the hover layer, so the gallery reads as pictures first. **Don't:** Print the author, like count and buttons under every picture.
- **Do:** Keep the Load more button even with `autoLoad`, so keyboard users and people with scroll loading blocked can reach the next page. **Don't:** Rely on scroll position alone to load more.

### Accessibility
- The grid is a labelled region (`label` prop); each picture opens through a button named "Open &lt;alt>, by &lt;author>".
- The hover layer appears on focus as well as hover, and is always shown on touch screens.
- Like is a toggle button (`aria-pressed`) named "Like &lt;alt>, &lt;count>".
- While a page loads, the region is `aria-busy` and the button's spinner announces "Loading more creations".

### Design tokens
`--field` · `--skeleton` · `--overlay` · `--glass` · `--brand-text` · `--glass-border` · `--muted-foreground` · `--foreground` · `--ring`

