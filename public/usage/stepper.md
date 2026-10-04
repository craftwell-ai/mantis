# stepper (component)

The composer's "− 1/4 +" control for small whole-number settings, such as how many images to generate at once.

### When to use
- A small count with a known maximum is adjusted one step at a time, such as batch size 1 to 4.

### Reach for instead
- **slider** — when the range is wide and approximate
- **toggle-group** — when only two or three values make sense

### Rules
- **Do:** Show the maximum next to the value, such as 1/4, so people know the limit before they hit it. **Don't:** Show a bare number and silently stop increasing.

### Accessibility
- Both buttons are named ("Increase batch size"); they disable at the limits.
- The value is announced politely as it changes.

### Design tokens
`--chip` · `--chip-border` · `--chip-foreground`

