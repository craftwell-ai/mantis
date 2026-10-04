export const usage = {
  name: 'dialog',
  kind: 'component',
  summary: 'A modal window that pauses the page for one short task or decision, such as deleting a generation or renaming a project.',
  useWhen: [
    'An action needs confirming before it runs, especially a delete that cannot be undone.',
    'A short task of one to three fields, such as naming a preset, belongs to the current screen and should not navigate away.',
  ],
  alternatives: [
    { name: 'A new page', when: 'the task is long, has several steps, or needs its own URL to share, such as a project\'s settings' },
    { name: 'sonner', when: 'you only need to report that something finished, such as a render, with no decision to make' },
    { name: 'dropdown-menu', when: 'the choice is picking one action on a generation from a short list' },
  ],
  rules: [
    {
      id: 'one-decision-per-dialog',
      do: 'Keep a dialog to one decision: a title that names it, a sentence on what will happen, and two buttons that name the outcomes.',
      dont: 'Pack several unrelated choices, extra fields and a row of four buttons into one dialog.',
      visual: true,
    },
    {
      id: 'always-title-and-description',
      do: 'Always include `DialogTitle` and `DialogDescription`; hide them with `sr-only` only when the design truly has no visible heading.',
      dont: 'Leave the title out. Screen readers then announce a dialog with no name.',
      visual: false,
    },
    {
      id: 'leaving-is-safe',
      do: 'Offer a Cancel button, and keep the close button and Escape working, so backing out never spends credits or changes anything.',
      dont: 'Trap people in a dialog whose only way out is the action.',
      visual: false,
    },
  ],
  a11y: [
    'Focus moves into the dialog when it opens, stays inside while it is open, and returns to the trigger when it closes.',
    'Escape and the close button both dismiss it; the rest of the page is hidden from screen readers while it is open.',
    '`DialogTitle` names the dialog and `DialogDescription` describes it; both are needed for a complete announcement.',
  ],
  tokens: ['--background', '--foreground', '--muted-foreground', '--accent', '--border', '--ring', '--radius'],
}
