# slider (component)

Adjusts a value along a range by dragging a small white thumb, such as the zoom level of a generation grid.

### When to use
- The exact number matters less than the feel, such as zooming a grid or setting motion strength.

### Reach for instead
- **toggle-group** — when only a few fixed values make sense, such as 1x, 2x and 4x
- **input** — when people need to type an exact number, such as a seed

### Rules
- **Do:** Put icons or labels at the ends that say what low and high mean, such as small and large tiles. **Don't:** Show a bare slider with no hint of what moving it does.
- **Do:** Update the result while the thumb moves. **Don't:** Wait for release before showing anything, so people guess.

### Accessibility
- Arrow keys change the value; Home and End jump to the ends.
- Give it an `aria-label` such as "Grid zoom"; the value is announced as it changes.

### Design tokens
`--separator` · `--primary` · `--ring`

