# agent-approval-card (block)

A human-in-the-loop card: before an AI agent spends credits or changes data it lists exactly what it will do and what it costs, then waits for Approve, Stop, or Approve with "Always allow" switched on.

### When to use
- An AI agent is about to run something that costs credits, such as a batch of generations, and the person must agree first.
- An agent wants to change or delete data, such as renaming files or emptying a folder, and the person should see each step before it happens.

### Reach for instead
- **alert-dialog** — when a person, not an agent, is about to do something that cannot be undone
- **prompt-composer** — when the person is writing the request themselves and the cost shows on the Generate button

### Rules
- **Do:** Use kind="spend" for steps that cost credits, so Approve is the lime button with the total; use kind="change" (white Approve) for edits that cost nothing, an everyday confirm. **Don't:** Make Approve lime for a data change, or white for a batch that spends credits; the color tells people whether credits are on the line.
- **Do:** List every step in full, with the exact prompt or change, its settings as chips and its credit cost. **Don't:** Summarize as "Run 3 tasks?"; people cannot approve what they cannot see.
- **Do:** Leave "Always allow" off by default and say on the approved card that the agent will not ask again. **Don't:** Pre-check "Always allow", or approve the moment it is pressed.
- **Do:** Make Stop and Esc end the request with nothing run, and say so: "Nothing ran and no credits were spent." **Don't:** Style Stop as destructive; stopping is the safe choice.

### Accessibility
- The card is a section named by its title; the steps are an ordered list, focusable when long enough to scroll.
- Approve announces its credit total ("Approve 8 credits"); when the balance is too low it stays focusable, disabled, and is described by the explanation.
- "Always allow" is a toggle button with a pressed state; Esc anywhere in the card stops the request.
- The approved or stopped outcome is announced through a status message.

### Design tokens
`--card` · `--brand` · `--brand-foreground` · `--brand-text` · `--primary` · `--chip` · `--chip-border` · `--chip-foreground` · `--separator` · `--kbd` · `--muted-foreground` · `--ring`

