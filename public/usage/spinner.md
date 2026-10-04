# spinner (component)

A small spinning ring that shows something is working, such as a button while it upscales or a tile while it queues.

### When to use
- An action is in progress and its duration is unknown, such as "Upscaling" on a button.
- An item waits in a queue, beside a short status such as "In queue".

### Reach for instead
- **progress** — when the amount done is known
- **skeleton** — when a whole area is loading and its layout is known

### Rules
- **Do:** Pair the spinner with a word that says what is happening, such as "Upscaling". **Don't:** Show a lone spinner for a long task with no status.

### Accessibility
- Has the status role and announces its label (default "Loading"); pass a specific label.
- Stops spinning for people who prefer reduced motion.

### Design tokens
`--muted-foreground`

