export const usage = {
  name: 'heading',
  kind: 'component',
  summary: 'Page and section headings: the signature uppercase grotesk display levels (hero, section, sub, label) and plain Inter titles for dialogs and panels.',
  useWhen: [
    'A page or studio opens with a statement (`hero`), optionally with one word in lime (`HeadingAccent`).',
    'A page section needs a title (`section`) or a sub-section (`sub`).',
    'A dialog, sheet or settings card needs a title (`title`, `title-sm`).',
  ],
  alternatives: [
    { name: 'badge', when: 'the text is a short label on an item, not a heading' },
  ],
  rules: [
    {
      id: 'one-lime-word',
      do: 'Set at most one word or short phrase of a display heading in lime with HeadingAccent.',
      dont: 'Color a whole heading lime, or several scattered words; the accent stops pointing at anything.',
      visual: true,
    },
    {
      id: 'display-for-pages-titles-for-panels',
      do: 'Use display levels for page and section headings, and the Inter titles inside dialogs, sheets and cards.',
      dont: 'Put an uppercase display heading inside a small dialog; it shouts in a space meant for a quiet title.',
      visual: true,
    },
    {
      id: 'keep-heading-order',
      do: 'Keep the heading order on the page (h1, then h2, then h3); use `render` to change the tag when the visual level differs.',
      dont: 'Skip levels to get a size you like.',
      visual: false,
    },
  ],
  a11y: [
    'Each level renders a real heading element (hero is h1, section h2, sub h3); override with `render` to keep the outline correct.',
    'Uppercase is applied with CSS, so screen readers read the words normally.',
  ],
  tokens: ['--text-display-xl', '--text-display-lg', '--text-display-md', '--text-display-sm', '--text-label-caps', '--text-title-md', '--text-title-sm', '--font-grotesk', '--brand-text'],
}
