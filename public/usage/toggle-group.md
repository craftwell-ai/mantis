# toggle-group (component)

A compact row of options where the chosen one is highlighted: a white segment (`segment`) or a lime-outlined tile (`outline`).

### When to use
- One short option out of a few must be picked inline, such as upscale factor or Visuals versus Sound (`segment`).
- Visual options such as aspect ratios are shown as tiles (`outline`).

### Reach for instead
- **tabs** — when the choice switches which panel of content is shown
- **radio-group** — when each option needs a sentence of explanation
- **select** — when there are more than five options

### Rules
- **Do:** Keep a toggle group to two to five short options, such as 1x, 2x and 4x. **Don't:** Squeeze long labels or many options into one row; they wrap and become hard to compare.
- **Do:** Use single selection when options exclude each other, such as one aspect ratio at a time. **Don't:** Allow several pressed segments for options that cannot combine.

### Accessibility
- Each item is a toggle button that announces whether it is pressed; arrow keys move between items.
- Label the group (`aria-label`) with what is being chosen.

### Design tokens
`--soft` · `--soft-foreground` · `--primary` · `--primary-foreground` · `--brand` · `--glass`

