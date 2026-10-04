export const usage = {
  name: 'input',
  kind: 'component',
  summary: 'A single-line text field for short typed answers: project names, seeds, collaborator emails, search terms.',
  useWhen: [
    'The answer is short, typed and not from a fixed list, such as a preset name, a seed number or an email to invite.',
    'A search box filters the asset library or a list of generations.',
  ],
  alternatives: [
    { name: 'A textarea', when: 'the answer can run past one line, such as a prompt or a negative prompt' },
    { name: 'A select or radio group', when: 'the answer must come from a short, known list, such as a model or an aspect ratio' },
    { name: 'form', when: 'several inputs are validated and submitted together' },
  ],
  rules: [
    {
      id: 'always-a-visible-label',
      do: 'Pair every input with a visible `Label` above it, and use the placeholder only for an example value.',
      dont: 'Use the placeholder as the label. It vanishes as soon as someone types, and the question goes with it.',
      visual: true,
    },
    {
      id: 'size-to-the-answer',
      do: 'Size each field to the answer it expects: narrow for a seed or a frame count, full width for a project title.',
      dont: 'Stretch every field to the same full width whatever goes in it; the width stops hinting at the answer.',
      visual: true,
    },
    {
      id: 'errors-say-how-to-fix',
      do: 'Explain an error in words below the field and say how to fix it, such as "Enter a seed between 0 and 99999".',
      dont: 'Signal an error with a red border alone.',
      visual: false,
    },
  ],
  a11y: [
    'Connect the label with `htmlFor` and the input\'s `id`; clicking the label then focuses the field.',
    'Set `aria-invalid` when the value fails validation, and point `aria-describedby` at the error text so it is announced.',
    'Use the matching `type` (`email`, `number`, `search`) and `autoComplete`, so phones show the right keyboard and browsers can fill the field in.',
    'A disabled input is skipped by the keyboard; use `readOnly` when people still need to select or copy the value, such as a share link.',
  ],
  tokens: ['--input', '--foreground', '--muted-foreground', '--primary', '--primary-foreground', '--ring', '--destructive', '--radius'],
}
