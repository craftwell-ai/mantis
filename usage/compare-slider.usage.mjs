export const usage = {
  name: 'compare-slider',
  kind: 'block',
  summary: 'A before and after comparison: two pictures in one frame with a divider people drag, or move with the arrow keys, to reveal more of either.',
  useWhen: [
    'People judge a change to the same picture, such as an upscale, a relight, a retouch or a background removal.',
    'A marketing page shows what a tool does to a real image.',
  ],
  alternatives: [
    { name: 'media-tile', when: 'the two pictures are different shots; put them side by side as tiles' },
    { name: 'lightbox-inspector', when: 'people step through many results, not compare two versions of one' },
    { name: 'video-player', when: 'the result is a clip; compare stills from it instead' },
  ],
  rules: [
    {
      id: 'same-picture-same-crop',
      do: 'Compare two versions of the same picture at the same size and crop, so only the change differs.',
      dont: 'Put two unrelated pictures behind the divider; nothing lines up and the comparison says nothing.',
      visual: false,
    },
    {
      id: 'label-both-sides',
      do: 'Label each side with what it is, such as "Original" and "4K upscale".',
      dont: 'Leave people to guess which side is the result.',
      visual: false,
    },
    {
      id: 'original-on-the-left',
      do: 'Put the original on the left and the result on the right, the order people read in.',
      dont: 'Swap the sides between comparisons on the same page.',
      visual: false,
    },
  ],
  a11y: [
    'The divider is a slider named by `label`; the left and right arrow keys move it in steps of 5%.',
    'Each picture has its own alt text, and the corner labels are real text over a dark scrim.',
    'The handle is a 36px white circle, well above the 24px minimum target size.',
  ],
  tokens: ['--primary', '--primary-foreground', '--overlay', '--foreground', '--card'],
}
