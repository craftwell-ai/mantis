# icon-tile (component)

A small colored rounded square behind an icon that gives each nav, menu or settings entry a recognizable color, from the reference's palette pairs.

### When to use
- Entries in a sidebar, settings nav or menu benefit from a quick color cue, such as Profile, Subscription and Usage.

### Reach for instead
- **icon** — when a plain icon is enough and color would add noise
- **avatar** — when the item is a person

### Rules
- **Do:** Always pair a tile with a visible text label; the tile is decoration. **Don't:** Use a tile on its own as a button or as the only way to tell items apart.
- **Do:** Give each destination one color and keep it everywhere it appears. **Don't:** Color tiles randomly or change an item's color between screens.

### Accessibility
- Tiles are hidden from screen readers; the label beside them carries the meaning.
- Some palette pairs (brown) have low icon contrast, which is acceptable only because tiles are decorative.

### Design tokens
`--tile-blue` · `--tile-purple` · `--tile-pink` · `--tile-orange` · `--tile-mint` · `--tile-brown`

