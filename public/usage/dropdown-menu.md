# dropdown-menu (component)

A list of actions or options that opens from a button, keeping secondary choices tucked away until someone asks for them.

### When to use
- A tile, card or toolbar has more actions than fit as buttons, such as upscale, remix and delete on one generation.
- People switch a handful of independent options on and off, such as which columns show in the render queue.

### Reach for instead
- **button** — when there are only one or two actions; show them directly
- **A select** — when the choice is a value that fills in a field, such as an aspect ratio, rather than an action
- **tabs** — when the options switch between views that should stay visible

### Rules
- **Do:** Make the trigger name what the menu holds and show a down-arrow or a "more" icon, so people know a list will open. **Don't:** Use a plain button that looks like it acts at once but opens a menu instead.
- **Do:** Put destructive items, such as "Delete generation", last, after a separator, using the destructive item variant. **Don't:** Place "Delete" between everyday items like Upscale and Remix, where a slip of the pointer selects it.
- **Do:** Start each item with a verb and keep it to two or three words, like "Remix prompt". **Don't:** Write items as sentences, or repeat the menu's subject in every item.

### Accessibility
- The trigger announces that it opens a menu and whether it is open; arrow keys move through the items and Escape closes the menu.
- Focus returns to the trigger when the menu closes.
- An icon-only trigger needs an `aria-label`, such as "Actions for Glass Harbor".
- Checkbox items announce their checked state; use them only for options that switch on and off independently.
- Keep the default modal mode. Base UI then keeps focus inside the open menu cleanly; `modal={false}` adds Tab-reachable focus guards that axe reports as `aria-hidden-focus`.

### Design tokens
`--popover` · `--popover-foreground` · `--accent` · `--accent-foreground` · `--destructive` · `--muted-foreground` · `--border` · `--radius`

