export const usage = {
  name: 'video-player',
  kind: 'block',
  summary: 'A video player in Mantis\'s look: play and pause, a lime scrub bar, time, sound, captions and fullscreen over a clip in a rounded frame.',
  useWhen: [
    'People watch a generated or uploaded clip and need to scrub, mute, read captions or go fullscreen.',
    'A studio, lightbox or post shows one clip at a time and the browser\'s default controls would look out of place.',
  ],
  alternatives: [
    { name: 'media-tile', when: 'the clip is one of many in a grid; show a still and open the player on click' },
    { name: 'lightbox-inspector', when: 'the clip needs its prompt and settings beside it; the player goes inside the lightbox' },
    { name: 'skeleton', when: 'the clip is still rendering and there is nothing to play yet' },
  ],
  rules: [
    {
      id: 'name-the-clip',
      do: 'Give every player a `title` that says what the clip shows, such as "Ferry leaving the pier".',
      dont: 'Use the file name or "Video" as the title; it is what screen readers announce.',
      visual: false,
    },
    {
      id: 'captions-when-there-is-speech',
      do: 'Pass `captionsSrc` for any clip with speech; the captions button appears with it.',
      dont: 'Burn text into the picture as the only captions; it cannot be turned off, resized or read aloud.',
      visual: false,
    },
    {
      id: 'no-sound-by-surprise',
      do: 'Let people press play. If a clip must start on its own, set `autoPlay` together with `muted`.',
      dont: 'Auto-play with sound; browsers block it and people close the tab.',
      visual: false,
    },
    {
      id: 'one-playing-at-a-time',
      do: 'Show one player per view, and use stills (media tiles) for the rest of a gallery.',
      dont: 'Put a full player on every tile of a grid; controls on a dozen clips at once are noise.',
      visual: false,
    },
  ],
  a11y: [
    'The player is named by `title`. Every control is a real button or slider with its own name: Play, Mute, Seek, Volume, Captions and Fullscreen.',
    'Keyboard: Space or K plays and pauses, the arrow keys seek and change volume, M mutes, C toggles captions and F toggles fullscreen.',
    'Captions come from a real text track, so people can turn them on and off and assistive technology can read them.',
    'Controls are white on a dark scrim over the picture, so they stay readable over bright footage; the played part of the bar is lime, and the time is also written as numbers.',
  ],
  tokens: ['--foreground', '--brand', '--overlay', '--glass-border', '--glass-hover', '--primary', '--ring', '--tooltip', '--background'],
}
