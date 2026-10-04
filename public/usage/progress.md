# progress (component)

A thin lime bar on a faint track that shows how much of something is used or done, such as credits left this month.

### When to use
- A known amount is partly used, such as 230 of 600 credits.
- A task reports how far along it is, such as an upload.

### Reach for instead
- **skeleton** — when content is loading and there is no amount to show

### Rules
- **Do:** Show the numbers beside the bar, such as "230 of 600 credits". **Don't:** Show a bar with no figures and make people estimate.

### Accessibility
- Has the progressbar role with its value; give it a label (`ProgressLabel` or `aria-label`).

### Design tokens
`--glass` · `--brand`

