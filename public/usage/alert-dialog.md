# alert-dialog (component)

A blocking confirmation for an action that cannot be undone, such as deleting a generation or cancelling a plan.

### When to use
- The next step destroys data or money and cannot be reversed, such as deleting a project.
- Someone must explicitly choose between two outcomes before continuing.

### Reach for instead
- **dialog** — when the window holds a task or form rather than a yes/no decision
- **sonner** — when the action is reversible; act immediately and offer Undo instead

### Rules
- **Do:** Title the dialog with the action and say exactly what will be lost, such as "Delete Glass Harbor? Its 12 variations go too." **Don't:** Ask "Are you sure?" without saying what happens.
- **Do:** Pair a destructive button labeled with the action ("Delete generation") with a clear way back ("Keep it"). **Don't:** Label the buttons OK and Cancel, or make the destructive button the white default.

### Accessibility
- Focus moves into the dialog and stays there until a choice is made; Escape counts as the safe choice.
- The title and description are announced when it opens.

### Design tokens
`--dialog` · `--overlay` · `--separator` · `--text-title-sm` · `--destructive`

