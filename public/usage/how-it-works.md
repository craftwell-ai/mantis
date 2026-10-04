# how-it-works (block)

A three-step explainer strip for a tool or landing page: an uppercase headline, then a row of steps, each with a picture, a number, a short uppercase title and one sentence.

### When to use
- A tool page shows first-time visitors the path from input to result before they start.
- A landing page explains a workflow in three plain steps.

### Reach for instead
- **empty-state** — when the space is an empty library waiting for its first item, with one button to start
- **card** — when the items are features or products, not ordered steps

### Rules
- **Do:** Give each step a two- or three-word title and one sentence a person can act on. **Don't:** Write a paragraph per step, or titles that are full sentences.
- **Do:** Use a picture that shows that step happening: the upload, the chosen style, the result. **Don't:** Use the same decorative picture three times, or icons in place of media.
- **Do:** Keep it to three steps; merge or drop the rest. **Don't:** List six steps, which turns an explainer into a manual.

### Accessibility
- Steps are an ordered list, so screen readers announce "1 of 3"; the visible number is hidden from them to avoid saying it twice.
- The headline is an `h2` and each step title an `h3`.
- Each picture needs `alt` describing what the step shows.

### Design tokens
`--card` · `--glass` · `--foreground` · `--muted-foreground` · `--brand-text`

