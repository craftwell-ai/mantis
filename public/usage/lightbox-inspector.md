# lightbox-inspector (block)

A full-screen viewer for one generation: the picture centered on a blurred copy of itself with previous and next buttons, and an inspector card on the right holding the creator, the copyable prompt, a details list (model, size, seed, date), a lime Recreate button and a grid of Download, Share, Upscale and Delete.

### When to use
- Someone opens a result from a history feed or community grid and wants to see it large, read how it was made and act on it.
- People step through a set of results one by one with the arrow keys.

### Reach for instead
- **sheet** — when the details should sit beside the page without hiding it, such as editing one item in a list
- **dialog** — when the task is a short decision, not viewing media

### Rules
- **Do:** Make Recreate the only lime button, with its credit cost, above a grid of glass secondary actions. **Don't:** Color Download, Share or Upscale lime too, so nothing stands out.
- **Do:** Let Download, Share and Upscale act at once; Delete asks first and names what is lost. **Don't:** Delete straight from the grid, or confirm harmless actions.
- **Do:** Give `info` short label and value pairs, already formatted: Model, Size 1536 × 1024, Seed 48213, Created Sep 30. **Don't:** Pass raw JSON, internal ids or timestamps.

### Accessibility
- It is a modal dialog: focus moves inside, Escape and the Close button leave, and the page behind is inert.
- A visually hidden title names the image and its position ("Image 2 of 6 by …"); the description mentions the arrow keys.
- Left and Right arrow keys move between items; Previous and Next are disabled at the ends.
- Copy announces "Prompt copied" through a polite live region; if clipboard access is refused, the prompt stays selectable.
- The blurred backdrop is decorative (`alt=""`, `aria-hidden`).

### Design tokens
`--overlay` · `--card` · `--glass` · `--brand` · `--brand-foreground` · `--destructive` · `--muted-foreground` · `--foreground` · `--ring`

