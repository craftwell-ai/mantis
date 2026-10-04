export const usage = {
  name: 'accordion',
  kind: 'component',
  summary: 'Stacked sections that open one at a time, such as the steps of a character builder or a list of advanced settings.',
  useWhen: [
    'A long set of options groups naturally into sections people rarely need all at once, such as character traits.',
    'Answers to common questions sit under short questions.',
  ],
  alternatives: [
    { name: 'tabs', when: 'the sections are peers people switch between often' },
  ],
  rules: [
    {
      id: 'scannable-triggers',
      do: 'Write short section titles that say what is inside, such as "Lighting" or "Wardrobe".',
      dont: 'Hide primary settings people need every time inside a closed section.',
      visual: true,
    },
  ],
  a11y: [
    'Each trigger is a button announcing expanded or collapsed; Enter or Space toggles it.',
  ],
  tokens: ['--divider', '--muted-foreground'],
}
