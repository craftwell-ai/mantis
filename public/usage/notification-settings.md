# notification-settings (block)

The Notifications section of account settings: checkboxes for which emails to receive, a digest frequency (never, daily, weekly) and a Save button that confirms in place.

### When to use
- An account settings page needs a section where people choose which emails they get, such as a finished generation or a new comment.
- People pick how often a roundup email arrives, and the choice is saved together with the other email preferences.

### Reach for instead
- **switch** — when a single preference applies the moment it flips, with no Save step, such as muting sound in the studio
- **card** — when the section holds a different kind of setting, such as profile details; compose a card with fields instead

### Rules
- **Do:** Use checkboxes and one white Save button when nothing changes until people save, as this section does. **Don't:** Put switches above a Save button. A switch promises the change already happened, so people leave without saving.
- **Do:** Name each email by the event that sends it, such as "A generation finishes", with one line on what it contains or how often it comes. **Don't:** Use vague labels such as "Updates" or "Activity" that leave people guessing what they are signing up for.
- **Do:** Pass an `onSave` that returns a promise, so the button shows Saving and the footer says whether it worked. **Don't:** Rely on a toast alone to confirm the save; it disappears before some people read it.

### Accessibility
- The section is a form named by its "Notifications" heading (an `h2`); pass a different heading level only by wrapping the block, not by restyling text.
- Each checkbox is labelled by its topic name and described by its explanation line; the digest radios are named by the "Activity digest" legend.
- The save result is announced through a status region, and a failed save through an alert. The button stays focusable while it shows Saving.

### Design tokens
`--card` · `--card-foreground` · `--muted-foreground` · `--brand` · `--input` · `--primary` · `--primary-foreground` · `--destructive` · `--separator` · `--ring`

