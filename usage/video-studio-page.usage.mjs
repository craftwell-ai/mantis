export const usage = {
  name: 'video-studio-page',
  kind: 'block',
  summary: 'A full video-studio page template: the top navigation, the studio settings panel as a left rail with Generate pinned to its foot, and a canvas that shows the latest clip large with its prompt and settings, a strip of recent clips to switch between, a rendering state and an empty state. Composes top-navigation, studio-settings-panel and empty-state.',
  useWhen: [
    'You are building the page where people set up and generate video clips, with a preset, references, duration, aspect ratio and quality.',
    'People compare several takes of a clip and need the latest one large with the rest in reach.',
  ],
  alternatives: [
    { name: 'image-studio-page', when: 'the output is still images and a single composer row is enough' },
    { name: 'studio-settings-panel', when: 'you only need the settings rail inside a layout of your own' },
    { name: 'generation-feed', when: 'people browse their whole history rather than the last few takes' },
  ],
  rules: [
    {
      id: 'canvas-is-the-brightest',
      do: 'Let the clip on the canvas be the brightest thing on screen, and mark the picked clip in the strip with the lime selection ring only.',
      dont: 'Cover every thumbnail in the strip with play badges or overlays that compete with the canvas.',
      visual: true,
    },
    {
      id: 'generate-pinned-to-the-rail',
      do: 'Keep Generate pinned to the foot of the rail, which sticks beside the canvas on wide screens.',
      dont: 'Let Generate scroll out of view at the end of a long settings list.',
      visual: true,
    },
    {
      id: 'captions-for-sound',
      do: 'Pass `captionsSrc` for any clip with speech or sound that carries meaning.',
      dont: 'Ship clips with dialogue and no captions track.',
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
    'A visually hidden h1 names the page (`pageTitle`, "Video studio" by default); the strip is headed "Recent clips".',
    'Each thumbnail in the strip is a toggle button with `aria-pressed`, named by the clip\'s description, so the picked clip is announced, not shown by color alone.',
    'A clip still rendering shows a status with a spoken label, and its thumbnail is named "Rendering: <description>".',
    'The canvas is an article labelled "Selected clip"; the model, settings and time under it are a description list.',
  ],
  tokens: ['--background', '--card', '--field', '--chip', '--chip-foreground', '--ring', '--muted-foreground', '--skeleton'],
}
