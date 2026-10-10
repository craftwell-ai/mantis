/**
 * Token source of truth — TEMPLATE with a neutral placeholder brand.
 * At generation time the skill replaces every hex with extracted/derived
 * client values and renames `ds` to the client system's name. Structure is
 * the contract: every color and shadow leaf holds one value per mode in
 * `modes`; scripts/build-tokens.mjs generates globals.css, the registry theme
 * CSS, and the DTCG export from this file alone.
 */
export const tokens = {
  meta: { name: 'mantis', version: '1.0.2', defaultTheme: 'dark' },
  // Every mode this system ships, default first. Each color and shadow leaf
  // holds one value per mode; a mode after the first is selected with
  // data-theme="<mode>". Dark is derived only when the source defines none.
  modes: [
    "dark"
  ],
  color: {
    // Each role aliases the reference's semantic token it replicates. One mode,
    // 'dark', because the source ships a single (dark) theme.
    ground: {
      // G2 (2026-10-01): the rendered page uses the legacy surfaces, not the source tokens.
      base: { dark: '{legacy-color-surface-tertiary}' },
      raised: { dark: '{legacy-color-surface-primary}' },
    },
    surface: {
      card: { dark: '{legacy-color-surface-primary}' },
      inset: { dark: '{color-background-secondary-strong}' },
    },
    text: {
      primary: { dark: '{legacy-color-text-primary}' },
      // WCAG 2.1 AA adjustment (approved at G2): legacy font-secondary #898a8b
      // is 4.39:1 on inset fills; #8b8c8d is the smallest lift to 4.5:1.
      secondary: { dark: '#8b8c8d' },
    },
    accent: {
      base: { dark: '{color-brand-primary}' },
      deep: { dark: '{color-lime-600}' },
      text: { dark: '{color-text-brand}' },
    },
    line: {
      base: { dark: '{color-border-subtle}' },
      control: { dark: '{color-grey-300}' },
    },
    status: {
      // WCAG 2.1 AA (approved at G1): source text-danger #fa0019 is 4.46:1 on
      // the page; the source's own soft error ink (#ff5462) clears 4.5:1 everywhere.
      destructive: { dark: '{color-state-error-fg-soft}' },
      warning: { dark: '{color-text-warning}' },
      // Added 2026-10-02 (owner approved): the source's own soft success ink, 10:1 on cards.
      success: { dark: '{color-state-success-fg-soft}' },
    },
  },
  radius: { xs: '{radius-050}', sm: '{radius-100}', md: '{radius-150}', lg: '{radius-200}', control: '{radius-250}', xl: '{radius-300}', '2xl': '{radius-400}', '3xl': '{radius-500}', '4xl': '{radius-600}' },
  text: { '2xs': '{type-size-050}', xs: '{type-size-100}', sm: '{type-size-200}', base: '{type-size-300}', lg: '{type-size-500}', xl: '{type-size-600}', '2xl': '{type-size-700}', '3xl': '{type-size-900}', '4xl': '{type-size-1100}', '5xl': '{type-size-1300}', '6xl': '{type-size-1400}' },
  // The source's spacing scale, when it has one (values may alias `source`).
  spacing: {},
  shadow: {
    // Overlays, measured live: small popovers and menus; switch thumbs.
    popover: { dark: '0 4px 20px 0 rgba(0, 0, 0, 0.2)' },
    'card-inset': { dark: 'inset 2px 2px 2px 0 rgba(255, 255, 255, 0.02)' },
    'thumb-on': { dark: 'inset 0 0 0 1px rgba(0, 0, 0, 0.1), 0 1px 12px 0 rgba(0, 0, 0, 0.32), 0 1px 2px 0 rgba(0, 0, 0, 0.15)' },
    'thumb-lg': { dark: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)' },
    'thumb-off': { dark: '0 1px 2px 0 rgba(0, 0, 0, 0.15)' },
    // Button depth, measured live: glass and tint insets, the chunky CTA edge
    // (1px top highlight, 3px darker bottom edge, soft drop) and the gloss edge.
    'inset-glass': { dark: 'inset 0 1.5px 3px 0 rgba(255, 255, 255, 0.05)' },
    'inset-tint': { dark: 'inset 0 2px 3px 0 rgba(255, 255, 255, 0.03)' },
    'cta-light': { dark: 'inset 0 -3px 0 0 rgba(0, 0, 0, 0.1), 10px 34px 24px 0 rgba(0, 0, 0, 0.15)' },
    'cta-brand': { dark: 'inset 0 1px 0 0 #d1fe17, inset 0 -3px 0 0 #829b19, 10px 34px 24px 0 rgba(0, 0, 0, 0.15)' },
    // Pink fill is the WCAG lift #e5126d (owner-approved 2026-10-01); the edge keeps the source #8b0d44.
    'cta-pink': { dark: 'inset 0 1px 0 0 #e5126d, inset 0 -3px 0 0 #8b0d44, 10px 34px 24px 0 rgba(0, 0, 0, 0.15)' },
    'cta-blue': { dark: 'inset 0 1px 0 0 #245ef1, inset 0 -3px 0 0 #0d33b8, 10px 34px 24px 0 rgba(0, 0, 0, 0.15)' },
    'gloss-edge': { dark: 'inset 0 -3px 0 0 rgba(0, 0, 0, 0.43)' },
    sm: { dark: '{shadow-raised-sm}' },
    md: { dark: '{shadow-raised}' },
    lg: { dark: '{shadow-overlay}' },
    xl: { dark: '{shadow-modal}' },
  },
  font: {
    // Literal family names, never var(): @theme inline cannot resolve next/font's runtime variables.
    sans: '"Inter", system-ui, sans-serif',
    display: '"Inter Display", "Inter", system-ui, sans-serif',
    grotesk: '"Space Grotesk", system-ui, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  },
  // Accent or brand variants, selected with data-accent="<name>". Each is a
  // partial override — { source?: {…}, color?: {…} } — with a value per mode.
  // Measured live (2026-10-02): uppercase Space Grotesk display headings (-2%),
  // the caps label (-4%), and the Inter titles from the source dialog spec.
  // Responsive steps (768px / 1280px) are applied by the Heading component.
  textStyles: {
    'display-sm': { size: '1.5625rem', lineHeight: '2.25rem', letterSpacing: '-0.02em', fontWeight: '700' },
    'display-md': { size: '1.75rem', lineHeight: '2.25rem', letterSpacing: '-0.02em', fontWeight: '700' },
    'display-lg': { size: '3rem', lineHeight: '3.5rem', letterSpacing: '-0.02em', fontWeight: '700' },
    'display-xl': { size: '4rem', lineHeight: '4.5rem', letterSpacing: '-0.02em', fontWeight: '700' },
    'label-caps': { size: '1rem', lineHeight: '1.5rem', letterSpacing: '-0.04em', fontWeight: '700' },
    'title-sm': { size: '1.25rem', lineHeight: '1.75rem', letterSpacing: '-0.01em', fontWeight: '500' },
    'title-md': { size: '1.5rem', lineHeight: '1.875rem', letterSpacing: '-0.01em', fontWeight: '500' },
  },
  animate: { shimmer: 'shimmer-vertical 2s infinite' },
  // Backdrop blur, measured live: glass tab bars and toolbars 12px, glass
  // dialogs 32px, chips and tags over photos 8px. Emitted as backdrop-blur-*.
  blur: { chip: '8px', glass: '12px', dialog: '32px' },
  // Named motion the components read, aliasing the source's own scale.
  // Durations become --duration-* variables (Tailwind has no duration theme
  // key, so components write duration-(--duration-normal)); easings become
  // ease-* utilities. Tailwind's stock ease-in/out/in-out already equal the
  // source curves, so only the source's distinctive ones are added.
  motion: {
    duration: { fast: '{duration-fast}', quick: '{duration-150}', normal: '{duration-normal}', slow: '{duration-slow}' },
    ease: { swift: '{ease-swift}', emphasized: '{ease-emphasized}', spring: '{ease-spring}', 'out-expo': '{ease-out-expo}' },
  },
  keyframes: {
    'shimmer-vertical': '  0% { transform: translateY(100%); }\n  100% { transform: translateY(-150%); }',
  },
  accents: {},
  // The source layer: every token the reference defines, under its own names
  // and groups. A leaf is { $type, $value, $modes? } — `$value` in the default
  // mode, `$modes` only where another mode differs. Any value in this file may
  // alias one as '{group.token}'. CSS name: --<meta.name>-<group>-<token>.
  source: {
    "legacy-color-page-overlay": {
      "$type": "color",
      "$value": "#000000cc"
    },
    "gradient-skeleton-shimmer": {
      "$type": "string",
      "$value": "linear-gradient(transparent 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%)"
    },
    "color-skeleton-bg": {
      "$type": "color",
      "$value": "#202227"
    },
    "color-chip-bg": {
      "$type": "color",
      "$value": "#222222"
    },
    "legacy-color-divider-primary": {
      "$type": "color",
      "$value": "#ffffff14"
    },
    "color-tooltip-bg": {
      "$type": "color",
      "$value": "#171717"
    },
    "color-tooltip-border": {
      "$type": "color",
      "$value": "#222222"
    },
    "color-listbox-bg": {
      "$type": "color",
      "$value": "#1b1b1b"
    },
    "color-glass-panel": {
      "$type": "color",
      "$value": "#1c1e20f2"
    },
    "color-glass-panel-light": {
      "$type": "color",
      "$value": "#23262abf"
    },
    "color-switch-off": {
      "$type": "color",
      "$value": "{legacy-color-gray-9}"
    },
    "color-sale-pink-aa": {
      "$type": "color",
      "$value": "#eb0054"
    },
    "gradient-badge-hot-aa": {
      "$type": "string",
      "$value": "radial-gradient(39.71% 136.54% at 51.64% 117.31%, #da06b3 0%, #e5126d 100%)"
    },
    "gradient-badge-value-aa": {
      "$type": "string",
      "$value": "linear-gradient(90deg, #3259b4 0%, #086dff 50%, #008389 75%, #1e7fa2 100%)"
    },
    "gradient-text-gold-aa": {
      "$type": "string",
      "$value": "linear-gradient(90deg, #a98745 0%, #ecdba6 50%, #ab8744 100%)"
    },
    "gradient-text-fade": {
      "$type": "string",
      "$value": "linear-gradient(#ffffff 0%, rgba(255, 255, 255, 0.8) 100%)"
    },
    "gradient-brand-gloss": {
      "$type": "string",
      "$value": "radial-gradient(in oklab, #effe17 40%, #d1fe17 100%)"
    },
    "color-blue-100": {
      "$type": "color",
      "$value": "#ebf1ff"
    },
    "color-blue-1000": {
      "$type": "color",
      "$value": "#001640"
    },
    "color-blue-1100": {
      "$type": "color",
      "$value": "#000d26"
    },
    "color-blue-1200": {
      "$type": "color",
      "$value": "#000714"
    },
    "color-blue-200": {
      "$type": "color",
      "$value": "#cdf"
    },
    "color-blue-300": {
      "$type": "color",
      "$value": "#9fbfff"
    },
    "color-blue-400": {
      "$type": "color",
      "$value": "#5b91fe"
    },
    "color-blue-500": {
      "$type": "color",
      "$value": "#0256fe"
    },
    "color-blue-600": {
      "$type": "color",
      "$value": "#0249d8"
    },
    "color-blue-700": {
      "$type": "color",
      "$value": "#013aad"
    },
    "color-blue-800": {
      "$type": "color",
      "$value": "#012d84"
    },
    "color-blue-900": {
      "$type": "color",
      "$value": "#012161"
    },
    "color-cool-050": {
      "$type": "color",
      "$value": "#5c626a"
    },
    "color-cool-100": {
      "$type": "color",
      "$value": "#484e56"
    },
    "color-cool-150": {
      "$type": "color",
      "$value": "#383e46"
    },
    "color-cool-200": {
      "$type": "color",
      "$value": "#2a2d32"
    },
    "color-cool-250": {
      "$type": "color",
      "$value": "#23262a"
    },
    "color-cool-300": {
      "$type": "color",
      "$value": "#1c1e21"
    },
    "color-cool-350": {
      "$type": "color",
      "$value": "#18191c"
    },
    "color-cool-400": {
      "$type": "color",
      "$value": "#131416"
    },
    "color-cyan-100": {
      "$type": "color",
      "$value": "#f7fdfe"
    },
    "color-cyan-1000": {
      "$type": "color",
      "$value": "#273a3d"
    },
    "color-cyan-1100": {
      "$type": "color",
      "$value": "#172324"
    },
    "color-cyan-1200": {
      "$type": "color",
      "$value": "#0c1213"
    },
    "color-cyan-200": {
      "$type": "color",
      "$value": "#ebfafd"
    },
    "color-cyan-300": {
      "$type": "color",
      "$value": "#d9f6fa"
    },
    "color-cyan-400": {
      "$type": "color",
      "$value": "#bfeff7"
    },
    "color-cyan-500": {
      "$type": "color",
      "$value": "#9ce6f3"
    },
    "color-cyan-600": {
      "$type": "color",
      "$value": "#85c4cf"
    },
    "color-cyan-700": {
      "$type": "color",
      "$value": "#6a9ca5"
    },
    "color-cyan-800": {
      "$type": "color",
      "$value": "#51787e"
    },
    "color-cyan-900": {
      "$type": "color",
      "$value": "#3b575c"
    },
    "color-glass-dark": {
      "$type": "color",
      "$value": "#23262abf"
    },
    "color-glass-light": {
      "$type": "color",
      "$value": "#f4f4f4bf"
    },
    "color-green-100": {
      "$type": "color",
      "$value": "#e6ffea"
    },
    "color-green-1000": {
      "$type": "color",
      "$value": "#082b0d"
    },
    "color-green-1100": {
      "$type": "color",
      "$value": "#061f09"
    },
    "color-green-1200": {
      "$type": "color",
      "$value": "#041506"
    },
    "color-green-200": {
      "$type": "color",
      "$value": "#bbf7c4"
    },
    "color-green-300": {
      "$type": "color",
      "$value": "#86f998"
    },
    "color-green-400": {
      "$type": "color",
      "$value": "#4ee466"
    },
    "color-green-500": {
      "$type": "color",
      "$value": "#2eb844"
    },
    "color-green-600": {
      "$type": "color",
      "$value": "#009919"
    },
    "color-green-700": {
      "$type": "color",
      "$value": "#016f13"
    },
    "color-green-800": {
      "$type": "color",
      "$value": "#0d4a17"
    },
    "color-green-900": {
      "$type": "color",
      "$value": "#003d0a"
    },
    "color-green-glow": {
      "$type": "color",
      "$value": "#00e62e"
    },
    "color-grey-050": {
      "$type": "color",
      "$value": "#fff"
    },
    "color-grey-100": {
      "$type": "color",
      "$value": "#f4f4f4"
    },
    "color-grey-150": {
      "$type": "color",
      "$value": "#cecece"
    },
    "color-grey-200": {
      "$type": "color",
      "$value": "#a8a8a8"
    },
    "color-grey-250": {
      "$type": "color",
      "$value": "#7f7f7f"
    },
    "color-grey-300": {
      "$type": "color",
      "$value": "#828282"
    },
    "color-grey-325": {
      "$type": "color",
      "$value": "#626262"
    },
    "color-grey-350": {
      "$type": "color",
      "$value": "#565656"
    },
    "color-grey-400": {
      "$type": "color",
      "$value": "#454545"
    },
    "color-grey-450": {
      "$type": "color",
      "$value": "#323232"
    },
    "color-grey-500": {
      "$type": "color",
      "$value": "#2a2a2a"
    },
    "color-grey-550": {
      "$type": "color",
      "$value": "#1a1a1a"
    },
    "color-grey-600": {
      "$type": "color",
      "$value": "#000"
    },
    "color-lime-100": {
      "$type": "color",
      "$value": "#fbffec"
    },
    "color-lime-1000": {
      "$type": "color",
      "$value": "#344006"
    },
    "color-lime-1100": {
      "$type": "color",
      "$value": "#1f2603"
    },
    "color-lime-1200": {
      "$type": "color",
      "$value": "#111402"
    },
    "color-lime-200": {
      "$type": "color",
      "$value": "#f6ffd1"
    },
    "color-lime-300": {
      "$type": "color",
      "$value": "#eeffa7"
    },
    "color-lime-400": {
      "$type": "color",
      "$value": "#e1fe68"
    },
    "color-lime-500": {
      "$type": "color",
      "$value": "#d1fe17"
    },
    "color-lime-600": {
      "$type": "color",
      "$value": "#b2d814"
    },
    "color-lime-700": {
      "$type": "color",
      "$value": "#8ead10"
    },
    "color-lime-800": {
      "$type": "color",
      "$value": "#6d840c"
    },
    "color-lime-900": {
      "$type": "color",
      "$value": "#4f6109"
    },
    "color-lime-alpha-05": {
      "$type": "color",
      "$value": "#d1fe170d"
    },
    "color-lime-alpha-10": {
      "$type": "color",
      "$value": "#d1fe171a"
    },
    "color-lime-alpha-100": {
      "$type": "color",
      "$value": "#d1fe17"
    },
    "color-lime-alpha-15": {
      "$type": "color",
      "$value": "#d1fe1726"
    },
    "color-lime-alpha-20": {
      "$type": "color",
      "$value": "#d1fe1733"
    },
    "color-lime-alpha-30": {
      "$type": "color",
      "$value": "#d1fe174d"
    },
    "color-lime-alpha-40": {
      "$type": "color",
      "$value": "#d1fe1766"
    },
    "color-lime-alpha-50": {
      "$type": "color",
      "$value": "#d1fe1780"
    },
    "color-lime-alpha-60": {
      "$type": "color",
      "$value": "#d1fe1799"
    },
    "color-lime-alpha-70": {
      "$type": "color",
      "$value": "#d1fe17b2"
    },
    "color-lime-alpha-80": {
      "$type": "color",
      "$value": "#d1fe17cc"
    },
    "color-lime-alpha-90": {
      "$type": "color",
      "$value": "#d1fe17e5"
    },
    "color-neutral-050": {
      "$type": "color",
      "$value": "#fff"
    },
    "color-neutral-100": {
      "$type": "color",
      "$value": "#ededed"
    },
    "color-neutral-150": {
      "$type": "color",
      "$value": "#b4b4b4"
    },
    "color-neutral-200": {
      "$type": "color",
      "$value": "#4a4a4a"
    },
    "color-neutral-250": {
      "$type": "color",
      "$value": "#3e3e3e"
    },
    "color-neutral-300": {
      "$type": "color",
      "$value": "#272727"
    },
    "color-neutral-350": {
      "$type": "color",
      "$value": "#232323"
    },
    "color-neutral-400": {
      "$type": "color",
      "$value": "#1e1e1e"
    },
    "color-neutral-450": {
      "$type": "color",
      "$value": "#1d1d1d"
    },
    "color-neutral-500": {
      "$type": "color",
      "$value": "#171717"
    },
    "color-neutral-550": {
      "$type": "color",
      "$value": "#0e0e0e"
    },
    "color-neutral-600": {
      "$type": "color",
      "$value": "#000"
    },
    "color-orange-100": {
      "$type": "color",
      "$value": "#fff8f5"
    },
    "color-orange-1000": {
      "$type": "color",
      "$value": "#8f2b00"
    },
    "color-orange-1100": {
      "$type": "color",
      "$value": "#732200"
    },
    "color-orange-1200": {
      "$type": "color",
      "$value": "#571a00"
    },
    "color-orange-200": {
      "$type": "color",
      "$value": "#ffdbcc"
    },
    "color-orange-300": {
      "$type": "color",
      "$value": "#ffd1bd"
    },
    "color-orange-400": {
      "$type": "color",
      "$value": "#ffb494"
    },
    "color-orange-500": {
      "$type": "color",
      "$value": "#ff773d"
    },
    "color-orange-600": {
      "$type": "color",
      "$value": "#ff4f03"
    },
    "color-orange-700": {
      "$type": "color",
      "$value": "#db4200"
    },
    "color-orange-800": {
      "$type": "color",
      "$value": "#c73c00"
    },
    "color-orange-900": {
      "$type": "color",
      "$value": "#ad3400"
    },
    "color-pink-100": {
      "$type": "color",
      "$value": "#ffebf2"
    },
    "color-pink-1000": {
      "$type": "color",
      "$value": "#400017"
    },
    "color-pink-1100": {
      "$type": "color",
      "$value": "#26000e"
    },
    "color-pink-1200": {
      "$type": "color",
      "$value": "#140007"
    },
    "color-pink-200": {
      "$type": "color",
      "$value": "#ffccde"
    },
    "color-pink-300": {
      "$type": "color",
      "$value": "#ff9ec1"
    },
    "color-pink-400": {
      "$type": "color",
      "$value": "#ff5994"
    },
    "color-pink-500": {
      "$type": "color",
      "$value": "#ff005b"
    },
    "color-pink-600": {
      "$type": "color",
      "$value": "#d9004d"
    },
    "color-pink-700": {
      "$type": "color",
      "$value": "#ad003e"
    },
    "color-pink-800": {
      "$type": "color",
      "$value": "#85002f"
    },
    "color-pink-900": {
      "$type": "color",
      "$value": "#610023"
    },
    "color-pink-alpha-05": {
      "$type": "color",
      "$value": "#ff005b0d"
    },
    "color-pink-alpha-10": {
      "$type": "color",
      "$value": "#ff005b1a"
    },
    "color-pink-alpha-100": {
      "$type": "color",
      "$value": "#ff005b"
    },
    "color-pink-alpha-15": {
      "$type": "color",
      "$value": "#ff005b26"
    },
    "color-pink-alpha-20": {
      "$type": "color",
      "$value": "#ff005b33"
    },
    "color-pink-alpha-30": {
      "$type": "color",
      "$value": "#ff005b4d"
    },
    "color-pink-alpha-40": {
      "$type": "color",
      "$value": "#ff005b66"
    },
    "color-pink-alpha-50": {
      "$type": "color",
      "$value": "#ff005b80"
    },
    "color-pink-alpha-60": {
      "$type": "color",
      "$value": "#ff005b99"
    },
    "color-pink-alpha-70": {
      "$type": "color",
      "$value": "#ff005bb2"
    },
    "color-pink-alpha-80": {
      "$type": "color",
      "$value": "#ff005bcc"
    },
    "color-pink-alpha-90": {
      "$type": "color",
      "$value": "#ff005be5"
    },
    "color-purple-100": {
      "$type": "color",
      "$value": "#ebecfe"
    },
    "color-purple-1000": {
      "$type": "color",
      "$value": "#361f83"
    },
    "color-purple-1100": {
      "$type": "color",
      "$value": "#2b1b6a"
    },
    "color-purple-1200": {
      "$type": "color",
      "$value": "#221358"
    },
    "color-purple-200": {
      "$type": "color",
      "$value": "#d5d5fc"
    },
    "color-purple-300": {
      "$type": "color",
      "$value": "#b9b8f5"
    },
    "color-purple-400": {
      "$type": "color",
      "$value": "#9e99f7"
    },
    "color-purple-500": {
      "$type": "color",
      "$value": "#8271f8"
    },
    "color-purple-600": {
      "$type": "color",
      "$value": "#7152f4"
    },
    "color-purple-700": {
      "$type": "color",
      "$value": "#623be2"
    },
    "color-purple-800": {
      "$type": "color",
      "$value": "#5230c2"
    },
    "color-purple-900": {
      "$type": "color",
      "$value": "#442aa1"
    },
    "color-red-100": {
      "$type": "color",
      "$value": "#fff0f1"
    },
    "color-red-1000": {
      "$type": "color",
      "$value": "#5c000f"
    },
    "color-red-1100": {
      "$type": "color",
      "$value": "#45000b"
    },
    "color-red-1200": {
      "$type": "color",
      "$value": "#320008"
    },
    "color-red-200": {
      "$type": "color",
      "$value": "#ffdfe1"
    },
    "color-red-300": {
      "$type": "color",
      "$value": "#ffc2c6"
    },
    "color-red-400": {
      "$type": "color",
      "$value": "#ff969d"
    },
    "color-red-500": {
      "$type": "color",
      "$value": "#ff5462"
    },
    "color-red-600": {
      "$type": "color",
      "$value": "#fa0019"
    },
    "color-red-700": {
      "$type": "color",
      "$value": "#d60016"
    },
    "color-red-800": {
      "$type": "color",
      "$value": "#9b0018"
    },
    "color-red-900": {
      "$type": "color",
      "$value": "#7a0013"
    },
    "color-red-glow": {
      "$type": "color",
      "$value": "#ff1f2e"
    },
    "color-transparent-dark-05": {
      "$type": "color",
      "$value": "#0000000d"
    },
    "color-transparent-dark-10": {
      "$type": "color",
      "$value": "#0000001a"
    },
    "color-transparent-dark-100": {
      "$type": "color",
      "$value": "#000"
    },
    "color-transparent-dark-12": {
      "$type": "color",
      "$value": "#0000001f"
    },
    "color-transparent-dark-15": {
      "$type": "color",
      "$value": "#00000026"
    },
    "color-transparent-dark-20": {
      "$type": "color",
      "$value": "#0003"
    },
    "color-transparent-dark-25": {
      "$type": "color",
      "$value": "#00000040"
    },
    "color-transparent-dark-30": {
      "$type": "color",
      "$value": "#0000004d"
    },
    "color-transparent-dark-32": {
      "$type": "color",
      "$value": "#00000052"
    },
    "color-transparent-dark-40": {
      "$type": "color",
      "$value": "#0006"
    },
    "color-transparent-dark-50": {
      "$type": "color",
      "$value": "#00000080"
    },
    "color-transparent-dark-60": {
      "$type": "color",
      "$value": "#0009"
    },
    "color-transparent-dark-70": {
      "$type": "color",
      "$value": "#000000b2"
    },
    "color-transparent-dark-80": {
      "$type": "color",
      "$value": "#000c"
    },
    "color-transparent-dark-90": {
      "$type": "color",
      "$value": "#000000e5"
    },
    "color-transparent-light-05": {
      "$type": "color",
      "$value": "#ffffff0d"
    },
    "color-transparent-light-10": {
      "$type": "color",
      "$value": "#ffffff1a"
    },
    "color-transparent-light-100": {
      "$type": "color",
      "$value": "#fff"
    },
    "color-transparent-light-15": {
      "$type": "color",
      "$value": "#ffffff26"
    },
    "color-transparent-light-20": {
      "$type": "color",
      "$value": "#fff3"
    },
    "color-transparent-light-30": {
      "$type": "color",
      "$value": "#ffffff4d"
    },
    "color-transparent-light-40": {
      "$type": "color",
      "$value": "#fff6"
    },
    "color-transparent-light-50": {
      "$type": "color",
      "$value": "#ffffff80"
    },
    "color-transparent-light-60": {
      "$type": "color",
      "$value": "#fff9"
    },
    "color-transparent-light-70": {
      "$type": "color",
      "$value": "#ffffffb2"
    },
    "color-transparent-light-80": {
      "$type": "color",
      "$value": "#fffc"
    },
    "color-transparent-light-90": {
      "$type": "color",
      "$value": "#ffffffe5"
    },
    "color-yellow-100": {
      "$type": "color",
      "$value": "#fffde5"
    },
    "color-yellow-1000": {
      "$type": "color",
      "$value": "#6e5500"
    },
    "color-yellow-1100": {
      "$type": "color",
      "$value": "#523f00"
    },
    "color-yellow-1200": {
      "$type": "color",
      "$value": "#3a2d00"
    },
    "color-yellow-200": {
      "$type": "color",
      "$value": "#fffac2"
    },
    "color-yellow-300": {
      "$type": "color",
      "$value": "#fff599"
    },
    "color-yellow-400": {
      "$type": "color",
      "$value": "#fff266"
    },
    "color-yellow-500": {
      "$type": "color",
      "$value": "#ffef33"
    },
    "color-yellow-600": {
      "$type": "color",
      "$value": "#ffeb00"
    },
    "color-yellow-700": {
      "$type": "color",
      "$value": "#dfab01"
    },
    "color-yellow-800": {
      "$type": "color",
      "$value": "#b58b00"
    },
    "color-yellow-900": {
      "$type": "color",
      "$value": "#8f6e00"
    },
    "color-yellow-glow": {
      "$type": "color",
      "$value": "#fff05a"
    },
    "border-width-none": {
      "$type": "dimension",
      "$value": "0px"
    },
    "border-width-hairline": {
      "$type": "dimension",
      "$value": ".5px"
    },
    "border-width-thin": {
      "$type": "dimension",
      "$value": "1px"
    },
    "border-width-medium": {
      "$type": "dimension",
      "$value": "1.5px"
    },
    "border-width-thick": {
      "$type": "dimension",
      "$value": "2px"
    },
    "breakpoint-mobile": {
      "$type": "dimension",
      "$value": "20rem"
    },
    "breakpoint-tablet": {
      "$type": "dimension",
      "$value": "48rem"
    },
    "breakpoint-desktop": {
      "$type": "dimension",
      "$value": "80rem"
    },
    "breakpoint-wide": {
      "$type": "dimension",
      "$value": "120rem"
    },
    "radius-0": {
      "$type": "number",
      "$value": "0"
    },
    "radius-050": {
      "$type": "dimension",
      "$value": ".125rem"
    },
    "radius-100": {
      "$type": "dimension",
      "$value": ".25rem"
    },
    "radius-150": {
      "$type": "dimension",
      "$value": ".375rem"
    },
    "radius-200": {
      "$type": "dimension",
      "$value": ".5rem"
    },
    "radius-250": {
      "$type": "dimension",
      "$value": ".625rem"
    },
    "radius-300": {
      "$type": "dimension",
      "$value": ".75rem"
    },
    "radius-400": {
      "$type": "dimension",
      "$value": "1rem"
    },
    "radius-500": {
      "$type": "dimension",
      "$value": "1.25rem"
    },
    "radius-600": {
      "$type": "dimension",
      "$value": "1.5rem"
    },
    "radius-full": {
      "$type": "dimension",
      "$value": "9999px"
    },
    "space-0": {
      "$type": "number",
      "$value": "0"
    },
    "space-050": {
      "$type": "dimension",
      "$value": ".125rem"
    },
    "space-100": {
      "$type": "dimension",
      "$value": ".25rem"
    },
    "space-150": {
      "$type": "dimension",
      "$value": ".375rem"
    },
    "space-200": {
      "$type": "dimension",
      "$value": ".5rem"
    },
    "space-250": {
      "$type": "dimension",
      "$value": ".625rem"
    },
    "space-300": {
      "$type": "dimension",
      "$value": ".75rem"
    },
    "space-400": {
      "$type": "dimension",
      "$value": "1rem"
    },
    "space-500": {
      "$type": "dimension",
      "$value": "1.25rem"
    },
    "space-600": {
      "$type": "dimension",
      "$value": "1.5rem"
    },
    "space-650": {
      "$type": "dimension",
      "$value": "1.5rem"
    },
    "space-700": {
      "$type": "dimension",
      "$value": "1.75rem"
    },
    "space-800": {
      "$type": "dimension",
      "$value": "2rem"
    },
    "space-1000": {
      "$type": "dimension",
      "$value": "2.5rem"
    },
    "space-1200": {
      "$type": "dimension",
      "$value": "3rem"
    },
    "space-1400": {
      "$type": "dimension",
      "$value": "3.5rem"
    },
    "space-1600": {
      "$type": "dimension",
      "$value": "4rem"
    },
    "space-2000": {
      "$type": "dimension",
      "$value": "5rem"
    },
    "space-2400": {
      "$type": "dimension",
      "$value": "6rem"
    },
    "shadow-inset-tile": {
      "$type": "string",
      "$value": "inset 0 var(--mantis-space-050)var(--mantis-space-150)var(--mantis-space-0)var(--mantis-color-transparent-light-15),0 var(--mantis-space-050)var(--mantis-space-050)calc(-1*var(--mantis-space-050))var(--mantis-color-shadow-sm)"
    },
    "shadow-inset-tile-hairline": {
      "$type": "string",
      "$value": "inset 0 var(--mantis-space-050)var(--mantis-space-150)var(--mantis-space-0)var(--mantis-color-transparent-light-15),0 var(--mantis-space-050)var(--mantis-border-width-medium)-.5px var(--mantis-color-shadow-sm)"
    },
    "shadow-modal": {
      "$type": "string",
      "$value": "inset 0 var(--mantis-space-050)calc(var(--mantis-space-050) + var(--mantis-border-width-thin))var(--mantis-space-0)var(--mantis-color-transparent-light-05),0 var(--mantis-space-050)var(--mantis-space-100)-.5px var(--mantis-color-transparent-dark-15)"
    },
    "shadow-overlay": {
      "$type": "string",
      "$value": "inset 0 var(--mantis-space-050)calc(var(--mantis-space-050) + var(--mantis-border-width-thin))var(--mantis-space-0)var(--mantis-color-transparent-light-05),0 var(--mantis-space-100)var(--mantis-space-500)calc(-1*var(--mantis-space-200))var(--mantis-color-shadow-md)"
    },
    "shadow-raised": {
      "$type": "string",
      "$value": "inset 0 var(--mantis-space-050)calc(var(--mantis-space-050) + var(--mantis-border-width-thin))var(--mantis-space-0)var(--mantis-color-transparent-light-05),var(--mantis-space-0)var(--mantis-space-100)var(--mantis-space-600)calc(-1*var(--mantis-space-200))var(--mantis-color-transparent-dark-15)"
    },
    "shadow-raised-sm": {
      "$type": "string",
      "$value": "0 var(--mantis-border-width-thick)var(--mantis-space-100)var(--mantis-space-0)var(--mantis-color-transparent-dark-10)"
    },
    "shadow-sheen": {
      "$type": "string",
      "$value": "inset 0 var(--mantis-space-050)calc(var(--mantis-space-050) + var(--mantis-border-width-thin))var(--mantis-space-0)var(--mantis-color-transparent-light-05)"
    },
    "shadow-thumb-soft": {
      "$type": "string",
      "$value": "0 var(--mantis-border-width-thin)var(--mantis-space-050)var(--mantis-space-0)var(--mantis-color-transparent-dark-15)"
    },
    "shadow-thumb-strong": {
      "$type": "string",
      "$value": "0 var(--mantis-border-width-thin)var(--mantis-space-300)var(--mantis-space-0)var(--mantis-color-transparent-dark-30)"
    },
    "type-family-grotesk-base": {
      "$type": "string",
      "$value": "\"Space Grotesk\""
    },
    "type-family-mono-base": {
      "$type": "string",
      "$value": "\"IBM Plex Mono\""
    },
    "type-family-primary-base": {
      "$type": "string",
      "$value": "\"Inter Display\""
    },
    "type-family-secondary-base": {
      "$type": "string",
      "$value": "\"Inter\""
    },
    "type-weight-black": {
      "$type": "number",
      "$value": "900"
    },
    "type-weight-bold": {
      "$type": "number",
      "$value": "700"
    },
    "type-weight-medium": {
      "$type": "number",
      "$value": "500"
    },
    "type-weight-regular": {
      "$type": "number",
      "$value": "400"
    },
    "type-weight-semi-bold": {
      "$type": "number",
      "$value": "600"
    },
    "type-letter-spacing-loose": {
      "$type": "dimension",
      "$value": ".00625rem"
    },
    "type-letter-spacing-none": {
      "$type": "number",
      "$value": "0"
    },
    "type-letter-spacing-slight": {
      "$type": "dimension",
      "$value": "-.025rem"
    },
    "type-letter-spacing-tight": {
      "$type": "dimension",
      "$value": "-.075rem"
    },
    "type-letter-spacing-wide": {
      "$type": "dimension",
      "$value": ".0125rem"
    },
    "z-index-base": {
      "$type": "number",
      "$value": "0"
    },
    "z-index-dropdown": {
      "$type": "number",
      "$value": "10"
    },
    "z-index-sticky": {
      "$type": "number",
      "$value": "20"
    },
    "z-index-overlay": {
      "$type": "number",
      "$value": "30"
    },
    "z-index-modal": {
      "$type": "number",
      "$value": "40"
    },
    "z-index-popover": {
      "$type": "number",
      "$value": "50"
    },
    "z-index-toast": {
      "$type": "number",
      "$value": "60"
    },
    "z-index-tooltip": {
      "$type": "number",
      "$value": "70"
    },
    "duration-instant": {
      "$type": "duration",
      "$value": "0s"
    },
    "duration-fast": {
      "$type": "duration",
      "$value": ".1s"
    },
    "duration-normal": {
      "$type": "duration",
      "$value": ".2s"
    },
    "duration-slow": {
      "$type": "duration",
      "$value": ".3s"
    },
    "duration-slower": {
      "$type": "duration",
      "$value": ".5s"
    },
    "duration-80": {
      "$type": "duration",
      "$value": "80ms"
    },
    "duration-120": {
      "$type": "duration",
      "$value": ".12s"
    },
    "duration-130": {
      "$type": "duration",
      "$value": ".13s"
    },
    "duration-150": {
      "$type": "duration",
      "$value": ".15s"
    },
    "duration-160": {
      "$type": "duration",
      "$value": ".16s"
    },
    "duration-180": {
      "$type": "duration",
      "$value": ".18s"
    },
    "duration-220": {
      "$type": "duration",
      "$value": ".22s"
    },
    "duration-260": {
      "$type": "duration",
      "$value": ".26s"
    },
    "duration-350": {
      "$type": "duration",
      "$value": ".35s"
    },
    "duration-400": {
      "$type": "duration",
      "$value": ".4s"
    },
    "duration-700": {
      "$type": "duration",
      "$value": ".7s"
    },
    "duration-800": {
      "$type": "duration",
      "$value": ".8s"
    },
    "duration-1000": {
      "$type": "duration",
      "$value": "1s"
    },
    "duration-1200": {
      "$type": "duration",
      "$value": "1.2s"
    },
    "duration-1300": {
      "$type": "duration",
      "$value": "1.3s"
    },
    "duration-1400": {
      "$type": "duration",
      "$value": "1.4s"
    },
    "ease-in": {
      "$type": "cubicBezier",
      "$value": [
        0.4,
        0,
        1,
        1
      ]
    },
    "ease-out": {
      "$type": "cubicBezier",
      "$value": [
        0,
        0,
        0.2,
        1
      ]
    },
    "ease-in-out": {
      "$type": "cubicBezier",
      "$value": [
        0.4,
        0,
        0.2,
        1
      ]
    },
    "ease-linear": {
      "$type": "string",
      "$value": "linear"
    },
    "ease-spring": {
      "$type": "cubicBezier",
      "$value": [
        0.34,
        1.56,
        0.64,
        1
      ]
    },
    "ease-out-expo": {
      "$type": "cubicBezier",
      "$value": [
        0.16,
        1,
        0.3,
        1
      ]
    },
    "ease-emphasized": {
      "$type": "cubicBezier",
      "$value": [
        0.32,
        0.72,
        0,
        1
      ]
    },
    "ease-swift": {
      "$type": "cubicBezier",
      "$value": [
        0.2,
        0,
        0,
        1
      ]
    },
    "ease-in-out-circ": {
      "$type": "cubicBezier",
      "$value": [
        0.65,
        0,
        0.35,
        1
      ]
    },
    "ease-out-quart": {
      "$type": "cubicBezier",
      "$value": [
        0.22,
        1,
        0.36,
        1
      ]
    },
    "icon-xs": {
      "$type": "dimension",
      "$value": ".75rem"
    },
    "icon-sm": {
      "$type": "dimension",
      "$value": "1rem"
    },
    "icon-md": {
      "$type": "dimension",
      "$value": "1.25rem"
    },
    "icon-lg": {
      "$type": "dimension",
      "$value": "1.5rem"
    },
    "icon-xl": {
      "$type": "dimension",
      "$value": "1.75rem"
    },
    "opacity-disabled": {
      "$type": "number",
      "$value": ".5"
    },
    "opacity-muted": {
      "$type": "number",
      "$value": ".4"
    },
    "gradient-badge-blue": {
      "$type": "string",
      "$value": "radial-gradient(ellipse 39.43% 136.54% at 51.64% 117.31%,#4fc9dc 0%,#32a2ee 50%,#167bff 100%)"
    },
    "gradient-badge-pink": {
      "$type": "string",
      "$value": "radial-gradient(ellipse 39.43% 136.54% at 51.64% 117.31%,#ee4596 0%,#ed2d84 50%,#ed1572 100%)"
    },
    "gradient-badge-purple": {
      "$type": "string",
      "$value": "radial-gradient(ellipse 39.43% 136.54% at 51.64% 117.31%,#ee4596 0%,#bb2dc2 50%,#8815ed 100%)"
    },
    "gradient-glass-sheen": {
      "$type": "string",
      "$value": "linear-gradient(148.916deg,#ffffff0a 22.606%,#ffffff0f 51.256%,#ffffff05 79.906%),linear-gradient(90deg,#23262abf 0%,#23262abf 100%)"
    },
    "gradient-glass-sheen-alt": {
      "$type": "string",
      "$value": "linear-gradient(123.898deg,#ffffff0a 22.606%,#ffffff0f 51.256%,#ffffff05 79.906%),linear-gradient(90deg,#23262abf 0%,#23262abf 100%)"
    },
    "gradient-loader-sweep": {
      "$type": "string",
      "$value": "linear-gradient(105deg,transparent 35%,var(--_c)50%,transparent 65%)"
    },
    "gradient-special-gloss-lime": {
      "$type": "string",
      "$value": "linear-gradient(#ffff1400 0%,#ffff14 100%)"
    },
    "gradient-special-gloss-lime-angled": {
      "$type": "string",
      "$value": "linear-gradient(191.434deg,#ffff1400 12.723%,#ffff14 75.8%)"
    },
    "gradient-special-gloss-pink": {
      "$type": "string",
      "$value": "linear-gradient(191.434deg,#f364e400 12.723%,#fa4ae7 75.8%)"
    },
    "app-css-ready": {
      "$type": "string",
      "$value": "visible"
    },
    "color-background-elevated-end": {
      "$type": "color",
      "$value": "{color-cool-350}"
    },
    "color-background-elevated-start": {
      "$type": "color",
      "$value": "{color-cool-150}"
    },
    "color-background-glass": {
      "$type": "color",
      "$value": "{color-glass-dark}"
    },
    "color-background-inverse": {
      "$type": "color",
      "$value": "{color-grey-050}"
    },
    "color-background-primary": {
      "$type": "color",
      "$value": "{color-cool-400}"
    },
    "color-background-secondary": {
      "$type": "color",
      "$value": "{color-cool-300}"
    },
    "color-background-secondary-strong": {
      "$type": "color",
      "$value": "{color-cool-250}"
    },
    "color-background-tertiary": {
      "$type": "color",
      "$value": "{color-cool-200}"
    },
    "color-border-default": {
      "$type": "color",
      "$value": "{color-transparent-light-10}"
    },
    "color-border-error": {
      "$type": "color",
      "$value": "{color-red-600}"
    },
    "color-border-focus": {
      "$type": "color",
      "$value": "{color-lime-500}"
    },
    "color-border-inverse": {
      "$type": "color",
      "$value": "{color-grey-050}"
    },
    "color-border-strong": {
      "$type": "color",
      "$value": "{color-transparent-light-20}"
    },
    "color-border-subtle": {
      "$type": "color",
      "$value": "{color-transparent-light-05}"
    },
    "color-border-success": {
      "$type": "color",
      "$value": "{color-green-500}"
    },
    "color-border-warning": {
      "$type": "color",
      "$value": "{color-yellow-500}"
    },
    "color-brand-blue": {
      "$type": "color",
      "$value": "{color-blue-500}"
    },
    "color-brand-cyan": {
      "$type": "color",
      "$value": "{color-cyan-500}"
    },
    "color-brand-green": {
      "$type": "color",
      "$value": "{color-green-500}"
    },
    "color-brand-orange": {
      "$type": "color",
      "$value": "{color-orange-600}"
    },
    "color-brand-pink": {
      "$type": "color",
      "$value": "{color-pink-500}"
    },
    "color-brand-primary": {
      "$type": "color",
      "$value": "{color-lime-500}"
    },
    "color-brand-red": {
      "$type": "color",
      "$value": "{color-red-600}"
    },
    "color-brand-yellow": {
      "$type": "color",
      "$value": "{color-yellow-500}"
    },
    "color-brand-yellow-light": {
      "$type": "color",
      "$value": "{color-yellow-300}"
    },
    "color-button-brand": {
      "$type": "color",
      "$value": "{color-lime-500}"
    },
    "color-button-destructive": {
      "$type": "color",
      "$value": "{color-red-600}"
    },
    "color-button-label-brand": {
      "$type": "color",
      "$value": "{color-grey-550}"
    },
    "color-button-label-destructive": {
      "$type": "color",
      "$value": "{color-grey-050}"
    },
    "color-button-primary": {
      "$type": "color",
      "$value": "{color-grey-050}"
    },
    "color-button-secondary": {
      "$type": "color",
      "$value": "{color-cool-250}"
    },
    "color-button-tertiary": {
      "$type": "color",
      "$value": "{color-cool-050}"
    },
    "color-icon-accent": {
      "$type": "color",
      "$value": "{color-lime-500}"
    },
    "color-icon-brand": {
      "$type": "color",
      "$value": "{color-lime-500}"
    },
    "color-icon-disabled": {
      "$type": "color",
      "$value": "{color-cool-100}"
    },
    "color-icon-error": {
      "$type": "color",
      "$value": "{color-red-600}"
    },
    "color-icon-info": {
      "$type": "color",
      "$value": "{color-blue-500}"
    },
    "color-icon-inverse": {
      "$type": "color",
      "$value": "{color-grey-550}"
    },
    "color-icon-on-overlay-secondary": {
      "$type": "color",
      "$value": "{color-transparent-light-50}"
    },
    "color-icon-on-overlay-tertiary": {
      "$type": "color",
      "$value": "{color-transparent-light-30}"
    },
    "color-icon-primary": {
      "$type": "color",
      "$value": "{color-grey-050}"
    },
    "color-icon-secondary": {
      "$type": "color",
      "$value": "{color-grey-300}"
    },
    "color-icon-success": {
      "$type": "color",
      "$value": "{color-green-500}"
    },
    "color-icon-tertiary": {
      "$type": "color",
      "$value": "{color-grey-325}"
    },
    "color-icon-warning": {
      "$type": "color",
      "$value": "{color-yellow-700}"
    },
    "color-overlay-dim-soft": {
      "$type": "color",
      "$value": "{color-transparent-light-05}"
    },
    "color-overlay-dim-strong": {
      "$type": "color",
      "$value": "{color-transparent-light-20}"
    },
    "color-overlay-hover": {
      "$type": "color",
      "$value": "{color-transparent-light-05}"
    },
    "color-overlay-scrim": {
      "$type": "color",
      "$value": "{color-transparent-dark-50}"
    },
    "color-overlay-wash": {
      "$type": "color",
      "$value": "{color-transparent-light-50}"
    },
    "color-palette-blue-bg": {
      "$type": "color",
      "$value": "{color-blue-500}"
    },
    "color-palette-blue-text": {
      "$type": "color",
      "$value": "{color-blue-100}"
    },
    "color-palette-brown-bg": {
      "$type": "color",
      "$value": "{color-yellow-300}"
    },
    "color-palette-brown-text": {
      "$type": "color",
      "$value": "{color-yellow-700}"
    },
    "color-palette-mint-bg": {
      "$type": "color",
      "$value": "{color-green-400}"
    },
    "color-palette-mint-text": {
      "$type": "color",
      "$value": "{color-green-900}"
    },
    "color-palette-orange-bg": {
      "$type": "color",
      "$value": "{color-orange-600}"
    },
    "color-palette-orange-text": {
      "$type": "color",
      "$value": "{color-orange-100}"
    },
    "color-palette-pink-bg": {
      "$type": "color",
      "$value": "{color-pink-500}"
    },
    "color-palette-pink-text": {
      "$type": "color",
      "$value": "{color-pink-100}"
    },
    "color-palette-purple-bg": {
      "$type": "color",
      "$value": "{color-purple-600}"
    },
    "color-palette-purple-text": {
      "$type": "color",
      "$value": "{color-purple-100}"
    },
    "color-palette-white": {
      "$type": "color",
      "$value": "{color-grey-050}"
    },
    "color-shadow-2xl": {
      "$type": "color",
      "$value": "{color-transparent-dark-40}"
    },
    "color-shadow-lg": {
      "$type": "color",
      "$value": "{color-transparent-dark-20}"
    },
    "color-shadow-md": {
      "$type": "color",
      "$value": "{color-transparent-dark-15}"
    },
    "color-shadow-sm": {
      "$type": "color",
      "$value": "{color-transparent-dark-05}"
    },
    "color-shadow-xl": {
      "$type": "color",
      "$value": "{color-transparent-dark-30}"
    },
    "color-state-error-bg": {
      "$type": "color",
      "$value": "{color-red-1000}"
    },
    "color-state-error-fg": {
      "$type": "color",
      "$value": "{color-red-600}"
    },
    "color-state-error-fg-soft": {
      "$type": "color",
      "$value": "{color-red-500}"
    },
    "color-state-error-glow": {
      "$type": "color",
      "$value": "{color-red-glow}"
    },
    "color-state-info-bg": {
      "$type": "color",
      "$value": "{color-blue-1100}"
    },
    "color-state-info-fg": {
      "$type": "color",
      "$value": "{color-blue-500}"
    },
    "color-state-info-fg-soft": {
      "$type": "color",
      "$value": "{color-blue-400}"
    },
    "color-state-success-bg": {
      "$type": "color",
      "$value": "{color-green-800}"
    },
    "color-state-success-fg": {
      "$type": "color",
      "$value": "{color-green-500}"
    },
    "color-state-success-fg-soft": {
      "$type": "color",
      "$value": "{color-green-400}"
    },
    "color-state-success-glow": {
      "$type": "color",
      "$value": "{color-green-glow}"
    },
    "color-state-warning-bg": {
      "$type": "color",
      "$value": "{color-yellow-1100}"
    },
    "color-state-warning-fg": {
      "$type": "color",
      "$value": "{color-yellow-700}"
    },
    "color-state-warning-fg-soft": {
      "$type": "color",
      "$value": "{color-yellow-500}"
    },
    "color-state-warning-glow": {
      "$type": "color",
      "$value": "{color-yellow-glow}"
    },
    "color-text-brand": {
      "$type": "color",
      "$value": "{color-lime-500}"
    },
    "color-text-danger": {
      "$type": "color",
      "$value": "{color-red-600}"
    },
    "color-text-disabled": {
      "$type": "color",
      "$value": "{color-cool-100}"
    },
    "color-text-info": {
      "$type": "color",
      "$value": "{color-blue-400}"
    },
    "color-text-inverse": {
      "$type": "color",
      "$value": "{color-grey-550}"
    },
    "color-text-link": {
      "$type": "color",
      "$value": "{color-lime-500}"
    },
    "color-text-on-overlay-secondary": {
      "$type": "color",
      "$value": "{color-transparent-light-50}"
    },
    "color-text-on-overlay-tertiary": {
      "$type": "color",
      "$value": "{color-transparent-light-30}"
    },
    "color-text-primary": {
      "$type": "color",
      "$value": "{color-grey-050}"
    },
    "color-text-secondary": {
      "$type": "color",
      "$value": "{color-grey-300}"
    },
    "color-text-success": {
      "$type": "color",
      "$value": "{color-green-500}"
    },
    "color-text-tertiary": {
      "$type": "color",
      "$value": "{color-grey-325}"
    },
    "color-text-warning": {
      "$type": "color",
      "$value": "{color-yellow-700}"
    },
    "color-transparent-lime-05": {
      "$type": "color",
      "$value": "{color-lime-alpha-05}"
    },
    "color-transparent-lime-10": {
      "$type": "color",
      "$value": "{color-lime-alpha-10}"
    },
    "color-transparent-lime-100": {
      "$type": "color",
      "$value": "{color-lime-alpha-100}"
    },
    "color-transparent-lime-15": {
      "$type": "color",
      "$value": "{color-lime-alpha-15}"
    },
    "color-transparent-lime-20": {
      "$type": "color",
      "$value": "{color-lime-alpha-20}"
    },
    "color-transparent-lime-30": {
      "$type": "color",
      "$value": "{color-lime-alpha-30}"
    },
    "color-transparent-lime-40": {
      "$type": "color",
      "$value": "{color-lime-alpha-40}"
    },
    "color-transparent-lime-50": {
      "$type": "color",
      "$value": "{color-lime-alpha-50}"
    },
    "color-transparent-lime-60": {
      "$type": "color",
      "$value": "{color-lime-alpha-60}"
    },
    "color-transparent-lime-70": {
      "$type": "color",
      "$value": "{color-lime-alpha-70}"
    },
    "color-transparent-lime-80": {
      "$type": "color",
      "$value": "{color-lime-alpha-80}"
    },
    "color-transparent-lime-90": {
      "$type": "color",
      "$value": "{color-lime-alpha-90}"
    },
    "color-transparent-pink-05": {
      "$type": "color",
      "$value": "{color-pink-alpha-05}"
    },
    "color-transparent-pink-10": {
      "$type": "color",
      "$value": "{color-pink-alpha-10}"
    },
    "color-transparent-pink-100": {
      "$type": "color",
      "$value": "{color-pink-alpha-100}"
    },
    "color-transparent-pink-15": {
      "$type": "color",
      "$value": "{color-pink-alpha-15}"
    },
    "color-transparent-pink-20": {
      "$type": "color",
      "$value": "{color-pink-alpha-20}"
    },
    "color-transparent-pink-30": {
      "$type": "color",
      "$value": "{color-pink-alpha-30}"
    },
    "color-transparent-pink-40": {
      "$type": "color",
      "$value": "{color-pink-alpha-40}"
    },
    "color-transparent-pink-50": {
      "$type": "color",
      "$value": "{color-pink-alpha-50}"
    },
    "color-transparent-pink-60": {
      "$type": "color",
      "$value": "{color-pink-alpha-60}"
    },
    "color-transparent-pink-70": {
      "$type": "color",
      "$value": "{color-pink-alpha-70}"
    },
    "color-transparent-pink-80": {
      "$type": "color",
      "$value": "{color-pink-alpha-80}"
    },
    "color-transparent-pink-90": {
      "$type": "color",
      "$value": "{color-pink-alpha-90}"
    },
    "type-family-grotesk": {
      "$type": "fontFamily",
      "$value": "var(--mantis-type-family-grotesk-base),sans-serif"
    },
    "type-family-mono": {
      "$type": "fontFamily",
      "$value": "var(--mantis-type-family-mono-base),ui-monospace,monospace"
    },
    "type-family-primary": {
      "$type": "fontFamily",
      "$value": "var(--mantis-type-family-primary-base),system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif"
    },
    "type-family-secondary": {
      "$type": "fontFamily",
      "$value": "var(--mantis-type-family-secondary-base),system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif"
    },
    "type-size-050": {
      "$type": "dimension",
      "$value": ".625rem"
    },
    "type-size-100": {
      "$type": "dimension",
      "$value": ".75rem"
    },
    "type-size-200": {
      "$type": "dimension",
      "$value": ".875rem"
    },
    "type-size-300": {
      "$type": "dimension",
      "$value": "1rem"
    },
    "type-size-400": {
      "$type": "dimension",
      "$value": "1rem"
    },
    "type-size-500": {
      "$type": "dimension",
      "$value": "1.125rem"
    },
    "type-size-600": {
      "$type": "dimension",
      "$value": "1.25rem"
    },
    "type-size-700": {
      "$type": "dimension",
      "$value": "1.5rem"
    },
    "type-size-800": {
      "$type": "dimension",
      "$value": "1.75rem"
    },
    "type-size-900": {
      "$type": "dimension",
      "$value": "1.875rem"
    },
    "type-size-1000": {
      "$type": "dimension",
      "$value": "2rem"
    },
    "type-size-1100": {
      "$type": "dimension",
      "$value": "2.25rem"
    },
    "type-size-1200": {
      "$type": "dimension",
      "$value": "2.5rem"
    },
    "type-size-1300": {
      "$type": "dimension",
      "$value": "3rem"
    },
    "type-size-1400": {
      "$type": "dimension",
      "$value": "3.5rem"
    },
    "type-line-height-100": {
      "$type": "dimension",
      "$value": ".75rem"
    },
    "type-line-height-200": {
      "$type": "dimension",
      "$value": ".875rem"
    },
    "type-line-height-300": {
      "$type": "dimension",
      "$value": "1rem"
    },
    "type-line-height-400": {
      "$type": "dimension",
      "$value": "1rem"
    },
    "type-line-height-500": {
      "$type": "dimension",
      "$value": "1.125rem"
    },
    "type-line-height-600": {
      "$type": "dimension",
      "$value": "1.25rem"
    },
    "type-line-height-700": {
      "$type": "dimension",
      "$value": "1.5rem"
    },
    "type-line-height-800": {
      "$type": "dimension",
      "$value": "1.75rem"
    },
    "type-line-height-900": {
      "$type": "dimension",
      "$value": "1.875rem"
    },
    "type-line-height-1000": {
      "$type": "dimension",
      "$value": "2rem"
    },
    "type-line-height-1100": {
      "$type": "dimension",
      "$value": "2.25rem"
    },
    "type-line-height-1200": {
      "$type": "dimension",
      "$value": "2.5rem"
    },
    "type-line-height-1300": {
      "$type": "dimension",
      "$value": "3rem"
    },
    "type-line-height-1400": {
      "$type": "dimension",
      "$value": "3.5rem"
    },
    "font-inter": {
      "$type": "fontFamily",
      "$value": "\"Inter\", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif"
    },
    "font-lato": {
      "$type": "fontFamily",
      "$value": "\"Lato\", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif"
    },
    "font-space-grotesk": {
      "$type": "fontFamily",
      "$value": "\"Space Grotesk\", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif"
    },
    "font-instrument-serif": {
      "$type": "fontFamily",
      "$value": "\"Instrument Serif\", ui-serif, Georgia, serif"
    },
    "font-space-mono": {
      "$type": "fontFamily",
      "$value": "\"Space Mono\", ui-monospace, SFMono-Regular, monospace"
    },
    "font-doto": {
      "$type": "fontFamily",
      "$value": "\"Doto\", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif"
    },
    "font-caveat": {
      "$type": "fontFamily",
      "$value": "\"Caveat\", ui-serif, cursive"
    },
    "font-eb-garamond": {
      "$type": "fontFamily",
      "$value": "\"EB Garamond\", ui-serif, Georgia, serif"
    },
    "font-dm-sans": {
      "$type": "fontFamily",
      "$value": "\"DM Sans\", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif"
    },
    "font-geist-mono": {
      "$type": "fontFamily",
      "$value": "\"Geist Mono\", ui-monospace, SFMono-Regular, monospace"
    },
    "font-ibm-plex-mono": {
      "$type": "fontFamily",
      "$value": "\"IBM Plex Mono\", ui-monospace, SFMono-Regular, monospace"
    },
    "font-pangolin": {
      "$type": "fontFamily",
      "$value": "\"Pangolin\", ui-serif, cursive"
    },
    "font-jersey-10": {
      "$type": "fontFamily",
      "$value": "\"Jersey 10\", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif"
    },
    "font-jetbrains-mono": {
      "$type": "fontFamily",
      "$value": "\"JetBrains Mono\", ui-monospace, SFMono-Regular, monospace"
    },
    "font-source-serif": {
      "$type": "fontFamily",
      "$value": "\"Source Serif 4\", ui-serif, Georgia, serif"
    },
    "font-sn-pro": {
      "$type": "fontFamily",
      "$value": "\"SN Pro\", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif"
    },
    "legacy-color-gray-1": {
      "$type": "color",
      "$value": "#f7f7f8"
    },
    "legacy-color-gray-2": {
      "$type": "color",
      "$value": "#e9eaec"
    },
    "legacy-color-gray-3": {
      "$type": "color",
      "$value": "#dee0e3"
    },
    "legacy-color-gray-4": {
      "$type": "color",
      "$value": "#c8cad0"
    },
    "legacy-color-gray-5": {
      "$type": "color",
      "$value": "#babdc5"
    },
    "legacy-color-gray-6": {
      "$type": "color",
      "$value": "#9ea2ad"
    },
    "legacy-color-gray-7": {
      "$type": "color",
      "$value": "#7e869a"
    },
    "legacy-color-gray-8": {
      "$type": "color",
      "$value": "#717684"
    },
    "legacy-color-gray-9": {
      "$type": "color",
      "$value": "#5e636e"
    },
    "legacy-color-gray-10": {
      "$type": "color",
      "$value": "#464a53"
    },
    "legacy-color-gray-11": {
      "$type": "color",
      "$value": "#333333"
    },
    "legacy-color-gray-12": {
      "$type": "color",
      "$value": "#1f2228"
    },
    "legacy-color-gray-13": {
      "$type": "color",
      "$value": "#14151a"
    },
    "legacy-color-text-primary": {
      "$type": "color",
      "$value": "{legacy-color-gray-1}"
    },
    "legacy-color-text-primary-inverted": {
      "$type": "color",
      "$value": "{legacy-color-gray-13}"
    },
    "legacy-color-page-primary": {
      "$type": "color",
      "$value": "#131517"
    },
    "legacy-color-btn-accent-text": {
      "$type": "color",
      "$value": "#131517"
    },
    "legacy-color-font-secondary": {
      "$type": "color",
      "$value": "#898a8b"
    },
    "legacy-color-font-disabled": {
      "$type": "color",
      "$value": "#737475"
    },
    "legacy-color-surface-primary": {
      "$type": "color",
      "$value": "#1c1e20"
    },
    "legacy-color-surface-secondary": {
      "$type": "color",
      "$value": "#23262a"
    },
    "legacy-color-surface-tertiary": {
      "$type": "color",
      "$value": "#0f1113"
    },
    "legacy-color-button-primary": {
      "$type": "color",
      "$value": "#181c1d"
    },
    "legacy-color-button-secondary": {
      "$type": "color",
      "$value": "#2e3031"
    },
    "legacy-color-separator-card": {
      "$type": "color",
      "$value": "#d9d9d90a"
    },
    "color-lime-alpha-08": {
      "$type": "color",
      "$value": "#d1fe1714"
    },
    "color-commerce-pink": {
      "$type": "color",
      "$value": "#ed1572"
    },
    "color-commerce-pink-aa": {
      "$type": "color",
      "$value": "#e5126d"
    },
    "color-commerce-blue": {
      "$type": "color",
      "$value": "#1544ed"
    }
  },
  shadcn: {
    background: 'var(--ground-base)',
    foreground: 'var(--text-primary)',
    card: 'var(--surface-card)',
    'card-foreground': 'var(--text-primary)',
    popover: 'var(--ground-raised)',
    'popover-foreground': 'var(--text-primary)',
    // The reference's everyday primary button is white; lime marks the one main
    // call to action on a screen (the separate 'brand' variant).
    primary: 'var(--mantis-color-button-primary)',
    'primary-foreground': 'var(--mantis-legacy-color-btn-accent-text)',
    secondary: 'var(--surface-inset)',
    'secondary-foreground': 'var(--text-primary)',
    // shadcn's --accent is the neutral hover fill, NOT the brand accent.
    accent: 'var(--surface-inset)',
    'accent-foreground': 'var(--text-primary)',
    muted: 'var(--surface-inset)',
    'muted-foreground': 'var(--text-secondary)',
    destructive: 'var(--status-destructive)',
    'destructive-foreground': 'var(--ground-base)',
    // Button roles measured live (2026-10-01).
    brand: 'var(--accent-base)',
    'brand-foreground': 'var(--mantis-color-button-label-brand)',
    'brand-text': 'var(--accent-text)',
    'brand-tint': 'var(--mantis-color-lime-alpha-08)',
    'brand-tint-foreground': 'var(--accent-text)',
    'brand-gloss': 'var(--mantis-gradient-brand-gloss)',
    glass: 'var(--mantis-color-border-subtle)',
    'glass-border': 'var(--mantis-color-border-default)',
    'glass-foreground': 'var(--mantis-color-text-primary)',
    // Hover fill on glass controls: white 8%, one step up from glass (5%).
    'glass-hover': 'var(--mantis-legacy-color-divider-primary)',
    soft: 'var(--surface-card)',
    'soft-foreground': 'var(--text-secondary)',
    // WCAG 2.1 AA (owner-approved 2026-10-01): white on the source pink #ed1572 is 4.24:1; #e5126d is 4.53:1.
    'commerce-pink': 'var(--mantis-color-commerce-pink-aa)',
    'commerce-pink-foreground': 'var(--mantis-color-text-primary)',
    'commerce-blue': 'var(--mantis-color-commerce-blue)',
    'commerce-blue-foreground': 'var(--mantis-color-text-primary)',
    // Badge roles measured live (2026-10-01). WCAG-adjusted fills noted in source.
    'badge-new': 'var(--mantis-color-lime-alpha-20)',
    'badge-new-foreground': 'var(--accent-text)',
    'badge-neutral': 'var(--mantis-color-border-strong)',
    'badge-neutral-foreground': 'var(--mantis-color-text-primary)',
    sale: 'var(--mantis-color-sale-pink-aa)',
    'sale-foreground': 'var(--mantis-color-text-primary)',
    'badge-hot': 'var(--mantis-gradient-badge-hot-aa)',
    'badge-value': 'var(--mantis-gradient-badge-value-aa)',
    'text-gold': 'var(--mantis-gradient-text-gold-aa)',
    'text-fade': 'var(--mantis-gradient-text-fade)',
    // Overlay and control roles measured live (2026-10-01).
    tooltip: 'var(--mantis-color-tooltip-bg)',
    'tooltip-foreground': 'var(--mantis-color-text-primary)',
    'tooltip-border': 'var(--mantis-color-tooltip-border)',
    listbox: 'var(--mantis-color-listbox-bg)',
    'listbox-border': 'var(--mantis-color-lime-alpha-05)',
    'glass-panel': 'var(--mantis-color-glass-panel)',
    'glass-panel-light': 'var(--mantis-color-glass-panel-light)',
    separator: 'var(--mantis-legacy-color-separator-card)',
    'switch-off': 'var(--mantis-color-switch-off)',
    field: 'var(--mantis-color-border-subtle)',
    // Composer setting chip (select trigger) and menu divider, measured live.
    chip: 'var(--mantis-color-chip-bg)',
    'chip-foreground': 'var(--mantis-color-transparent-light-60)',
    'chip-border': 'var(--mantis-color-lime-alpha-05)',
    divider: 'var(--mantis-legacy-color-divider-primary)',
    // Skeleton (source .skeleton) and keyboard key (measured live).
    skeleton: 'var(--mantis-color-skeleton-bg)',
    'skeleton-shimmer': 'var(--mantis-gradient-skeleton-shimmer)',
    kbd: 'var(--mantis-color-border-subtle)',
    'kbd-foreground': 'var(--mantis-color-transparent-light-50)',
    // Source .dialog and .dialog-overlay definitions.
    dialog: 'var(--mantis-legacy-color-page-primary)',
    overlay: 'var(--mantis-legacy-color-page-overlay)',
    // Icon tiles: the source's own palette pairs (fill + icon color).
    'tile-blue': 'var(--mantis-color-palette-blue-bg)',
    'tile-blue-foreground': 'var(--mantis-color-palette-blue-text)',
    'tile-purple': 'var(--mantis-color-palette-purple-bg)',
    'tile-purple-foreground': 'var(--mantis-color-palette-purple-text)',
    'tile-pink': 'var(--mantis-color-palette-pink-bg)',
    'tile-pink-foreground': 'var(--mantis-color-palette-pink-text)',
    'tile-orange': 'var(--mantis-color-palette-orange-bg)',
    'tile-orange-foreground': 'var(--mantis-color-palette-orange-text)',
    'tile-mint': 'var(--mantis-color-palette-mint-bg)',
    'tile-mint-foreground': 'var(--mantis-color-palette-mint-text)',
    'tile-brown': 'var(--mantis-color-palette-brown-bg)',
    'tile-brown-foreground': 'var(--mantis-color-palette-brown-text)',
    // Success (added 2026-10-02): text and icons, a dark label for a filled
    // success badge, and a deep green tint behind success banners.
    success: 'var(--status-success)',
    'success-foreground': 'var(--ground-base)',
    'success-tint': 'var(--mantis-color-state-success-bg)',
    // Chart series (added 2026-10-02), shadcn's own --chart-N names, picked
    // from the source palette: five distinct hues, each >= 3:1 on card and page.
    'chart-1': 'var(--mantis-color-lime-500)',
    'chart-2': 'var(--mantis-color-blue-400)',
    'chart-3': 'var(--mantis-color-pink-400)',
    'chart-4': 'var(--mantis-color-orange-500)',
    'chart-5': 'var(--mantis-color-purple-400)',
    border: 'var(--line-base)',
    input: 'var(--line-control)',
    ring: 'var(--accent-text)',
  },
}
