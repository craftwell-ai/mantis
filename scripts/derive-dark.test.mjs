import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contrast, hexToHsl, hslToHex } from './contrast.mjs'
import { deriveDarkGround, deriveDark, deriveDarkRamp } from './derive-dark.mjs'

test('derived dark ground is genuinely dark and hue-related to the light ground', () => {
  const ground = deriveDarkGround('#F5EDDD') // warm cream
  const { l } = hexToHsl(ground)
  assert.ok(l <= 0.16, `dark ground lightness ${l} should be <= 0.16`)
  const hueDelta = Math.abs(hexToHsl(ground).h - hexToHsl('#F5EDDD').h)
  assert.ok(Math.min(hueDelta, 360 - hueDelta) <= 30, 'dark ground drifted off the brand hue')
})

test('derived text color passes 4.5:1 on the derived ground BY CONSTRUCTION', () => {
  for (const light of ['#2A2622', '#525A63', '#8A4530', '#3B6EA8']) {
    const ground = deriveDarkGround('#FAFAF8')
    const dark = deriveDark(light, { ground, minContrast: 4.5 })
    const ratio = contrast(dark, ground)
    assert.ok(ratio >= 4.5, `derived ${dark} from ${light} is only ${ratio.toFixed(2)}:1`)
  }
})

test('derived control border passes 3:1; decorative derives without clamping', () => {
  const ground = deriveDarkGround('#FAFAF8')
  const border = deriveDark('#71787F', { ground, minContrast: 3 })
  assert.ok(contrast(border, ground) >= 3)
  // decorative: no minContrast — result is the plain lightness flip
  const deco = deriveDark('#F0F0EC', { ground })
  assert.equal(typeof deco, 'string')
  assert.match(deco, /^#[0-9A-F]{6}$/)
})

test('hue survives derivation (brand character preserved)', () => {
  const ground = deriveDarkGround('#FAFAF8')
  const dark = deriveDark('#3B6EA8', { ground, minContrast: 4.5 })
  const dHue = Math.abs(hexToHsl(dark).h - hexToHsl('#3B6EA8').h)
  assert.ok(Math.min(dHue, 360 - dHue) <= 12, `hue drifted ${dHue} degrees`)
})

test('deriveDarkRamp fills every {light} leaf without mutating the input', () => {
  const input = {
    ground: { base: { light: '#FAFAF8' } },
    text: { primary: { light: '#23272C' } },
    line: { control: { light: '#71787F' } },
  }
  const snapshot = JSON.stringify(input)
  const out = deriveDarkRamp(input, {
    roleFor: (path) => (path.startsWith('text') ? 4.5 : path === 'line.control' ? 3 : 0),
  })
  assert.equal(JSON.stringify(input), snapshot, 'input was mutated')
  assert.match(out.text.primary.dark, /^#[0-9A-F]{6}$/)
  assert.ok(contrast(out.text.primary.dark, out.ground.base.dark) >= 4.5)
  assert.ok(contrast(out.line.control.dark, out.ground.base.dark) >= 3)
})

test('a pre-supplied dark survives derivation untouched while its siblings are derived', () => {
  // The `v.dark ?? …` branch in deriveDarkRamp is load-bearing in two OPPOSITE
  // directions and had no fixture at all. It is the mechanism that gives a
  // genuinely HARVESTED dark value (rung-3 dual harvest, ingestion.md §6a)
  // precedence over a derived one — and it is equally the reason §6a must strip
  // every template placeholder `dark` BEFORE deriving: a surviving placeholder
  // is preserved just as silently, which is exactly how a client can ship the
  // template's brand in dark mode with a fully green test suite.
  //
  // Preservation is UNCONDITIONAL: an authored value is never re-clamped to its
  // role, so the WCAG-by-construction guarantee covers derived leaves only. The
  // fixture below deliberately uses a value that FAILS 4.5:1 to pin that fact
  // rather than leave it implied.
  const HARVESTED = '#1A1B1E' // near-invisible on a dark ground, on purpose
  const input = {
    ground: { base: { light: '#FAFAF8' } },
    text: { primary: { light: '#23272C', dark: HARVESTED }, secondary: { light: '#525A63' } },
    line: { control: { light: '#71787F' } },
  }
  const snapshot = JSON.stringify(input)
  const roleFor = (path) => (path.startsWith('text.') ? 4.5 : path === 'line.control' ? 3 : 0)
  const out = deriveDarkRamp(input, { roleFor })

  assert.equal(JSON.stringify(input), snapshot, 'input was mutated')
  assert.equal(out.text.primary.dark, HARVESTED, 'a pre-supplied dark must survive derivation byte-for-byte')
  assert.equal(out.text.primary.light, '#23272C', 'the light half of a preserved leaf must be untouched')
  assert.ok(
    contrast(HARVESTED, out.ground.base.dark) < 4.5,
    'fixture no longer fails its role — choose a HARVESTED value that does, or this stops proving preservation beats clamping',
  )

  // Siblings are unaffected: still derived, still compliant by construction.
  assert.match(out.text.secondary.dark, /^#[0-9A-F]{6}$/)
  assert.ok(contrast(out.text.secondary.dark, out.ground.base.dark) >= 4.5)
  assert.ok(contrast(out.line.control.dark, out.ground.base.dark) >= 3)
})

test('a pre-supplied dark GROUND survives too (same ?? branch, isGround arm)', () => {
  // Worth pinning separately: the ground has its own arm behind that `??`.
  //
  // Note the asymmetry this exposes — siblings are always derived against
  // deriveDarkGround(light), NOT against an authored ground. So with an authored
  // ground the siblings are no longer compliant *by construction*. They are
  // still CHECKED, though, and this is the part not to over-scope: the shipped
  // tokens/<name>.tokens.wcag.test.mjs measures every text pair against
  // whatever ground actually sits in the token module, so an authored ground far
  // enough off-target fails loudly rather than silently. Measured, deriving
  // text #23272C from light ground #FAFAF8:
  //   authored #0B0C10 -> 13.54:1  passes
  //   authored #5A5A5A ->  4.78:1  passes (degraded, still above the 4.5 contract)
  //   authored #767676 ->  3.15:1  FAILS the shipped WCAG test
  // The guarantee changes hands from the algorithm to the test; it is not lost.
  // Do not "fix" this by re-targeting derivation without weighing that.
  const AUTHORED = '#0B0C10'
  const out = deriveDarkRamp(
    { ground: { base: { light: '#FAFAF8', dark: AUTHORED } }, text: { primary: { light: '#23272C' } } },
    { roleFor: (path) => (path.startsWith('text.') ? 4.5 : 0) },
  )
  assert.equal(out.ground.base.dark, AUTHORED)
  assert.notEqual(out.text.primary.dark, undefined)
})

test('near-white light values still reach 4.5:1 (regression: flip lands below ground)', () => {
  const ground = deriveDarkGround('#FAFAF8')
  for (const nearWhite of ['#FFFFFF', '#FEFEFE', '#F8F8F5', '#FFFDF0']) {
    const dark = deriveDark(nearWhite, { ground, minContrast: 4.5 })
    const ratio = contrast(dark, ground)
    assert.ok(ratio >= 4.5, `${nearWhite} -> ${dark} is only ${ratio.toFixed(2)}:1 on ${ground}`)
  }
})

test('every hue/saturation/lightness combination reaches its role contrast', () => {
  const ground = deriveDarkGround('#FAFAF8')
  for (let hue = 0; hue < 360; hue += 15) {
    for (const lightness of [0.02, 0.15, 0.35, 0.5, 0.65, 0.85, 0.95, 0.99]) {
      for (const saturation of [0, 0.4, 0.9]) {
        const light = hslToHex({ h: hue, s: saturation, l: lightness })
        for (const min of [3, 4.5]) {
          const dark = deriveDark(light, { ground, minContrast: min })
          const ratio = contrast(dark, ground)
          assert.ok(ratio >= min, `${light} -> ${dark} is ${ratio.toFixed(2)}:1, needed ${min}`)
        }
      }
    }
  }
})

test('an unreachable target throws rather than emitting a non-compliant value', () => {
  // No ground can fail BOTH rails at 4.5:1, so this needs an AAA-level target on a
  // mid-grey ground. Unreachable in production — the engine only ever asks for 3 and
  // 4.5 against a deriveDarkGround ground — but it pins the fail-loud contract.
  assert.throws(
    () => deriveDark('#333333', { ground: '#808080', minContrast: 7 }),
    /cannot reach/,
    'expected a thrown error naming the unreachable target',
  )
})
