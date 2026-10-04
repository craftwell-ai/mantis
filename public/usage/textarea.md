# textarea (component)

A multi-line text field: a filled `field` for forms, and borderless `prompt` and `prompt-lg` for writing generation prompts.

### When to use
- Someone writes a prompt in a composer (`prompt` in studio composers, `prompt-lg` in the large hero composer).
- A form needs more than one line, such as a profile bio (`field`).

### Reach for instead
- **input** — when the answer fits on one line, such as a project name

### Rules
- **Do:** Use the borderless prompt variants only inside a composer surface that provides the frame. **Don't:** Drop a borderless prompt textarea straight onto the page, where nothing shows the field exists.
- **Do:** Use the placeholder for an example of what to write, such as "Describe the scene you imagine". **Don't:** Put the field's only label in the placeholder; it disappears as soon as someone types.

### Accessibility
- Give every textarea a label, visible or via `aria-label` in a composer.
- Like the reference, fields have no resting border (owner decision); the visible label and the lime focus ring carry the boundary.
- All variants grow with their content, so long prompts stay readable without inner scrolling.

### Design tokens
`--field` · `--glass-foreground` · `--muted-foreground` · `--ring` · `--radius-control`

