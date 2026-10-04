# kbd (component)

Shows a keyboard key or shortcut, such as ⌘K beside the search pill or Esc in a dialog footer.

### When to use
- A control has a keyboard shortcut worth teaching, such as ⌘K to open search.
- A hint tells people which key closes or confirms something.

### Reach for instead
- **badge** — when the label is a status or tag, not a key

### Rules
- **Do:** Put each key in its own Kbd inside a KbdGroup, such as ⌘ and K. **Don't:** Write a whole sentence of shortcuts inside one key.

### Accessibility
- Uses the semantic &lt;kbd> element; screen readers read the key names in place.
- Shortcut hints are decorative to pointer users, so never make one the only way to find a feature.

### Design tokens
`--kbd` · `--kbd-foreground`

