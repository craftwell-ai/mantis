export const usage = {
  name: 'stepper',
  kind: 'component',
  summary: 'The composer\'s "− 1/4 +" control for small whole-number settings, such as how many images to generate at once.',
  useWhen: [
    'A small count with a known maximum is adjusted one step at a time, such as batch size 1 to 4.',
  ],
  alternatives: [
    { name: 'slider', when: 'the range is wide and approximate' },
    { name: 'toggle-group', when: 'only two or three values make sense' },
  ],
  rules: [
    {
      id: 'show-the-maximum',
      do: 'Show the maximum next to the value, such as 1/4, so people know the limit before they hit it.',
      dont: 'Show a bare number and silently stop increasing.',
      visual: true,
    },
  ],
  a11y: [
    'Both buttons are named ("Increase batch size"); they disable at the limits.',
    'The value is announced politely as it changes.',
  ],
  tokens: ['--chip', '--chip-border', '--chip-foreground'],
}
