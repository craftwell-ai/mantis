# input (component)

A single-line text field for short typed answers: project names, seeds, collaborator emails, search terms.

### When to use
- The answer is short, typed and not from a fixed list, such as a preset name, a seed number or an email to invite.
- A search box filters the asset library or a list of generations.

### Reach for instead
- **A textarea** — when the answer can run past one line, such as a prompt or a negative prompt
- **A select or radio group** — when the answer must come from a short, known list, such as a model or an aspect ratio
- **form** — when several inputs are validated and submitted together

### Rules
- **Do:** Pair every input with a visible `Label` above it, and use the placeholder only for an example value. **Don't:** Use the placeholder as the label. It vanishes as soon as someone types, and the question goes with it.
- **Do:** Size each field to the answer it expects: narrow for a seed or a frame count, full width for a project title. **Don't:** Stretch every field to the same full width whatever goes in it; the width stops hinting at the answer.
- **Do:** Explain an error in words below the field and say how to fix it, such as "Enter a seed between 0 and 99999". **Don't:** Signal an error with a red border alone.

### Accessibility
- Connect the label with `htmlFor` and the input's `id`; clicking the label then focuses the field.
- Set `aria-invalid` when the value fails validation, and point `aria-describedby` at the error text so it is announced.
- Use the matching `type` (`email`, `number`, `search`) and `autoComplete`, so phones show the right keyboard and browsers can fill the field in.
- A disabled input is skipped by the keyboard; use `readOnly` when people still need to select or copy the value, such as a share link.

### Design tokens
`--input` · `--foreground` · `--muted-foreground` · `--primary` · `--primary-foreground` · `--ring` · `--destructive` · `--radius`

