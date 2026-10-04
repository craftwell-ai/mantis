# separator (component)

A 1px white 8% line that divides groups inside one surface, such as sections of a menu or a settings card.

### When to use
- Two groups inside one card or menu need a quiet break, such as account actions above Sign out.

### Reach for instead
- **card** — when the groups are separate subjects that deserve their own surfaces

### Rules
- **Do:** Separate groups with spacing first, and add a line only where spacing alone is ambiguous. **Don't:** Put a line between every row of a list; the lines compete with the content.

### Accessibility
- Decorative by default; pass `decorative={false}` only when the break is meaningful to screen readers.

### Design tokens
`--divider`

