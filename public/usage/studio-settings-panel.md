# studio-settings-panel (block)

The left rail of a video studio: the chosen preset on top, up to N reference images, the prompt, the model row, duration, aspect and quality chips, a bitrate slider and the lime Generate button with its credit cost pinned at the bottom.

### When to use
- A studio page sets up a video generation in a column beside the canvas or results, such as an image-to-video or effects studio.
- The request needs more settings than fit in a one-row composer: a preset, reference images and quality controls as well as the prompt.

### Reach for instead
- **prompt-composer** — when the screen generates images from a prompt and a few chips, docked under the results
- **model-picker** — when you only need the model choice inside a surface you already built

### Rules
- **Do:** Keep Generate as the last thing in the rail, full width, with the cost on it, so people read the settings top to bottom and then commit. **Don't:** Put Generate at the top of the rail or beside the preset, before the settings that change its cost.
- **Do:** Leave the duration, aspect and quality chips in the neutral chip style; only Generate is lime. **Don't:** Turn a chip lime to show it changed. Lime marks the one main action, Generate.
- **Do:** Show how many reference slots are used, such as 2/4, and hide the add tile once the rail is full. **Don't:** Let people pick a fifth image and reject it after they upload it.
- **Do:** Pass `creditBalance` so a clip people cannot afford disables Generate and says how to fix it. **Don't:** Let Generate fail after the click with a generic error about credits.

### Accessibility
- The rail is a form named "Video settings", and Generate is its only submit button.
- Each chip is named for its setting (Duration, Aspect ratio, Quality) because it shows only the chosen value.
- The bitrate slider is labelled by the visible word Bitrate and its value is shown as text beside it.
- Reference thumbnails keep their alt text, and each remove button names the image it removes.
- When credits run short, the explanation is linked to the disabled button with `aria-describedby`.

### Design tokens
`--card` · `--card-foreground` · `--field` · `--chip` · `--chip-border` · `--glass` · `--glass-border` · `--overlay` · `--brand` · `--brand-foreground` · `--brand-gloss` · `--muted-foreground`

