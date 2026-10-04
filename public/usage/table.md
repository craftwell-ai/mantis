# table (component)

Lays records out in rows and columns so people can scan, compare and act on many items that share the same fields.

### When to use
- People compare several records on the same fields, such as recent generations, render jobs or credit usage by project.
- Values need to line up in columns, such as credits spent, so differences show at a glance.

### Reach for instead
- **card** — when each item is mostly a preview image and a few words, as in the asset library grid
- **A plain list** — when each item has only one or two fields

### Rules
- **Do:** Right-align numeric columns, such as credits, their headers and their totals, and use tabular figures so the digits line up. **Don't:** Left-align numbers. The place values drift and larger amounts stop standing out.
- **Do:** Show a render status as a word, such as "Rendering" or "Failed", with an icon beside it when that helps. **Don't:** Show a status as a colored dot alone. People who cannot tell the colors apart get nothing from it.
- **Do:** Name the table with a `TableCaption` or a heading directly above it. **Don't:** Leave a table unnamed on a page that has more than one, such as a queue and a history.

### Accessibility
- Renders native table elements, so screen readers announce the row and column headers as people move between cells.
- Use `TableHead` for header cells, and give an empty-looking header, such as an actions column, visually hidden text.
- The container scrolls sideways when the table is wider than the screen; keep a focusable element, such as a link or a button, in the rows so keyboard users can reach and scroll it.

### Design tokens
`--foreground` · `--muted` · `--muted-foreground` · `--border`

