import { create } from 'storybook/theming'
import { managerTheme } from './manager-theme.generated.mjs'

// Storybook's built-in docs styles (zebra table rows, inline code chips) come
// from its base theme, so the base must match the system's ground: a light
// base on a dark ground paints light rows under white text.
const [red, green, blue] = [1, 3, 5].map((i) => parseInt(managerTheme.appBg.slice(i, i + 2), 16))
const isDarkGround = 0.2126 * red + 0.7152 * green + 0.0722 * blue < 128

// Storybook's chrome in this system's colors and font, generated from the
// token module by scripts/build-tokens.mjs.
// The logo is hand-supplied artwork, not a token, so it lives here rather than
// in the generated file. brandTitle stays as the image's alt text.
export const theme = create({
  base: isDarkGround ? 'dark' : 'light',
  ...managerTheme,
  brandImage: './brand/mantis-logo.svg',
})
