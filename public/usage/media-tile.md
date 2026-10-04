# media-tile (component)

An image or video filling a rounded frame, for pickers, galleries, feeds and libraries.

### When to use
- A grid or strip shows pictures or clips that people open, pick or act on, such as presets, uploads, past generations or library assets.
- A card needs its preview picture, such as a project cover or a feature example.

### Reach for instead
- **card** — when the subject is mostly text with a small picture, or needs a footer of actions
- **avatar** — when the picture is a person
- **skeleton** — when the media is still loading: hold the tile's shape with a skeleton of the same aspect

### Rules
- **Do:** Let the picture fill the frame and put the name on it (`title`) or under the tile. **Don't:** Shrink the picture to a thumbnail beside a block of text, or crop away the subject with a mismatched aspect.
- **Do:** Mark the picked tile with `selected`: the lime ring, plus the check or a pick-order number. **Don't:** Show selection with a white border, a darker tile or color alone without the ring.
- **Do:** Use at most one badge in the top-left, such as New, with a dark backing on bright frames. **Don't:** Stack several badges and labels over the picture until the media disappears.
- **Do:** Put per-tile actions such as Download in `actions`, shown on hover and focus and always on touch screens. **Don't:** Nest buttons inside a tile that is itself a button or link; pass them as `actions` so the tile renders them beside its own control.

### Accessibility
- Give `alt` describing what the picture shows. Leave it empty only when a name right beside the tile already says it.
- A tile with `onClick` is a button and with `href` a real link; its name comes from its content or `label`. As a button, `selected` sets `aria-pressed`.
- When a tile also holds actions, a full-size button or link sits under them, named by `label` (or `alt`), so no control is nested in another.
- Hover actions are revealed on keyboard focus too, and always shown on touch screens.

### Design tokens
`--field` · `--overlay` · `--brand` · `--brand-foreground` · `--ring` · `--foreground`

