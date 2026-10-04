export const usage = {
  name: 'project-card',
  kind: 'block',
  summary: 'One project in a library grid: a 16:9 thumbnail, the project name and when it was last edited, with a "more" menu to rename, duplicate or delete it. Delete asks for confirmation first.',
  useWhen: [
    'A home or library screen lists someone\'s projects as a grid they open, tidy up and copy from.',
    'Each project needs the same three housekeeping actions without crowding the grid with buttons.',
  ],
  alternatives: [
    { name: 'card', when: 'the item is a single generation or a panel with its own content and footer actions, not a project in a grid' },
    { name: 'table', when: 'people sort or compare many projects by owner, size or date' },
  ],
  rules: [
    {
      id: 'actions-in-the-menu',
      do: 'Keep Rename, Duplicate and Delete in the "more" menu, so the grid reads as pictures and names.',
      dont: 'Line up Rename, Duplicate and Delete buttons on every card; a grid of twelve projects becomes thirty-six buttons.',
      visual: true,
    },
    {
      id: 'confirm-only-delete',
      do: 'Let Rename and Duplicate act at once, and confirm only Delete, naming the project in the question.',
      dont: 'Ask "Are you sure?" before a duplicate, or delete without asking.',
      visual: false,
    },
    {
      id: 'write-when-for-people',
      do: 'Pass `lastEdited` as people say it ("2 hours ago", "Sep 30") and the exact ISO time in `lastEditedDateTime`.',
      dont: 'Show a raw timestamp such as 2026-09-30T14:02:11Z in the card.',
      visual: false,
    },
    {
      id: 'thumbnail-or-empty-slot',
      do: 'Use a real still from the project, or leave `thumbnail` out so the card shows its empty image slot.',
      dont: 'Fill the slot with a stock picture or a logo that is not from the project.',
      visual: false,
    },
  ],
  a11y: [
    'The project name is an `h3`, so screen-reader users can jump from card to card. When `href` is set, the name is the link and its hit area stretches over the whole card.',
    'The "more" trigger is icon-only and is labelled "More actions for <name>".',
    'Rename opens a dialog with a visible "Project name" label; an empty name shows an error tied to the field with `aria-describedby`.',
    'Delete opens an alert dialog. Focus starts inside it, and Escape or "Keep project" leaves the project untouched.',
    'The thumbnail\'s `alt` defaults to empty because the name below already identifies it; pass `alt` when the still shows something the name does not.',
  ],
  tokens: ['--card-foreground', '--muted-foreground', '--field', '--popover', '--destructive', '--dialog', '--overlay', '--ring'],
}
