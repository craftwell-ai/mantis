// Compiles real utilities with the project's Tailwind, once against Tailwind's stock theme and
// once with Mantis's theme on top, and checks two things for each class: the CSS an inspector
// shows reads a Mantis variable, and every value still computes to the same pixels as stock
// Tailwind. That is the promise of the spacing, border, weight and line-height wiring in
// tokens/mantis.tokens.mjs: Mantis becomes the source of every value, with no visual change.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
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
    for (const m of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) if (!map.has(m[1]) || m[2].includes('mantis')) map.set(m[1], m[2].trim())
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
      const plain = expr.replace(/px/g, '')
      if (!/^[\d\s.+\-*/]+$/.test(plain)) return all
      return `${Math.round(Function(`return (${plain})`)() * 1000) / 1000}px`
    })
    if (next === v) break
    v = next
  }
  return v.replace(/(^|[\s(,])\.(\d)/g, '$10.$2').replace(/(^|\s)0px\b/g, '$10').replace(/\s+/g, ' ').trim()
}

// The declarations of one class's rule, as written and as computed.
function rule(css, cls) {
  const selector = '.' + cls.replace(/[.]/g, '\\.')
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
