export const usage = {
  name: 'media-grid',
  kind: 'block',
  summary: 'A masonry gallery of community work in mixed aspect ratios with 4px gutters. Hovering or focusing a picture reveals its author and Recreate and Like actions over a dark scrim; a Load more button (and optional load-on-scroll) adds pages, with skeleton tiles while they arrive.',
  useWhen: [
    'An explore or community page shows many people\'s images and clips at their natural shapes.',
    'The list is long and paged, and should keep loading as someone scrolls.',
  ],
  alternatives: [
    { name: 'generation-feed', when: 'the work is the viewer\'s own history, with prompts, a zoom slider and a list view' },
    { name: 'card', when: 'there are only a few items and each needs a title and description under it' },
  ],
  rules: [
    {
      id: 'keep-natural-shapes',
      do: 'Pass each item\'s real `width` and `height` so portraits, squares and landscapes keep their shape in the masonry.',
      dont: 'Crop everything to squares, which cuts heads and horizons out of community work.',
      visual: true,
    },
    {
      id: 'reveal-on-hover',
      do: 'Leave the author and actions in the hover layer, so the gallery reads as pictures first.',
      dont: 'Print the author, like count and buttons under every picture.',
      visual: true,
    },
    {
      id: 'button-behind-autoload',
      do: 'Keep the Load more button even with `autoLoad`, so keyboard users and people with scroll loading blocked can reach the next page.',
      dont: 'Rely on scroll position alone to load more.',
      visual: false,
    },
  ],
  a11y: [
    'The grid is a labelled region (`label` prop); each picture opens through a button named "Open <alt>, by <author>".',
    'The hover layer appears on focus as well as hover, and is always shown on touch screens.',
    'Like is a toggle button (`aria-pressed`) named "Like <alt>, <count>".',
    'While a page loads, the region is `aria-busy` and the button\'s spinner announces "Loading more creations".',
  ],
  tokens: ['--field', '--skeleton', '--overlay', '--glass', '--brand-text', '--glass-border', '--muted-foreground', '--foreground', '--ring'],
}
