export const usage = {
  name: 'icon',
  kind: 'component',
  summary: 'Draws a Material Symbols icon by name, sized to the text around it and painted in its color.',
  useWhen: [
    'A button, menu item or render status needs a small symbol that backs up its label.',
    'A control has no room for text, such as the close button on a preview; pair the icon with an accessible name.',
  ],
  alternatives: [
    { name: 'An image (`<img>`)', when: 'the picture is content, such as a generated still or a character reference, rather than interface chrome' },
    { name: 'Text alone', when: 'no symbol would be understood faster than the word itself' },
  ],
  rules: [
    {
      id: 'inherit-size-and-color',
      do: 'Let the icon take its size and color from the text beside it, so it sits in line with its label.',
      dont: 'Give an icon inside a control its own large size or a different color; it drifts away from its label.',
      visual: true,
    },
    {
      id: 'label-only-when-alone',
      do: 'Pass `label` only when the icon carries meaning on its own; next to visible text, leave it decorative.',
      dont: 'Label an icon that sits beside a text label; screen readers then read the same word twice.',
      visual: false,
    },
    {
      id: 'shipped-names-only',
      do: 'Use a name this system ships; to add one, list it in `scripts/icons.manifest.mjs` and rebuild.',
      dont: 'Paste in an SVG from elsewhere, or mix in another icon set.',
      visual: false,
    },
  ],
  a11y: [
    'Decorative by default: the SVG is `aria-hidden`, so screen readers skip it.',
    'With `label`, it becomes `role="img"` with that text as its `aria-label`.',
    'An icon-only button still needs a name: put `aria-label` on the button, or pass `label` to the icon.',
  ],
  tokens: [],
}
