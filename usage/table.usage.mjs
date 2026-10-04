export const usage = {
  name: 'table',
  kind: 'component',
  summary: 'Lays records out in rows and columns so people can scan, compare and act on many items that share the same fields.',
  useWhen: [
    'People compare several records on the same fields, such as recent generations, render jobs or credit usage by project.',
    'Values need to line up in columns, such as credits spent, so differences show at a glance.',
  ],
  alternatives: [
    { name: 'card', when: 'each item is mostly a preview image and a few words, as in the asset library grid' },
    { name: 'A plain list', when: 'each item has only one or two fields' },
  ],
  rules: [
    {
      id: 'align-numbers-right',
      do: 'Right-align numeric columns, such as credits, their headers and their totals, and use tabular figures so the digits line up.',
      dont: 'Left-align numbers. The place values drift and larger amounts stop standing out.',
      visual: true,
    },
    {
      id: 'status-in-words',
      do: 'Show a render status as a word, such as "Rendering" or "Failed", with an icon beside it when that helps.',
      dont: 'Show a status as a colored dot alone. People who cannot tell the colors apart get nothing from it.',
      visual: true,
    },
    {
      id: 'name-the-table',
      do: 'Name the table with a `TableCaption` or a heading directly above it.',
      dont: 'Leave a table unnamed on a page that has more than one, such as a queue and a history.',
      visual: false,
    },
  ],
  a11y: [
    'Renders native table elements, so screen readers announce the row and column headers as people move between cells.',
    'Use `TableHead` for header cells, and give an empty-looking header, such as an actions column, visually hidden text.',
    'The container scrolls sideways when the table is wider than the screen; keep a focusable element, such as a link or a button, in the rows so keyboard users can reach and scroll it.',
  ],
  tokens: ['--foreground', '--muted', '--muted-foreground', '--border'],
}
