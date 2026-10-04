export const usage = {
  name: 'sonner',
  kind: 'component',
  summary: 'Brief toast notifications that confirm an action finished, or report a problem, without pulling the user away from the canvas.',
  useWhen: [
    'An action finished where the result is not otherwise visible, such as "Published to community" after publishing from the asset library.',
    'A background job, such as a render or an upscale, succeeded or failed and the user should know, but does not have to respond.',
  ],
  alternatives: [
    { name: 'dialog', when: 'the user must decide or confirm something, such as spending credits, before anything happens' },
    { name: 'Text next to the field', when: 'the message is about one specific field, such as an invalid seed' },
  ],
  rules: [
    {
      id: 'mount-one-toaster',
      do: 'Render `<Toaster />` once, in the app\'s root layout, and call `toast()` from anywhere.',
      dont: 'Mount a Toaster inside each page or component; extra copies show the same toast more than once.',
      visual: false,
    },
    {
      id: 'say-what-happened',
      do: 'Say what happened in a few words that name the thing, such as "Glass Harbor upscaled to 4K".',
      dont: 'Write "Success!" or "Done", which tells people nothing they can check.',
      visual: false,
    },
    {
      id: 'never-the-only-record',
      do: 'Also show the result where the work lives, such as the finished tile in the asset library or the render queue.',
      dont: 'Put anything people must read twice or act on only in a toast. It disappears after a few seconds.',
      visual: false,
    },
    {
      id: 'undo-over-confirm',
      do: 'Offer an Undo action in the toast for actions that can be reversed, such as removing a generation from a project.',
      dont: 'Ask a confirmation question in a toast; use a dialog for decisions.',
      visual: false,
    },
  ],
  a11y: [
    'Toasts are announced through a polite live region, so screen readers read them without moving focus.',
    'A toast stays on screen while the pointer is over it, and Alt+T moves keyboard focus to the notification area.',
    'Keep the message short; a long toast can disappear before someone finishes reading it.',
  ],
  tokens: ['--popover', '--popover-foreground', '--border', '--radius'],
}
