export const usage = {
  name: 'sheet',
  kind: 'component',
  summary: 'A panel that slides in from an edge to show details or settings next to the page, such as a generation inspector or project settings.',
  useWhen: [
    'Details of a selected item should appear without leaving the grid, such as a generation\'s prompt and settings.',
    'A set of settings is too long for a popover but does not need a full page.',
  ],
  alternatives: [
    { name: 'dialog', when: 'the task is short and must be finished before continuing' },
    { name: 'popover', when: 'only one or two controls are needed' },
  ],
  rules: [
    {
      id: 'right-for-details',
      do: 'Open detail and settings sheets from the right, where the reference keeps its inspector.',
      dont: 'Open a detail sheet from the left, where navigation lives.',
      visual: false,
    },
    {
      id: 'title-what-it-shows',
      do: 'Title the sheet with the item or area it shows, such as "Glass Harbor" or "Project settings".',
      dont: 'Leave the sheet untitled so people lose track of what they opened.',
      visual: true,
    },
  ],
  a11y: [
    'Focus moves into the sheet and returns to the trigger on close; Escape closes it.',
    'The title is announced when the sheet opens.',
  ],
  tokens: ['--dialog', '--overlay', '--separator', '--shadow-popover', '--text-title-sm'],
}
