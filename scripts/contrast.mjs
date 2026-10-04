/**
 * Color math for the token engine: reads hex, rgb(), hsl(), oklch() and oklab() colors;
 * WCAG 2.1 relative luminance/contrast (the formula is identical across 2.0–2.2)
 * and hex<->HSL conversion used by dark-ramp derivation. Zero dependencies by design — this file is copied into every
 * generated client repo.
 */
const expand = (hex) => {
  const h = hex.replace('#', '').trim()
  return h.length === 3 ? h.split('').map((c) => c + c).join('') : h
}

const channels = (hex) => {
  const h = expand(hex)
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
}

const linearize = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

const numberOf = (part, scale = 1) => (part.endsWith('%') ? (parseFloat(part) / 100) * scale : parseFloat(part))
const partsOf = (inner) => inner.replace(/[,/]/g, ' ').split(/\s+/).filter(Boolean)

// OKLab → linear sRGB (Björn Ottosson's published matrices), then the sRGB
// transfer curve. Out-of-gamut channels are clamped, as browsers do for display.
function oklabToRgb(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return linear.map((c) => {
    const v = Math.min(1, Math.max(0, c))
    return Math.round((v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055) * 255)
  })
}

/** Any opaque-or-not CSS color a design source ships → { r, g, b, a }, or null. */
export function parseColor(text) {
  const value = String(text).trim().toLowerCase()
  let match
  if ((match = value.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/))) {
    let hex = match[1]
    if (hex.length <= 4) hex = hex.split('').map((c) => c + c).join('')
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16))
    return { r, g, b, a: hex.length === 8 ? Math.round((parseInt(hex.slice(6), 16) / 255) * 1000) / 1000 : 1 }
  }
  if ((match = value.match(/^rgba?\((.+)\)$/))) {
    const [r, g, b, a = '1'] = partsOf(match[1])
    return { r: Math.round(numberOf(r, 255)), g: Math.round(numberOf(g, 255)), b: Math.round(numberOf(b, 255)), a: numberOf(a) }
  }
  if ((match = value.match(/^hsla?\((.+)\)$/))) {
    const [h, s, l, a = '1'] = partsOf(match[1])
    const hex = hslToHex({ h: parseFloat(h), s: numberOf(s), l: numberOf(l) })
    return { ...parseColor(hex), a: numberOf(a) }
  }
  if ((match = value.match(/^oklch\((.+)\)$/))) {
    const [L, C, H, a = '1'] = partsOf(match[1])
    const hue = (parseFloat(H) * Math.PI) / 180
    const chroma = numberOf(C, 0.4)
    const [r, g, b] = oklabToRgb(numberOf(L), chroma * Math.cos(hue), chroma * Math.sin(hue))
    return { r, g, b, a: numberOf(a) }
  }
  if ((match = value.match(/^oklab\((.+)\)$/))) {
    const [L, A, B, a = '1'] = partsOf(match[1])
    const [r, g, b] = oklabToRgb(numberOf(L), numberOf(A, 0.4), numberOf(B, 0.4))
    return { r, g, b, a: numberOf(a) }
  }
  return null
}

export function toHex(text) {
  const color = parseColor(text)
  if (!color) throw new Error(`toHex: cannot read '${text}' as a color`)
  if (color.a < 1) throw new Error(`toHex: '${text}' is translucent — composite it over its ground first`)
  return '#' + [color.r, color.g, color.b].map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase()
}

// Relative luminance of an OPAQUE color. Translucent or unreadable input
// returns NaN so a contrast assertion fails loudly instead of passing on a
// value it never measured (see CONTRAST_EXEMPT in the token WCAG tests).
export function luminance(color) {
  const parsed = parseColor(color)
  if (!parsed || parsed.a < 1) return NaN
  const [r, g, b] = [parsed.r, parsed.g, parsed.b].map((c) => linearize(c / 255))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(hexA, hexB) {
  const [x, y] = [luminance(hexA) + 0.05, luminance(hexB) + 0.05]
  return Math.max(x, y) / Math.min(x, y)
}

export function hexToHsl(hex) {
  const [r, g, b] = channels(hex)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
  else if (max === g) h = ((b - r) / d + 2) * 60
  else h = ((r - g) / d + 4) * 60
  return { h, s, l }
}

export function hslToHex({ h, s, l }) {
  const f = (n) => {
    const k = (n + h / 30) % 12
    const a = s * Math.min(l, 1 - l)
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(c * 255).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase()
}
