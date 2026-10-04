# preset-gallery (block)

A browser of looks and camera moves: model tabs and a search field above a grid of media tiles, each an image with its uppercase title over it; the chosen preset gets a lime outline and a check.

### When to use
- People pick a ready-made style, effect or camera move for a generation, such as the Change action on a studio's preset card.
- Presets are easier to judge by a frame than by a name, so each needs a picture.

### Reach for instead
- **model-picker** — when people choose an engine by what it does, where a sentence beats a picture
- **radio-group** — when there are only two to four options and they need explaining, not previewing

### Rules
- **Do:** Set the short uppercase title on the image over the dark fade at the bottom, so the frame stays the biggest thing on the tile. **Don't:** Put the title and a description in a text block under a small thumbnail; the gallery turns into a list.
- **Do:** Mark the chosen preset with the lime outline and the check together. **Don't:** Show the choice by the outline alone, or by dimming every other tile.
- **Do:** When nothing matches, say what people can search for and offer to clear the search. **Don't:** Show an empty grid with no words.

### Accessibility
- Tiles are buttons named by the preset title, with `aria-pressed` on the chosen one.
- The model tabs are a real tab list ("Filter presets by model"); arrow keys move between them.
- While presets load, a status region says "Loading presets" and the skeleton tiles are hidden from screen readers.

### Design tokens
`--glass` · `--glass-border` · `--secondary` · `--field` · `--overlay` · `--brand` · `--brand-foreground` · `--badge-new` · `--skeleton` · `--ring`

