# settings-nav (block)

The left navigation of a settings page: a small workspace label, then one row per page led by a colored icon tile, with the current page tinted, and an optional footer such as Sign out.

### When to use
- An account or workspace has several settings pages, such as Profile, Plan, Usage and Security, and people move between them often.
- Each page should be recognisable at a glance by a stable color and icon.

### Reach for instead
- **tabs** — when there are only two or three short views of one subject on a single page
- **dropdown-menu** — when the list of pages is a menu from an account button, not a persistent sidebar

### Rules
- **Do:** Give each page its own tile color and keep it the same wherever that page appears. **Don't:** Color every tile the same, or swap colors between pages, so color stops meaning anything.
- **Do:** Show the current page with the soft glass tint behind its row. **Don't:** Fill the current row with lime; a lime block reads as a call to action.

### Accessibility
- It is a `nav` landmark named by its label. The current row carries `aria-current="page"`.
- Rows are links when given an `href`, otherwise buttons; both show the lime focus ring.
- Icon tiles are decorative; the row text names the page.

### Design tokens
`--glass` · `--muted-foreground` · `--tile-blue` · `--tile-purple` · `--tile-pink` · `--tile-orange` · `--tile-mint` · `--tile-brown` · `--ring`

