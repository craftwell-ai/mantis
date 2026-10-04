export const usage = {
  name: 'switch',
  kind: 'component',
  summary: 'Turns one setting on or off immediately, such as sound on a clip or making a project public.',
  useWhen: [
    'A single option takes effect the moment it changes, with no save step, such as enhance prompt or audio.',
    'Billing switches between two periods (`size="lg"`, between two labels).',
  ],
  alternatives: [
    { name: 'checkbox', when: 'the choice is part of a form that is submitted later' },
    { name: 'toggle-group', when: 'there are more than two options, such as aspect ratios' },
  ],
  rules: [
    {
      id: 'label-the-setting',
      do: 'Put a visible label next to the switch that names the setting, such as "Sound".',
      dont: 'Show a switch with no label, or a label that says what happens when it is off.',
      visual: true,
    },
    {
      id: 'takes-effect-now',
      do: 'Apply the change as soon as the switch flips.',
      dont: 'Use a switch inside a form that only applies on Save; use a checkbox there.',
      visual: false,
    },
  ],
  a11y: [
    'Has the switch role and announces on or off; Space toggles it.',
    'Link it to its label with a <label> or `aria-labelledby`.',
  ],
  tokens: ['--brand', '--switch-off', '--primary', '--shadow-thumb-on', '--shadow-thumb-off'],
}
