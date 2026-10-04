export const usage = {
  name: 'tooltip',
  kind: 'component',
  summary: 'A small dark label that names an icon-only control when someone hovers or focuses it.',
  useWhen: [
    'An icon button in the composer or toolbar has no visible text, such as add media or mention an element.',
    'A truncated value needs its full text on hover, such as a long preset name.',
  ],
  alternatives: [
    { name: 'popover', when: 'the extra content is interactive or longer than a short phrase' },
    { name: 'badge', when: 'the information should always be visible, not only on hover' },
  ],
  rules: [
    {
      id: 'name-the-control',
      do: 'Write a short name for what the control does, such as "Add media" or "Mention an element".',
      dont: 'Put instructions, links or several sentences in a tooltip. People cannot reach content that disappears when the pointer moves.',
      visual: true,
    },
    {
      id: 'not-the-only-label',
      do: 'Give the trigger its own accessible name (`aria-label`) as well; the tooltip repeats it visually.',
      dont: 'Rely on the tooltip as the only name. Touch screens never show it.',
      visual: false,
    },
  ],
  a11y: [
    'Opens on hover and on keyboard focus, and closes with Escape.',
    'Text is white on #171717 (well above 4.5:1).',
  ],
  tokens: ['--tooltip', '--tooltip-foreground', '--tooltip-border', '--radius-lg'],
}
