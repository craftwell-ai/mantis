# sheet (component)

A panel that slides in from an edge to show details or settings next to the page, such as a generation inspector or project settings.

### When to use
- Details of a selected item should appear without leaving the grid, such as a generation's prompt and settings.
- A set of settings is too long for a popover but does not need a full page.

### Reach for instead
- **dialog** — when the task is short and must be finished before continuing
- **popover** — when only one or two controls are needed

### Rules
- **Do:** Open detail and settings sheets from the right, where the reference keeps its inspector. **Don't:** Open a detail sheet from the left, where navigation lives.
- **Do:** Title the sheet with the item or area it shows, such as "Glass Harbor" or "Project settings". **Don't:** Leave the sheet untitled so people lose track of what they opened.

### Accessibility
- Focus moves into the sheet and returns to the trigger on close; Escape closes it.
- The title is announced when the sheet opens.

### Design tokens
`--dialog` · `--overlay` · `--separator` · `--shadow-popover` · `--text-title-sm`

