# popover (component)

A small floating panel anchored to a control, for a few related choices or a short form without leaving the page.

### When to use
- A setting chip opens its options right where it sits, such as duration or batch size.
- A short piece of extra detail needs room for a heading and a control.

### Reach for instead
- **dropdown-menu** — when the content is a list of actions or a single choice from a list
- **dialog** — when the task needs focus and blocks the page until it is answered
- **tooltip** — when it only names an icon and holds nothing interactive

### Rules
- **Do:** Keep a popover to one short task, such as picking a duration, with a few controls. **Don't:** Build a whole settings page inside a popover. Long content scrolls awkwardly and closes on any outside click.
- **Do:** Open the popover from the control it changes, so the link between them is obvious. **Don't:** Open a popover from one place to change something elsewhere on the page.

### Accessibility
- Focus moves into the popover when it opens and returns to the trigger when it closes.
- Escape and an outside click close it.

### Design tokens
`--background` · `--popover-foreground` · `--separator` · `--shadow-popover` · `--radius-2xl`

