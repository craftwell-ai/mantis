export const usage = {
  name: 'studio-settings-panel',
  kind: 'block',
  summary: 'The left rail of a video studio: the chosen preset on top, up to N reference images, the prompt, the model row, duration, aspect and quality chips, a bitrate slider and the lime Generate button with its credit cost pinned at the bottom.',
  useWhen: [
    'A studio page sets up a video generation in a column beside the canvas or results, such as an image-to-video or effects studio.',
    'The request needs more settings than fit in a one-row composer: a preset, reference images and quality controls as well as the prompt.',
  ],
  alternatives: [
    { name: 'prompt-composer', when: 'the screen generates images from a prompt and a few chips, docked under the results' },
    { name: 'model-picker', when: 'you only need the model choice inside a surface you already built' },
  ],
  rules: [
    {
      id: 'generate-at-the-bottom',
      do: 'Keep Generate as the last thing in the rail, full width, with the cost on it, so people read the settings top to bottom and then commit.',
      dont: 'Put Generate at the top of the rail or beside the preset, before the settings that change its cost.',
      visual: true,
    },
    {
      id: 'chips-stay-neutral',
      do: 'Leave the duration, aspect and quality chips in the neutral chip style; only Generate is lime.',
      dont: 'Turn a chip lime to show it changed. Lime marks the one main action, Generate.',
      visual: true,
    },
    {
      id: 'say-the-reference-limit',
      do: 'Show how many reference slots are used, such as 2/4, and hide the add tile once the rail is full.',
      dont: 'Let people pick a fifth image and reject it after they upload it.',
      visual: false,
    },
    {
      id: 'explain-a-blocked-generate',
      do: 'Pass `creditBalance` so a clip people cannot afford disables Generate and says how to fix it.',
      dont: 'Let Generate fail after the click with a generic error about credits.',
      visual: false,
    },
  ],
  a11y: [
    'The rail is a form named "Video settings", and Generate is its only submit button.',
    'Each chip is named for its setting (Duration, Aspect ratio, Quality) because it shows only the chosen value.',
    'The bitrate slider is labelled by the visible word Bitrate and its value is shown as text beside it.',
    'Reference thumbnails keep their alt text, and each remove button names the image it removes.',
    'When credits run short, the explanation is linked to the disabled button with `aria-describedby`.',
  ],
  tokens: ['--card', '--card-foreground', '--field', '--chip', '--chip-border', '--glass', '--glass-border', '--overlay', '--brand', '--brand-foreground', '--brand-gloss', '--muted-foreground'],
}
