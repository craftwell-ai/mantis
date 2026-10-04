export const usage = {
  name: 'field',
  kind: 'component',
  summary: 'Wraps a form control with its label, hint and error message, laid out the way the reference\'s profile and settings forms are.',
  useWhen: [
    'Any form input needs a visible label above it, such as Username or Bio.',
    'A control needs a hint below it or must show a validation error.',
  ],
  alternatives: [
    { name: 'input', when: 'the control sits in a composer with its own frame and an `aria-label`' },
  ],
  rules: [
    {
      id: 'label-above',
      do: 'Put a short label above every field, in the small grey label style.',
      dont: 'Use the placeholder as the only label.',
      visual: true,
    },
    {
      id: 'errors-say-how-to-fix',
      do: 'Write errors that say how to fix the problem, such as "Use 3 to 20 letters or numbers".',
      dont: 'Write "Invalid input".',
      visual: false,
    },
  ],
  a11y: [
    'FieldLabel is linked to its control; FieldError is announced when it appears.',
    'Labels are #8b8c8d on the page, which meets 4.5:1.',
  ],
  tokens: ['--muted-foreground', '--destructive', '--field'],
}
