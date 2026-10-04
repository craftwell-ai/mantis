export const usage = {
  name: 'feature-grid',
  kind: 'block',
  summary: 'A landing-page section of feature cards: an uppercase section title with an optional lime word, then a grid of image-first cards, each with an uppercase title, one line and an optional lime "New" tag.',
  useWhen: [
    'A landing page shows several tools or capabilities side by side, each with an example image.',
    'Each feature can be described in one title and one line, and may link to its own page.',
  ],
  alternatives: [
    { name: 'project-card', when: 'the cards are someone\'s own projects inside the app' },
    { name: 'marketing-hero', when: 'the section opens the page with a single promise' },
  ],
  rules: [
    {
      id: 'image-first-cards',
      do: 'Lead every card with an image of the feature\'s result, and keep the text under it to a title and one line.',
      dont: 'Use icon-only cards with paragraphs of copy; the grid should look like the work.',
      visual: true,
    },
    {
      id: 'badge-sparingly',
      do: 'Badge only the one or two features that are genuinely new.',
      dont: 'Badge every card.',
      visual: false,
    },
  ],
  a11y: [
    'The section is named by its `h2`; each card title is an `h3`.',
    'With an `href`, the title is the link and stretches over the whole card, so there is one tab stop per card.',
    'Every image needs `alt` text describing what it shows.',
  ],
  tokens: ['--foreground', '--muted-foreground', '--brand-text', '--field', '--brand', '--primary-foreground'],
}
