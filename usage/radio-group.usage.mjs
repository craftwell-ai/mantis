export const usage = {
  name: 'radio-group',
  kind: 'component',
  summary: 'Lets someone choose exactly one option from a short list, either as small radios or as whole selectable cards.',
  useWhen: [
    'One choice out of two to six options must be made, such as a project being private or public.',
    'Each option needs a title and a line of explanation, as in onboarding steps (`RadioGroupCard`).',
  ],
  alternatives: [
    { name: 'toggle-group', when: 'the options are short labels in a compact row, such as aspect ratios' },
    { name: 'select', when: 'there are more than six options, or space is tight' },
    { name: 'checkbox', when: 'more than one option can be chosen' },
  ],
  rules: [
    {
      id: 'cards-for-explained-choices',
      do: 'Use radio cards when each option needs a sentence of explanation, such as who can see a project.',
      dont: 'Use radio cards for one-word options; a row of small radios or a segmented control is easier to scan.',
      visual: true,
    },
    {
      id: 'preselect-a-safe-default',
      do: 'Start with the safest option selected, such as Private for a new project.',
      dont: 'Leave nothing selected when one answer is required.',
      visual: false,
    },
  ],
  a11y: [
    'Arrow keys move between options and select them; Tab moves in and out of the group.',
    'Each radio and card announces its label and whether it is selected.',
  ],
  tokens: ['--input', '--brand', '--primary-foreground', '--glass', '--ring'],
}
