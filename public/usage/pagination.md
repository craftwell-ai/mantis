# pagination (component)

The compact pager under a table: an optional rows-per-page picker, "Page X of Y" and previous and next buttons.

### When to use
- A table or list has more rows than fit comfortably, such as a credit history or a render queue, and people step through it a page at a time.

### Reach for instead
- **A Load more button** — when people browse a feed of pictures rather than look up rows, as in the media grid
- **tabs** — when the pages are named views, not slices of one list

### Rules
- **Do:** Show the current page and the total, "Page 2 of 7", between the previous and next buttons. **Don't:** Show bare arrows with no page count, so people cannot tell how far the list goes.
- **Do:** Go back to page 1 when the rows per page or a filter changes. **Don't:** Keep the old page number, which can point past the end of the shorter list.
- **Do:** Place the pager directly under the rows it pages, aligned to the table's width. **Don't:** Float it far from the table or repeat it above and below a short list.

### Accessibility
- Renders a `nav` landmark; name it for what it pages with `aria-label`, such as "Usage history pages".
- The previous and next buttons are named and disable at the first and last page.
- The page line is a polite live region, so screen readers announce the new page after each step.
- The rows picker is labelled by its visible "Rows" text.

### Design tokens
`--muted-foreground` · `--chip` · `--chip-border`

