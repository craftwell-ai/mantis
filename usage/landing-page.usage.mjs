export const usage = {
  name: 'landing-page',
  kind: 'block',
  summary: 'A public marketing page for a product or tool: the signed-out top bar, the marketing hero, a feature grid, a three-step how-it-works, one closing call-to-action band and the lime site footer. Every section takes the props of the block it wraps, so the page is filled by content alone.',
  useWhen: [
    'You are building a home page or a landing page for one tool, for visitors who are not signed in.',
    'The page should walk a visitor from a promise, to what the product does, to how it works, to signing up.',
  ],
  alternatives: [
    { name: 'marketing-hero', when: 'only the opening section is needed inside an existing page' },
    { name: 'pricing-page', when: 'the visitor is comparing plans rather than learning what the product does' },
  ],
  rules: [
    {
      id: 'same-ask-twice',
      do: 'Make the closing call to action the same sign-up as the hero\'s primary button, so the page ends where it began.',
      dont: 'End on a different, smaller ask such as a newsletter.',
      visual: false,
    },
    {
      id: 'one-lime-action-per-section',
      do: 'Make the sign-up the lime call to action: in the top bar, as the hero\'s primary button and in the closing band. Each section has one lime button; the hero\'s second action is glass.',
      dont: 'Add a second lime button to a section, or make a lime area other than the footer.',
      visual: false,
    },
    {
      id: 'space-between-sections',
      do: 'Separate sections with space on the page ground.',
      dont: 'Box each section in its own bordered card or add divider lines between them.',
      visual: false,
    },
    {
      id: 'replace-sample-content',
      do: 'Pass your own data for every prop before shipping. Left out, a prop falls back to the invented sample product, Lumen, from sample-content, which is only there so the template previews with nothing filled in.',
      dont: 'Ship the sample product, people and numbers to real users, such as Maya Okafor\'s account menu or a credit balance nobody has.',
      visual: false,
    },
  ],
  a11y: [
    'The hero headline is the only h1; the feature grid, how-it-works and call-to-action band each start with an h2.',
    'Call-to-action buttons are real links styled as buttons, so they announce as links.',
    'Every picture has alt text describing what it stands in for.',
  ],
  tokens: ['--background', '--card', '--foreground', '--muted-foreground', '--primary', '--primary-foreground', '--brand-text', '--brand', '--brand-foreground'],
}
