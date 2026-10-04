# field (component)

Wraps a form control with its label, hint and error message, laid out the way the reference's profile and settings forms are.

### When to use
- Any form input needs a visible label above it, such as Username or Bio.
- A control needs a hint below it or must show a validation error.

### Reach for instead
- **input** — when the control sits in a composer with its own frame and an `aria-label`

### Rules
- **Do:** Put a short label above every field, in the small grey label style. **Don't:** Use the placeholder as the only label.
- **Do:** Write errors that say how to fix the problem, such as "Use 3 to 20 letters or numbers". **Don't:** Write "Invalid input".

### Accessibility
- FieldLabel is linked to its control; FieldError is announced when it appears.
- Labels are #8b8c8d on the page, which meets 4.5:1.

### Design tokens
`--muted-foreground` · `--destructive` · `--field`

