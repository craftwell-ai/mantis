# project-card (block)

One project in a library grid: a 16:9 thumbnail, the project name and when it was last edited, with a "more" menu to rename, duplicate or delete it. Delete asks for confirmation first.

### When to use
- A home or library screen lists someone's projects as a grid they open, tidy up and copy from.
- Each project needs the same three housekeeping actions without crowding the grid with buttons.

### Reach for instead
- **card** — when the item is a single generation or a panel with its own content and footer actions, not a project in a grid
- **table** — when people sort or compare many projects by owner, size or date

### Rules
- **Do:** Keep Rename, Duplicate and Delete in the "more" menu, so the grid reads as pictures and names. **Don't:** Line up Rename, Duplicate and Delete buttons on every card; a grid of twelve projects becomes thirty-six buttons.
- **Do:** Let Rename and Duplicate act at once, and confirm only Delete, naming the project in the question. **Don't:** Ask "Are you sure?" before a duplicate, or delete without asking.
- **Do:** Pass `lastEdited` as people say it ("2 hours ago", "Sep 30") and the exact ISO time in `lastEditedDateTime`. **Don't:** Show a raw timestamp such as 2026-09-30T14:02:11Z in the card.
- **Do:** Use a real still from the project, or leave `thumbnail` out so the card shows its empty image slot. **Don't:** Fill the slot with a stock picture or a logo that is not from the project.

### Accessibility
- The project name is an `h3`, so screen-reader users can jump from card to card. When `href` is set, the name is the link and its hit area stretches over the whole card.
- The "more" trigger is icon-only and is labelled "More actions for &lt;name>".
- Rename opens a dialog with a visible "Project name" label; an empty name shows an error tied to the field with `aria-describedby`.
- Delete opens an alert dialog. Focus starts inside it, and Escape or "Keep project" leaves the project untouched.
- The thumbnail's `alt` defaults to empty because the name below already identifies it; pass `alt` when the still shows something the name does not.

### Design tokens
`--card-foreground` · `--muted-foreground` · `--field` · `--popover` · `--destructive` · `--dialog` · `--overlay` · `--ring`

