# switch (component)

Turns one setting on or off immediately, such as sound on a clip or making a project public.

### When to use
- A single option takes effect the moment it changes, with no save step, such as enhance prompt or audio.
- Billing switches between two periods (`size="lg"`, between two labels).

### Reach for instead
- **checkbox** — when the choice is part of a form that is submitted later
- **toggle-group** — when there are more than two options, such as aspect ratios

### Rules
- **Do:** Put a visible label next to the switch that names the setting, such as "Sound". **Don't:** Show a switch with no label, or a label that says what happens when it is off.
- **Do:** Apply the change as soon as the switch flips. **Don't:** Use a switch inside a form that only applies on Save; use a checkbox there.

### Accessibility
- Has the switch role and announces on or off; Space toggles it.
- Link it to its label with a &lt;label> or `aria-labelledby`.

### Design tokens
`--brand` · `--switch-off` · `--primary` · `--shadow-thumb-on` · `--shadow-thumb-off`

