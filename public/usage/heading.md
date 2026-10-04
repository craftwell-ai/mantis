# heading (component)

Page and section headings: the signature uppercase grotesk display levels (hero, section, sub, label) and plain Inter titles for dialogs and panels.

### When to use
- A page or studio opens with a statement (`hero`), optionally with one word in lime (`HeadingAccent`).
- A page section needs a title (`section`) or a sub-section (`sub`).
- A dialog, sheet or settings card needs a title (`title`, `title-sm`).

### Reach for instead
- **badge** — when the text is a short label on an item, not a heading

### Rules
- **Do:** Set at most one word or short phrase of a display heading in lime with HeadingAccent. **Don't:** Color a whole heading lime, or several scattered words; the accent stops pointing at anything.
- **Do:** Use display levels for page and section headings, and the Inter titles inside dialogs, sheets and cards. **Don't:** Put an uppercase display heading inside a small dialog; it shouts in a space meant for a quiet title.
- **Do:** Keep the heading order on the page (h1, then h2, then h3); use `render` to change the tag when the visual level differs. **Don't:** Skip levels to get a size you like.

### Accessibility
- Each level renders a real heading element (hero is h1, section h2, sub h3); override with `render` to keep the outline correct.
- Uppercase is applied with CSS, so screen readers read the words normally.

### Design tokens
`--text-display-xl` · `--text-display-lg` · `--text-display-md` · `--text-display-sm` · `--text-label-caps` · `--text-title-md` · `--text-title-sm` · `--font-grotesk` · `--brand-text`

