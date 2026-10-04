# prompt-composer (block)

The image generator's composer: a prompt box, a model chip, an aspect-ratio chip, a 1 to 4 image stepper and the lime Generate button showing what the request will cost in credits.

### When to use
- Someone writes a prompt and starts an image generation, such as at the bottom of an image studio or under a studio home hero.
- The cost depends on the model and the number of images, and people should see it before they spend credits.

### Reach for instead
- **textarea** — when you only need the borderless prompt field inside a surface you already built
- **select** — when a settings panel needs one more chip, such as quality, without the whole composer

### Rules
- **Do:** Keep the credit cost on the Generate button, so it updates the moment someone changes the model or the number of images. **Don't:** Hide the cost in a tooltip or a separate line, where people find out what they spent only after pressing Generate.
- **Do:** Leave the model, aspect-ratio and image-count chips neutral; Generate is the only lime element in the composer. **Don't:** Paint a chip or a second button lime. Lime marks the one main action, Generate, and a second one dilutes it.
- **Do:** Place one composer per screen, docked where the results appear. **Don't:** Repeat the composer in several cards; people lose track of which settings they are about to spend credits on.
- **Do:** Pass `creditBalance` so a request the person cannot afford disables Generate and says how to fix it. **Don't:** Let Generate fail after the click with a generic error about credits.

### Accessibility
- The prompt has an accessible name ("Prompt"); the placeholder is only an example of what to write.
- Each chip is named for its setting ("Model", "Aspect ratio") because it shows only the chosen value.
- Generate is named with its cost, such as "Generate 4 credits", so screen-reader users hear the price too.
- When credits run short, the explanation is linked to the disabled button with `aria-describedby`.
- Cmd+Enter or Ctrl+Enter in the prompt generates; plain Enter adds a new line.

### Design tokens
`--card` · `--card-foreground` · `--separator` · `--chip` · `--chip-border` · `--chip-foreground` · `--brand` · `--brand-foreground` · `--brand-gloss` · `--muted-foreground`

