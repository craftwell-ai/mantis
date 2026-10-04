# button (component)

Runs an action in place: saving a project, inviting a collaborator, confirming a delete, or opening a dialog.

### When to use
- The user is about to change something, such as saving a preset, publishing a generation to the community or deleting an asset.
- A form, such as the project settings or an invite, needs its submit control.
- A toolbar over the canvas or the asset library needs a compact action; use an icon-size button with an accessible name.

### Reach for instead
- **A link (`<a href>`)** — when the control opens another page, such as a project or a community post, instead of acting where the user is
- **dropdown-menu** — when three or more related actions on one generation compete for the same spot
- **tabs** — when the choice swaps between views of the same project, such as its images and its videos

### Rules
- **Do:** Use the `brand` (lime) variant for the one main call to action on a screen: Generate (with its credit cost), Sign up, Get plan, the main marketing call to action, or the main step of a focused flow such as Upload media or Download. **Don't:** Paint everyday confirm and save actions such as Save, Continue or Invite lime. Those stay white, so the lime action is always the one thing the screen is for.
- **Do:** Give each view, card or dialog one filled button: lime `brand` when it is the main call to action (generate, sign up, buy), white `default` when it is an everyday confirm such as Save or Continue. Use outline, secondary, glass or ghost for the rest. **Don't:** Line up several filled buttons side by side, or put two lime actions in one view. When every action shouts, the one that matters no longer stands out.
- **Do:** Label the button with the action it performs, like "Publish to community" or "Keep editing". **Don't:** Use labels such as "OK", "Yes" or "Go" that only make sense after reading the text around them.
- **Do:** Keep the destructive variant for deletes that cannot be undone, such as "Delete generation", and confirm them in a dialog first. **Don't:** Use the destructive variant to make an ordinary action stand out, or for "Cancel" or "Stop render".
- **Do:** Give an icon-only button an `aria-label` that names the action, such as "Close preview". **Don't:** Ship an icon-only button with no accessible name; a screen reader announces it as just "button".

### Accessibility
- Renders a native `<button>`, so it is focusable and responds to Enter and Space with no extra work.
- Inside a form, set `type="button"` on every button that should not submit it.
- Icon-only buttons need an `aria-label`; the icon itself stays decorative.
- A disabled button cannot receive focus, so say near it why the action is unavailable, such as "Not enough credits".

### Design tokens
`--brand` · `--brand-foreground` · `--brand-tint` · `--brand-gloss` · `--glass` · `--soft` · `--commerce-pink` · `--commerce-blue` · `--shadow-cta-brand` · `--shadow-gloss-edge` · `--primary` · `--primary-foreground` · `--secondary` · `--secondary-foreground` · `--accent` · `--accent-foreground` · `--destructive` · `--background` · `--border` · `--input` · `--ring` · `--radius`

