export const usage = {
  name: 'add-media-panel',
  kind: 'block',
  summary: 'A panel for pulling existing media into a project: Uploads, Elements, Generations and Liked tabs over a grid of images, skeleton tiles while a tab loads, an empty state for each tab, an upload action and a count of what is picked.',
  useWhen: [
    'People add reference images or starting frames from what they already have, such as the add tile in a studio rail or a composer\'s add button.',
    'The media can come from several places (their uploads, saved elements, past generations, liked work) and they should not leave the screen to find it.',
  ],
  alternatives: [
    { name: 'empty-state', when: 'the whole page is an empty library, not a picker inside another task' },
    { name: 'preset-gallery', when: 'people choose one ready-made style, not their own media' },
  ],
  rules: [
    {
      id: 'confirm-stays-white',
      do: 'Confirm the pick with the white default button named for where the media goes, such as Add to references.',
      dont: 'Make the confirm button lime. Confirming a pick is an everyday step inside a panel, and the screen behind it already has its own lime action.',
      visual: true,
    },
    {
      id: 'empty-tab-explains-itself',
      do: 'Give every tab its own empty state saying what lands there and how, with Upload media on the Uploads tab.',
      dont: 'Show the same "No media" line on every tab.',
      visual: true,
    },
    {
      id: 'show-the-limit',
      do: 'Count picks against the limit ("2 of 4 selected") and number the chosen tiles in the order they were picked.',
      dont: 'Silently ignore clicks once the limit is reached.',
      visual: false,
    },
  ],
  a11y: [
    'The panel is a labelled region named by its heading; tabs are a real tab list ("Media source").',
    'Each media tile is a toggle button named by its image alt text, with `aria-pressed` for picked tiles and `aria-disabled` once the limit is reached.',
    'The selection count is a status region, so screen readers hear it change.',
    'The file input stays hidden and opens from a labelled button, so keyboard users meet one named control.',
    'While a tab loads, a status region says what is loading and the skeletons are hidden from screen readers.',
  ],
  tokens: ['--dialog', '--separator', '--glass', '--glass-border', '--secondary', '--overlay', '--brand', '--brand-foreground', '--skeleton', '--primary', '--primary-foreground', '--muted-foreground'],
}
