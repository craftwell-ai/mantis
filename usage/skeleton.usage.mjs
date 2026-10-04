export const usage = {
  name: 'skeleton',
  kind: 'component',
  summary: 'A dark placeholder block with a slow shimmer that holds the shape of content while it loads, such as thumbnails in the asset picker.',
  useWhen: [
    'A grid of generations or assets is loading and its layout is known in advance.',
    'A card\'s text and image arrive a moment after the card itself.',
  ],
  alternatives: [
    { name: 'progress', when: 'the wait has a measurable amount, such as a render percentage' },
  ],
  rules: [
    {
      id: 'match-the-real-shape',
      do: 'Size skeletons like the content they stand in for, such as square tiles for a square thumbnail grid.',
      dont: 'Show one generic bar for a whole grid, then jump to a different layout when the content arrives.',
      visual: true,
    },
    {
      id: 'not-for-long-waits',
      do: 'Use skeletons for loads of a few seconds at most.',
      dont: 'Leave a skeleton up during a long render; show progress and a status instead.',
      visual: false,
    },
  ],
  a11y: [
    'Skeletons are hidden from screen readers (`aria-hidden`); mark the loading area as a labeled region (`role="region"`, `aria-label`) with `aria-busy="true"`.',
    'The shimmer stops for people who prefer reduced motion.',
  ],
  tokens: ['--skeleton', '--skeleton-shimmer', '--animate-shimmer', '--radius-lg'],
}
