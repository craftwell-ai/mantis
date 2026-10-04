# settings-section (block)

One stacked card of a settings page: a title and a short description, rows of label + one-line explanation + a control at the end, and an optional red danger zone that confirms before it acts.

### When to use
- A settings page groups related preferences, such as Privacy or Workspace, into one card among several stacked down the page.
- Each setting is one control, such as a switch, a select or a small button, beside a label that says what it changes.
- A section ends with an irreversible action, such as deleting the workspace, that needs to be visibly set apart.

### Reach for instead
- **notification-settings** — when the section is the email preferences form, saved together with one button
- **session-list** — when the section lists signed-in devices

### Rules
- **Do:** Give each row one control at its end, aligned with every other row's control. **Don't:** Stack two or three buttons in one row; split them into rows that each say what they change.
- **Do:** Put the danger zone last in the section, list what is lost, and confirm in an alert dialog. **Don't:** Mix a red delete button in among ordinary settings rows.
- **Do:** Write each description as what happens when the setting is on, such as "New generations appear in Explore as soon as they finish". **Don't:** Restate the label ("Turn on auto-publish") in the description.

### Accessibility
- The section is named by its `h2` title. Pass `control` as a function to wire the row's label and description ids to the control with `aria-labelledby` and `aria-describedby`.
- The danger zone is a named group with its own heading; its button opens an alert dialog with a safe Cancel first.
- Row icons are decorative.

### Design tokens
`--card` · `--glass` · `--muted-foreground` · `--divider` · `--destructive` · `--brand` · `--switch-off`

