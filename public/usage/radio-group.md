# radio-group (component)

Lets someone choose exactly one option from a short list, either as small radios or as whole selectable cards.

### When to use
- One choice out of two to six options must be made, such as a project being private or public.
- Each option needs a title and a line of explanation, as in onboarding steps (`RadioGroupCard`).

### Reach for instead
- **toggle-group** — when the options are short labels in a compact row, such as aspect ratios
- **select** — when there are more than six options, or space is tight
- **checkbox** — when more than one option can be chosen

### Rules
- **Do:** Use radio cards when each option needs a sentence of explanation, such as who can see a project. **Don't:** Use radio cards for one-word options; a row of small radios or a segmented control is easier to scan.
- **Do:** Start with the safest option selected, such as Private for a new project. **Don't:** Leave nothing selected when one answer is required.

### Accessibility
- Arrow keys move between options and select them; Tab moves in and out of the group.
- Each radio and card announces its label and whether it is selected.

### Design tokens
`--input` · `--brand` · `--primary-foreground` · `--glass` · `--ring`

