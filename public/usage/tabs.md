# tabs (component)

Switches between a few related views of one subject without leaving the page, such as a project's overview, activity and settings.

### When to use
- One subject has two to six views of equal weight, such as a project's images, videos and characters, and people move between them freely.
- The views are long enough that showing them all at once would bury the one people want.

### Reach for instead
- **A multi-step flow** — when the views are steps that must be done in order, such as prompt, then model, then generate
- **dropdown-menu** — when the choice runs an action, such as upscale or delete, rather than showing a view
- **A radio group** — when the choice changes a setting, such as the aspect ratio, or filters a list rather than swapping the content

### Rules
- **Do:** Use tabs for views people can visit in any order, each with a short noun for a label. **Don't:** Use tabs as numbered steps. People expect to jump between tabs freely, and a skipped step breaks the flow.
- **Do:** Label each tab with one or two words that name its view, like "Activity" or "Presets". **Don't:** Write long or uneven labels that wrap, or push the last tabs out of view.
- **Do:** Keep the selected tab when people come back to a project, for example by storing it in the URL. **Don't:** Reset to the first tab every time the page reloads.

### Accessibility
- Arrow keys move between tabs and show each tab's panel as it is reached; the Tab key then moves focus into the panel.
- Each tab announces its position, such as "2 of 3", and whether it is selected.
- Do not hide content people need in a tab they are unlikely to open.

### Design tokens
`--muted` · `--muted-foreground` · `--foreground` · `--background` · `--input` · `--ring` · `--radius`

