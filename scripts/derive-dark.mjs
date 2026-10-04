/**
 * WCAG-constrained dark-ramp derivation (spec §2): hue and character come
 * from the extracted light values; lightness flips and is then clamped until
 * the pair passes its contrast role. A derived ramp can never fail the
 * contract — compliance is a property of the algorithm, not a later check.
 * Alpha (rgba) leaves are passed through untouched; the skill derives those
 * by hand alongside user confirmation.
 */
import { contrast, hexToHsl, hslToHex } from './contrast.mjs'

export function deriveDarkGround(lightGroundHex) {
  const { h, s } = hexToHsl(lightGroundHex)
  return hslToHex({ h, s: Math.min(s, 0.35), l: 0.11 })
}

export function deriveDark(lightHex, { ground, minContrast = 0 }) {
  const { h, s, l } = hexToHsl(lightHex)
  const saturation = s * 0.85
  let lightness = Math.max(0, Math.min(1, 1 - l))
  let hex = hslToHex({ h, s: saturation, l: lightness })
  if (minContrast <= 0) return hex

  // Direction is decided by which rail can actually reach the target, not by which
  // side of the ground the flip landed on: the flip of a near-white value lands BELOW
  // a dark ground, where walking darker only converges with it (both end at black).
  const atWhite = contrast(hslToHex({ h, s: saturation, l: 1 }), ground)
  const atBlack = contrast(hslToHex({ h, s: saturation, l: 0 }), ground)
  const step = atWhite >= atBlack ? 0.01 : -0.01

  while (contrast(hex, ground) < minContrast) {
    const next = lightness + step
    if (next < 0 || next > 1) break
    lightness = next
    hex = hslToHex({ h, s: saturation, l: lightness })
  }

  if (contrast(hex, ground) < minContrast) {
    throw new Error(
      `deriveDark: cannot reach ${minContrast}:1 for ${lightHex} on ground ${ground} ` +
        `(best ${contrast(hex, ground).toFixed(2)}:1) — the ground is too mid-toned for ` +
        `this target. Grounds from deriveDarkGround (lightness 0.11) always have headroom.`,
    )
  }
  return hex
}

export function deriveDarkRamp(colorTree, { roleFor }) {
  const groundLight = colorTree.ground?.base?.light
  if (!groundLight) throw new Error('deriveDarkRamp: colorTree.ground.base.light is required')
  const darkGround = deriveDarkGround(groundLight)
  const walk = (node, path) => {
    const out = {}
    for (const [k, v] of Object.entries(node)) {
      const p = path ? `${path}.${k}` : k
      if (v && typeof v === 'object' && 'light' in v) {
        const isGround = p === 'ground.base'
        const isHex = /^#/.test(v.light)
        out[k] = {
          ...v,
          dark: v.dark ?? (isGround ? darkGround : isHex ? deriveDark(v.light, { ground: darkGround, minContrast: roleFor(p) }) : v.light),
        }
      } else if (v && typeof v === 'object') {
        out[k] = walk(v, p)
      } else out[k] = v
    }
    return out
  }
  return walk(colorTree, '')
}
