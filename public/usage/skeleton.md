# skeleton (component)

A dark placeholder block with a slow shimmer that holds the shape of content while it loads, such as thumbnails in the asset picker.

### When to use
- A grid of generations or assets is loading and its layout is known in advance.
- A card's text and image arrive a moment after the card itself.

### Reach for instead
- **progress** — when the wait has a measurable amount, such as a render percentage

### Rules
- **Do:** Size skeletons like the content they stand in for, such as square tiles for a square thumbnail grid. **Don't:** Show one generic bar for a whole grid, then jump to a different layout when the content arrives.
- **Do:** Use skeletons for loads of a few seconds at most. **Don't:** Leave a skeleton up during a long render; show progress and a status instead.

### Accessibility
- Skeletons are hidden from screen readers (`aria-hidden`); mark the loading area as a labeled region (`role="region"`, `aria-label`) with `aria-busy="true"`.
- The shimmer stops for people who prefer reduced motion.

### Design tokens
`--skeleton` · `--skeleton-shimmer` · `--animate-shimmer` · `--radius-lg`

