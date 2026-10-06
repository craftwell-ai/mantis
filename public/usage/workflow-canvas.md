# workflow-canvas (block)

A node-and-wire editor for chaining generation steps: step cards people drag around a dotted board, wires drawn by dragging from one card to another, pan and zoom, an Add step menu, a Tidy up button that lines the steps up left to right, and one lime Run button with the live credit cost.

### When to use
- People build a pipeline out of steps, such as prompt and reference into a model, then upscale, and need to see and change how the steps connect.
- A generation needs more than one stage, and the order or the branching is the person's choice.

### Reach for instead
- **prompt-composer** — when one prompt goes to one model; a single composer is faster than a board
- **studio-settings-panel** — when the stages are fixed and only their settings change
- **canvas-shell** — when people arrange pictures, notes and shapes freely and nothing connects to anything
- **how-it-works** — when you are explaining three fixed steps on a marketing page, not letting anyone edit them

### Rules
- **Do:** Lay a workflow out left to right: what feeds a step sits on its left, what it produces on its right. **Don't:** Place steps so wires run backwards or cross; the board should read in the order it runs.
- **Do:** Keep Run as the only lime button, and let it carry the total credit cost of the steps on the board. **Don't:** Add a lime button to each step card, or hide the cost until after the run.
- **Do:** Name step types by what they do (Prompt, Model, Upscale) and give each a stable icon-tile color. **Don't:** Use internal names or give two step types the same color; the color is how people find a step at a glance.
- **Do:** Save the workflow from `onChange`, which fires after every move, addition, removal and new wire. **Don't:** Rely on Run to save; people expect a board to remember where they left things.

### Accessibility
- The board has an accessible name (`label`, "Workflow" by default). Step cards can be reached with Tab and moved with the arrow keys; Backspace removes the selected step or wire.
- Every toolbar control has a name: Add step, Tidy up, "Remove the selected steps and wires", Run, Zoom in, Zoom out and "Fit the workflow to the screen".
- Run reads its cost aloud ("Run 12 credits"). When the balance is too low it is disabled and described by a status message that says how many credits are needed.
- Selection is shown by a lime border on the card and lime wires, and the selected step is also the one the Remove button acts on, so color is not the only signal.
- Wiring by dragging needs a pointer. Offer another way to connect steps (such as a "Connect to" menu) where keyboard-only editing is required.

### Design tokens
`--card` · `--divider` · `--brand` · `--muted-foreground` · `--chip` · `--chip-foreground` · `--glass-panel` · `--glass-border` · `--background` · `--destructive`

