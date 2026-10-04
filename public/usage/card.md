# card (component)

Holds the content and actions for one subject, such as a generation, a project or a credit balance, on a single bordered surface.

### When to use
- Several items of the same kind sit side by side in a grid, such as projects or saved presets, and each needs its own title and actions.
- A home screen needs a self-contained panel, such as a credit balance or a feed of recent renders.
- One subject needs a header, a body and a footer with actions, kept together.

### Reach for instead
- **table** — when people compare many generations or render jobs on the same fields, row by row
- **dialog** — when the content interrupts the current task and needs an answer before the user continues

### Rules
- **Do:** Separate the parts inside a card with spacing or a divider, and keep one card per subject. **Don't:** Put a card inside another card. The stacked borders and padding blur which surface an action belongs to.
- **Do:** Put the card's actions in the footer, below the preview and details they act on, with at most one filled button. **Don't:** Crowd buttons into the header, where they fight the title for attention.
- **Do:** Give a generated image `alt` text that describes what it shows, or an empty `alt` when the title already says everything. **Don't:** Leave `alt` off, fill it with the file name, or paste the whole prompt into it.

### Accessibility
- `CardTitle` renders a `<div>`. When cards are the main content of a page, such as a grid of projects, put the title text in a heading element so screen-reader users can jump from card to card.
- When the whole card should open something, make the title the link and keep any other buttons as separate controls. Never put a button inside a link.
- Keep the source order the same as the visual order: title, description, content, actions.

### Design tokens
`--card` · `--card-foreground` · `--muted-foreground` · `--border` · `--radius`

