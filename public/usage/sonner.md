# sonner (component)

Brief toast notifications that confirm an action finished, or report a problem, without pulling the user away from the canvas.

### When to use
- An action finished where the result is not otherwise visible, such as "Published to community" after publishing from the asset library.
- A background job, such as a render or an upscale, succeeded or failed and the user should know, but does not have to respond.

### Reach for instead
- **dialog** — when the user must decide or confirm something, such as spending credits, before anything happens
- **Text next to the field** — when the message is about one specific field, such as an invalid seed

### Rules
- **Do:** Render `<Toaster />` once, in the app's root layout, and call `toast()` from anywhere. **Don't:** Mount a Toaster inside each page or component; extra copies show the same toast more than once.
- **Do:** Say what happened in a few words that name the thing, such as "Glass Harbor upscaled to 4K". **Don't:** Write "Success!" or "Done", which tells people nothing they can check.
- **Do:** Also show the result where the work lives, such as the finished tile in the asset library or the render queue. **Don't:** Put anything people must read twice or act on only in a toast. It disappears after a few seconds.
- **Do:** Offer an Undo action in the toast for actions that can be reversed, such as removing a generation from a project. **Don't:** Ask a confirmation question in a toast; use a dialog for decisions.

### Accessibility
- Toasts are announced through a polite live region, so screen readers read them without moving focus.
- A toast stays on screen while the pointer is over it, and Alt+T moves keyboard focus to the notification area.
- Keep the message short; a long toast can disappear before someone finishes reading it.

### Design tokens
`--popover` · `--popover-foreground` · `--border` · `--radius`

