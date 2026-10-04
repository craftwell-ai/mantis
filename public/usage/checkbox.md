# checkbox (component)

Lets someone pick any number of independent options, such as which sessions to sign out or which formats to export.

### When to use
- Several options can be on at once, such as selecting generations to delete or formats to export.
- A single yes/no choice is part of a form that is submitted later, such as agreeing to terms.

### Reach for instead
- **switch** — when one setting takes effect immediately without a save step
- **radio-group** — when exactly one option can be chosen

### Rules
- **Do:** Put a clickable label beside every checkbox that says what checking it means. **Don't:** Show a bare checkbox with the meaning only in a heading above a list.
- **Do:** Use the default lime `brand` checkbox for selecting items, and `primary` (white) on light-on-dark lists where lime would compete with a lime action. **Don't:** Mix lime and white checkboxes in the same list.

### Accessibility
- Has the checkbox role, toggles with Space, and announces checked, unchecked or mixed.
- The unchecked border uses the control-border color, which meets the 3:1 non-text contrast minimum.
- The hit area extends beyond the 20px box, so it is easy to tap.

### Design tokens
`--input` · `--brand` · `--primary` · `--primary-foreground` · `--ring` · `--separator`

