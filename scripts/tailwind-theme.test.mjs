// Compiles real utilities with the project's Tailwind, once against Tailwind's stock theme and
// once with Mantis's theme on top, and checks two things for each class: the CSS an inspector
// shows reads a Mantis variable, and every value still computes to the same pixels as stock
// Tailwind. That is the promise of the spacing, border, weight and line-height wiring in
// tokens/mantis.tokens.mjs: Mantis becomes the source of every value, with no visual change.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { compile } from 'tailwindcss'

const require = createRequire(import.meta.url)
const THEME_PATH = new URL('../registry/mantis-theme.css', import.meta.url)
const STOCK_THEME = require.resolve('tailwindcss/theme.css')

async function build(withMantis, classes) {
  const input = ['@import "tailwindcss/theme.css" layer(theme);', '@import "tailwindcss/utilities.css" layer(utilities);', withMantis ? readFileSync(THEME_PATH, 'utf8') : ''].join('\n')
  const compiler = await compile(input, {
    base: process.cwd(),
    loadStylesheet: async (id) => {
      const path = require.resolve(id)
      return { path, base: dirname(path), content: readFileSync(path, 'utf8') }
    },
  })
  return compiler.build(classes)
}

// Every custom property a value might read: Tailwind's stock theme and Mantis's source layer.
function variables() {
  const map = new Map()
  for (const css of [readFileSync(STOCK_THEME, 'utf8'), readFileSync(THEME_PATH, 'utf8')]) {
    for (const m of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
      if (m[2].trim() === `var(${m[1]})`) continue // @theme inline key pointing at its runtime variable
      if (!map.has(m[1]) || m[2].includes('mantis')) map.set(m[1], m[2].trim())
    }
  }
  // The source layer's own values win over stock names that Mantis also defines.
  for (const m of readFileSync(THEME_PATH, 'utf8').matchAll(/(--mantis-[\w-]+):\s*([^;]+);/g)) map.set(m[1], m[2].trim())
  return map
}
const VARS = variables()

// var() replaced by its value, rem turned into px at 16px, and every calc() of plain numbers evaluated.
function computed(value) {
  let v = value
  for (let i = 0; i < 20; i++) {
    const next = v.replace(/var\((--[\w-]+)(?:,\s*([^()]*))?\)/g, (all, name, fallback) => VARS.get(name) ?? fallback ?? all)
    if (next === v) break
    v = next
  }
  v = v.replace(/(-?\d*\.?\d+)rem\b/g, (_, n) => `${Number(n) * 16}px`)
  for (let i = 0; i < 20; i++) {
    const next = v.replace(/calc\(([^()]*)\)/g, (all, expr) => {
      const plain = expr.replace(/px|%/g, '')
      if (!/^[\d\s.+\-*/]+$/.test(plain)) return all
      return `${Math.round(Function(`return (${plain})`)() * 1000) / 1000}${expr.includes('%') ? '%' : 'px'}`
    })
    if (next === v) break
    v = next
  }
  return v.replace(/(^|[\s(,])\.(\d)/g, '$10.$2').replace(/(^|\s)0px\b/g, '$10').replace(/\s+/g, ' ').trim()
}

// The declarations of one class's rule, as written and as computed.
function rule(css, cls) {
  const selector = '.' + cls.replace(/[./]/g, '\\$&')
  const start = css.indexOf(`${selector} {`)
  assert.notEqual(start, -1, `${cls} generated no rule`)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start))
  const decls = body.split(';').map((d) => d.trim()).filter(Boolean).map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()])
  return { written: decls.map(([p, v]) => `${p}: ${v}`).join('; '), computed: decls.map(([p, v]) => `${p}: ${computed(v)}`).join('; ') }
}

const ON_SCALE = [
  'p-4', 'px-2.5', 'gap-2', 'mt-6', '-mt-4', 'p-0.5', 'w-6', 'size-4', 'inset-1.5', 'translate-x-3', 'max-w-24', 'scroll-mt-8',
  'border', 'border-2', 'border-0', 'border-t-2', 'ring', 'ring-2', 'outline', 'outline-2',
  'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-black',
  'leading-3', 'leading-3.5', 'leading-4', 'leading-4.5', 'leading-5', 'leading-6', 'leading-7.5', 'leading-14',
]
// Off the Mantis scale: no named key, so they read the Mantis 4px unit (spacing) or stay Tailwind's (border).
const OFF_SCALE = ['w-105', 'p-13', 'px-3.5', 'h-9', '-top-1']

test('every on-scale utility reads a Mantis variable and keeps its stock pixels', async () => {
  const classes = [...ON_SCALE, ...OFF_SCALE]
  const [stock, mantis] = await Promise.all([build(false, classes), build(true, classes)])
  for (const cls of classes) {
    const before = rule(stock, cls)
    const after = rule(mantis, cls)
    assert.equal(after.computed, before.computed, `${cls} changed size: ${before.computed} → ${after.computed}`)
    if (ON_SCALE.includes(cls)) assert.match(after.written, /var\(--mantis-(space|border-width|type-weight|type-line-height)-/, `${cls} does not read a Mantis token: ${after.written}`)
  }
})

test('off-scale spacing steps read the Mantis 4px unit, never Tailwind\'s --spacing', async () => {
  const css = await build(true, OFF_SCALE)
  for (const cls of OFF_SCALE) {
    const { written } = rule(css, cls)
    assert.match(written, /calc\(var\(--mantis-space-100\) \* -?[\d.]+\)/, `${cls}: ${written}`)
    assert.doesNotMatch(written, /var\(--spacing\)/, `${cls} still reads Tailwind's own --spacing`)
  }
})

test('Mantis adds the hairline and medium widths Tailwind has no class for', async () => {
  const css = await build(true, ['border-0.5', 'border-x-1.5', 'ring-0.5', 'outline-1.5'])
  assert.equal(rule(css, 'border-0.5').computed, 'border-style: var(--tw-border-style); border-width: 0.5px')
  assert.equal(rule(css, 'border-x-1.5').computed, 'border-inline-style: var(--tw-border-style); border-inline-width: 1.5px')
  assert.match(rule(css, 'ring-0.5').written, /var\(--mantis-border-width-hairline\)/)
  assert.match(rule(css, 'outline-1.5').written, /var\(--mantis-border-width-medium\)/)
})

test('step 0 stays Tailwind\'s literal 0px, so -top-0 computes to 0 rather than auto', async () => {
  // The source's space-0 is a bare 0; inside calc(… * -1) that is a number, and `top` would fall back to auto.
  const css = await build(true, ['p-0', '-top-0'])
  assert.equal(rule(css, 'p-0').written, 'padding: 0px')
  assert.doesNotMatch(rule(css, '-top-0').written, /--mantis-space-0\)/)
})

test('border widths Mantis does not have are left to Tailwind (mantis-check flags them)', async () => {
  const css = await build(true, ['border-3', 'border-4'])
  assert.match(rule(css, 'border-3').written, /border-width: 3px/)
  assert.match(rule(css, 'border-4').written, /border-width: 4px/)
})

test('size tokens: the inspector shows the token, the pixels match the old step, and names stay out of spacing', async () => {
  const pairs = { 'h-control': 'h-9', 'size-control-sm': 'size-8', 'min-w-control-lg': 'min-w-10', 'h-control-cta': 'h-13', 'h-tap': 'h-11', 'size-icon-sm': 'size-3.5', 'size-icon-lg': 'size-4.5', 'size-icon-3xs': 'size-2', 'w-icon-md': 'w-4' }
  const css = await build(true, [...Object.keys(pairs), ...Object.values(pairs), 'p-control', 'gap-icon-sm', 'm-tap'])
  for (const [token, step] of Object.entries(pairs)) {
    const named = rule(css, token)
    assert.match(named.written, /var\(--size-/, `${token}: ${named.written}`)
    assert.equal(named.computed, rule(css, step).computed, `${token} is not the same size as ${step}`)
  }
  for (const leak of ['p-control', 'gap-icon-sm', 'm-tap']) assert.equal(css.indexOf(`.${leak} {`), -1, `${leak} must not exist`)
})

test('every named width, height or size class in the source has CSS, so a misspelt token (h-contrl) cannot ship', async () => {
  // A named class Tailwind cannot resolve produces no CSS and no error: the element just loses its size.
  const dirs = ['components/ui', 'components/home', 'registry', 'stories', 'app']
  const used = new Map()
  for (const dir of dirs) {
    for (const name of readdirSync(new URL(`../${dir}`, import.meta.url))) {
      if (!name.endsWith('.tsx')) continue
      const text = readFileSync(new URL(`../${dir}/${name}`, import.meta.url), 'utf8')
      for (const m of text.matchAll(/(?<=^|[\s"'`:])((?:min-|max-)?[wh]|size)-([a-z][a-z0-9-]*)(?=[\s"'`!]|$)/gm)) {
        if (/\bid=["']$/.test(text.slice(0, m.index))) continue // a usage rule id such as id="size-to-the-answer"
        if (!used.has(m[0])) used.set(m[0], `${dir}/${name}`)
      }
    }
  }
  assert.ok(used.has('h-control') && used.has('size-icon-md'), 'the scan found no size tokens; check its pattern')
  const css = await build(true, [...used.keys()])
  const missing = [...used].filter(([cls]) => !css.includes(`.${cls} {`)).map(([cls, file]) => `${cls} (${file})`)
  assert.deepEqual(missing, [])
})

test('opacity tokens: the inspector shows the token, the value matches the stock step, and colour transparency is untouched', async () => {
  const pairs = { 'opacity-disabled': 'opacity-50', 'opacity-muted': 'opacity-40', 'opacity-scrim': 'opacity-30' }
  const colours = { 'bg-brand/50': 'var(--brand) 50%', 'text-foreground/50': 'var(--foreground) 50%', 'ring-ring/50': 'var(--ring) 50%', 'bg-brand/40': 'var(--brand) 40%' }
  const classes = [...Object.keys(pairs), ...Object.values(pairs), ...Object.keys(colours)]
  const [stock, mantis] = await Promise.all([build(false, classes), build(true, classes)])
  for (const [token, step] of Object.entries(pairs)) {
    const named = rule(mantis, token)
    assert.match(named.written, /^opacity: var\(--opacity-/, `${token}: ${named.written}`)
    assert.equal(named.computed, rule(stock, step).computed, `${token} is not the same as ${step}`)
  }
  // Tailwind reads --opacity-* for colour transparency too; a bare .5 there would be invalid CSS.
  for (const [cls, mix] of Object.entries(colours)) assert.ok(rule(mantis, cls).written.includes(`color-mix(in oklab, ${mix}, transparent)`), `${cls}: ${rule(mantis, cls).written}`)
})

test('every named opacity, layer, duration and ease class in the source has CSS, so a misspelt token cannot ship', async () => {
  const dirs = ['components/ui', 'components/home', 'registry', 'stories', 'app']
  const used = new Map()
  for (const dir of dirs) {
    for (const name of readdirSync(new URL(`../${dir}`, import.meta.url))) {
      if (!name.endsWith('.tsx')) continue
      const text = readFileSync(new URL(`../${dir}/${name}`, import.meta.url), 'utf8')
      for (const m of text.matchAll(/(?<=^|[\s"'`:])-?(opacity|z|duration|ease)-([a-z][a-z0-9-]*)(?=[\s"'`!]|$)/gm)) {
        if (/\bid=["']$/.test(text.slice(0, m.index))) continue
        if (!used.has(m[0])) used.set(m[0], `${dir}/${name}`)
      }
    }
  }
  assert.ok(used.has('ease-in-out'), 'the scan found nothing; check its pattern')
  const css = await build(true, [...used.keys()])
  const missing = [...used].filter(([cls]) => !css.includes(`.${cls} {`)).map(([cls, file]) => `${cls} (${file})`)
  assert.deepEqual(missing, [])
})

test('layer tokens: the inspector shows the token and the layer matches the stock step, negatives included', async () => {
  const pairs = { 'z-raised': 'z-10', 'z-sticky': 'z-20', 'z-floating': 'z-50', '-z-raised': '-z-10' }
  const classes = [...Object.keys(pairs), ...Object.values(pairs)]
  const [stock, mantis] = await Promise.all([build(false, classes), build(true, classes)])
  for (const [token, step] of Object.entries(pairs)) {
    const named = rule(mantis, token)
    assert.match(named.written, /var\(--z-/, `${token}: ${named.written}`)
    assert.equal(named.computed, rule(stock, step).computed, `${token} is not the same layer as ${step}`)
  }
})

test('container widths: Mantis defines each one at Tailwind\'s pixels, and container queries still compile', async () => {
  const keys = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl']
  const theme = readFileSync(THEME_PATH, 'utf8')
  const stockTheme = readFileSync(STOCK_THEME, 'utf8')
  const px = (v) => (v.endsWith('rem') ? parseFloat(v) * 16 : parseFloat(v))
  for (const key of keys) {
    // A literal, in a plain @theme block: a container query cannot read a CSS variable.
    const mantis = theme.match(new RegExp(`^@theme \\{[^}]*--container-${key}: ([^;]+);`, 'm'))?.[1]
    const stock = stockTheme.match(new RegExp(`--container-${key}: ([^;]+);`))[1]
    assert.ok(mantis, `the theme does not define --container-${key}`)
    assert.equal(px(mantis), px(stock), `--container-${key}`)
  }
  const classes = ['@md:flex', '@2xl:grid-cols-2', '@sm:max-w-md', ...keys.map((k) => `max-w-${k}`)]
  const [stock, mantis] = await Promise.all([build(false, classes), build(true, classes)])
  assert.deepEqual(mantis.match(/@container[^{]*/g), stock.match(/@container[^{]*/g))
  for (const key of keys) assert.equal(rule(mantis, `max-w-${key}`).written, `max-width: var(--container-${key})`)
})

test('motion: duration and ease utilities, and the bare transition, read Mantis motion at the same timing', async () => {
  const ms = (v) => (/ms$/.test(v) ? parseFloat(v) : parseFloat(v) * 1000)
  const theme = readFileSync(THEME_PATH, 'utf8')
  const value = (name) => theme.match(new RegExp(`${name}:\\s*([^;]+);`))[1].trim()
  const classes = ['duration-normal', 'duration-fast', 'duration-quick', 'duration-slow', 'duration-200', 'duration-150', 'duration-0', 'duration-75', 'ease-in', 'ease-out', 'ease-in-out', 'transition', 'transition-colors']
  const css = await build(true, classes)
  for (const name of ['normal', 'fast', 'quick', 'slow']) assert.match(rule(css, `duration-${name}`).written, new RegExp(`transition-duration: var\\(--duration-${name}\\)`))
  // a numeric step with a source token reads it, at the same timing
  for (const [cls, token, expected] of [['duration-200', 'normal', 200], ['duration-150', '150', 150], ['duration-0', 'instant', 0]]) {
    assert.match(rule(css, cls).written, new RegExp(`var\\(--mantis-duration-${token}\\)`), cls)
    assert.equal(ms(value(`--mantis-duration-${token}`)), expected, cls)
  }
  assert.match(rule(css, 'duration-75').written, /transition-duration: 75ms/)
  // the source curves equal Tailwind's stock ones, so ease-in/out/in-out can read them
  const stock = readFileSync(STOCK_THEME, 'utf8')
  for (const curve of ['in', 'out', 'in-out']) {
    assert.match(rule(css, `ease-${curve}`).written, new RegExp(`var\\(--mantis-ease-${curve}\\)`))
    assert.equal(value(`--mantis-ease-${curve}`), stock.match(new RegExp(`--ease-${curve}: ([^;]+);`))[1])
  }
  for (const cls of ['transition', 'transition-colors']) {
    assert.match(rule(css, cls).written, /transition-duration: var\(--tw-duration, var\(--mantis-duration-150\)\)/, cls)
    assert.match(rule(css, cls).written, /transition-timing-function: var\(--tw-ease, var\(--mantis-ease-in-out\)\)/, cls)
  }
})

test('text sizes take their line height from a Mantis token, at the stock pixels on their own element', async () => {
  // text-2xs had none of its own and took its parent's (owner decision 2026-10-19: give it 14px).
  const expected = { '2xs': 14, xs: 16, sm: 20, base: 24, lg: 28, xl: 28, '2xl': 32, '3xl': 36, '4xl': 40, '5xl': 48, '6xl': 56 }
  const theme = readFileSync(THEME_PATH, 'utf8')
  const value = (name) => theme.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim()
  const px = (v) => (v.endsWith('rem') ? parseFloat(v) * 16 : parseFloat(v))
  for (const [key, linePx] of Object.entries(expected)) {
    const line = value(`--text-${key}--line-height`)
    assert.match(line ?? '', /^var\(--mantis-type-line-height-\d+\)$/, `text-${key}: ${line}`)
    assert.equal(px(value(line.slice(4, -1))), linePx, `text-${key}`)
  }
})
