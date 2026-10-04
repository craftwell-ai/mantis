# toggle (component)

A single pressable button that stays pressed until pressed again, styled like one segment of a toggle group.

### When to use
- One on/off formatting option sits in a toolbar, such as showing the grid overlay on a canvas.

### Reach for instead
- **toggle-group** — when several related options sit together
- **switch** — when the setting is labeled text in a list or form

### Rules
- **Do:** Give an icon-only toggle an `aria-label`, such as "Show grid". **Don't:** Ship an icon toggle that a screen reader announces only as "toggle button".

### Accessibility
- Announces pressed or not pressed; Space and Enter toggle it.

### Design tokens
`--primary` · `--primary-foreground` · `--soft-foreground` · `--glass`

