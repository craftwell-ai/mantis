# asset-library-page (block)

An asset library page template: the top navigation, a page header with the Upload action, filter tabs (All, Images, Videos, Uploads) and a name search, a grid of asset tiles selected with a corner checkbox, and a floating selection bar to download or delete in bulk (delete is confirmed). Shows skeletons while loading, a no-match state with Clear search, and the empty state with its one upload button when the library is empty. Composes top-navigation and empty-state.

### When to use
- People need one place to find, filter and reuse everything they have generated or uploaded.
- People act on several files at once, such as downloading a set or clearing out old uploads.

### Reach for instead
- **generation-feed** — when the page shows only generations, newest first, with their prompts
- **add-media-panel** — when people pick a file to attach to a prompt rather than manage the library
- **media-grid** — when the grid shows other people's public work with authors and likes

### Rules
- **Do:** Mark a selected tile with the lime ring and a checked box, so selection is shown two ways. **Don't:** Show selection by dimming the tile, which reads as disabled.
- **Do:** Let the header carry Upload while there are assets, and the empty state carry it when there are none; the template swaps them for you. **Don't:** Add a second Upload button to the toolbar or the selection bar.
- **Do:** Pass `onDelete` and let the confirmation name how many assets go and where they are removed from. **Don't:** Delete straight from the selection bar without a confirmation.
- **Do:** Pass your own data for every prop before shipping. Left out, a prop falls back to the invented sample product, Lumen, from sample-content, which is only there so the template previews with nothing filled in. **Don't:** Ship the sample product, people and numbers to real users, such as Maya Okafor's account menu or a credit balance nobody has.

### Accessibility
- The page title is the h1; filters are a tab list labelled "Asset type", and each tab's grid is its tab panel.
- Each tile's checkbox is named "Select &lt;name>" and stays in the tab order; it becomes visible on focus, on hover, once anything is selected, and always on touch screens.
- The selection bar is a region labelled "Selection" whose count is announced politely as it changes; Clear selection is a named icon button.
- The search field is a labelled search box with a Clear search button once something is typed.

### Design tokens
`--background` · `--field` · `--popover` · `--glass-border` · `--overlay` · `--ring` · `--muted-foreground` · `--skeleton` · `--destructive`

