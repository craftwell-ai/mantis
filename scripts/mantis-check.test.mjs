import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { CHECK_PATH, checkData, renderCheck } from './build-check.mjs'
import { baseOf, bracketRule, formatText, motionRule, offScaleRule, paletteRule, scanFile, stockRule, styleFindings, cssFindings } from '../registry/check/mantis-check.mjs'

test('the committed check is in sync with the token source (byte equality)', () => {
  assert.ok(existsSync(CHECK_PATH), 'registry/check/mantis-check.mjs does not exist — run node scripts/build-check.mjs')
  assert.equal(readFileSync(CHECK_PATH, 'utf8'), renderCheck(), 'the check is stale — run node scripts/build-check.mjs')
})

test('the check ships as one file with no dependencies', () => {
  const imports = [...readFileSync(CHECK_PATH, 'utf8').matchAll(/^import .* from '([^']+)'/gm)].map((m) => m[1])
  assert.ok(imports.length > 0)
  for (const source of imports) assert.match(source, /^node:/, `the check imports ${source}; an app would have to install it`)
})

test('its data comes from the token source', () => {
  const data = checkData()
  assert.equal(data.swatches.background, '#0f1113')
  assert.equal(data.swatches.brand, '#d1fe17')
  assert.deepEqual(data.durations, { fast: 100, quick: 150, normal: 200, slow: 300 })
  assert.deepEqual(data.blurs, { chip: 8, glass: 12, dialog: 32 })
  assert.equal(data.text.sm, 14)
  assert.equal(data.radius.control, 10)
  assert.deepEqual(Object.keys(data.spacing).sort((a, b) => a - b), ['0.5', '1', '1.5', '2', '2.5', '3', '4', '5', '6', '7', '8', '10', '12', '14', '16', '20', '24'])
  assert.equal(data.spacing['2.5'], 10)
  assert.deepEqual(data.borders, { 0: 0, '0.5': 0.5, 1: 1, '1.5': 1.5, 2: 2 })
  assert.equal(data.weights.semibold, 600)
  assert.equal(data.leading['3.5'], 14)
  assert.ok(data.shadows.includes('md') && data.textStyles.includes('title-sm'))
  assert.ok(data.shipped.includes('pricing-card.tsx'))
})

test('variants are peeled off before a utility is judged', () => {
  assert.equal(baseOf('md:hover:bg-zinc-900'), 'bg-zinc-900')
  assert.equal(baseOf('data-[state=open]:bg-card'), 'bg-card')
  assert.equal(baseOf('!text-white'), 'text-white')
})

test('stock palette classes are findings, token classes are not', () => {
  assert.equal(paletteRule('bg-zinc-900').rule, 'palette')
  assert.match(paletteRule('text-white').fix, /text-foreground/)
  assert.match(paletteRule('border-gray-700/50').fix, /border-border/)
  assert.equal(paletteRule('bg-card'), null)
  assert.equal(paletteRule('text-muted-foreground'), null)
  assert.equal(paletteRule('bg-brand/20'), null)
  // not a color utility at all
  assert.equal(paletteRule('grid-cols-900'), null)
})

test('bracket values: colors and pixels are findings, other sizes are counted', () => {
  assert.match(bracketRule('bg-[#d1fe17]').fix, /bg-brand/)
  // The nearest Mantis step, not the same 13px written as a Tailwind step (w-3.25)
  assert.match(bracketRule('w-[13px]').fix, /^→ w-3 \(12px\), or the component's size prop/)
  assert.match(bracketRule('p-[14px]').fix, /^→ p-3 \(12px\) or p-4 \(16px\)/)
  assert.match(bracketRule('p-[1.25rem]').fix, /^→ p-5 \(20px\)/)
  assert.match(bracketRule('w-[420px]').fix, /no size step above 96px/)
  assert.match(bracketRule('text-[13px]').fix, /text-xs|text-sm/)
  assert.match(bracketRule('rounded-[5px]').fix, /rounded-(sm|md)/)
  assert.equal(bracketRule('w-[calc(100%-2rem)]'), 'layout')
  assert.equal(bracketRule('w-[13px]', { shipped: true }), 'layout')
  assert.equal(bracketRule('w-4'), null)
})

test('numeric durations and stock blur sizes point at the motion tokens', () => {
  assert.match(motionRule('duration-200').fix, /duration-\(--duration-normal\)/)
  assert.match(motionRule('duration-120').fix, /--duration-(fast|quick)/)
  assert.match(motionRule('backdrop-blur-md').fix, /backdrop-blur-glass/)
  assert.equal(motionRule('duration-(--duration-normal)'), null)
  assert.equal(motionRule('backdrop-blur-glass'), null)
})

const rulesIn = (text, file = 'app/page.tsx') => scanFile(file, text).findings.map((f) => `${f.rule}${f.allowed ? ' (allowed)' : ''}`)

test('whole-line rules: raw colors, the source layer, Radix habits and another icon set', () => {
  assert.deepEqual(rulesIn('const s = { color: "#ff0000" }'), ['raw-color'])
  assert.deepEqual(rulesIn('const s = "var(--mantis-color-lime-500)"'), ['source-token'])
  assert.deepEqual(rulesIn('<Button asChild>Save</Button>'), ['radix'])
  assert.deepEqual(rulesIn('import { Slot } from "@radix-ui/react-slot"'), ['radix'])
  assert.deepEqual(rulesIn('import { Check } from "lucide-react"'), ['icon-set'])
  // an anchor link is not a color
  assert.deepEqual(rulesIn('<a href="#fff">top</a>'), [])
  assert.deepEqual(rulesIn('<div className="bg-card text-muted-foreground rounded-control" />'), [])
})

test('an allow needs a reason, and covers only the element it sits on', () => {
  assert.deepEqual(rulesIn('<svg fill="#1da1f2" /> {/* mantis-check: allow raw-color — partner logo */}'), ['raw-color (allowed)'])
  assert.deepEqual(rulesIn('{/* mantis-check: allow raw-color — partner logo */}\n<svg\n  fill="#1da1f2"\n/>'), ['raw-color (allowed)'])
  assert.deepEqual(rulesIn('{/* mantis-check: allow raw-color — partner logo */}\n<svg fill="#1da1f2" />\n<p style={{ color: "#abcdef" }} />'), ['raw-color (allowed)', 'raw-color'])
  assert.deepEqual(rulesIn('<svg fill="#1da1f2" /> {/* mantis-check: allow raw-color */}').sort(), ['allow-without-reason', 'raw-color'])
  // an allow for a different rule does not cover this one
  assert.deepEqual(rulesIn('<svg fill="#1da1f2" /> {/* mantis-check: allow palette — n/a */}'), ['raw-color'])
})

test('the report has the summary line tools read', () => {
  const result = { findings: [{ file: 'a.tsx', line: 3, col: 1, rule: 'palette', value: 'bg-white', fix: '→ bg-primary' }], layout: 2, notes: [] }
  assert.equal(formatText(result, { quiet: true }), '1 finding · 0 allowed · 2 layout sizes not checked')
  assert.match(formatText(result), /^a\.tsx\n {5}3 {2}bg-white {22}palette {7}→ bg-primary\n\n1 finding/)
})

// The check is run the way an app runs it: copied into scripts/, from the app root.
function app(files) {
  const root = mkdtempSync(join(tmpdir(), 'mantis-check-'))
  for (const [path, content] of Object.entries({ 'scripts/mantis-check.mjs': readFileSync(CHECK_PATH, 'utf8'), ...files })) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), content)
  }
  return root
}
const run = (root, args = [], script = 'scripts/mantis-check.mjs') => spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8' })

test('a clean app passes; a dirty one exits 1 and reports as JSON', () => {
  const wired = '@import "tailwindcss";\n@import "./mantis-theme.css";\n@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));\n'
  const clean = app({ 'app/globals.css': wired, 'app/page.tsx': 'export default () => <main className="bg-background text-foreground" />\n' })
  const ok = run(clean)
  assert.equal(ok.status, 0, ok.stdout + ok.stderr)
  assert.match(ok.stdout, /^0 findings · 0 allowed · 0 layout sizes not checked$/m)

  const dirty = app({
    'app/globals.css': '@import "tailwindcss";\n@custom-variant dark (&:is(.dark *));\n',
    'app/page.tsx': 'export default () => <main className="bg-zinc-900 w-[13px]" />\n',
    // installed primitives and Mantis's own blocks are not the app's code
    'components/ui/button.tsx': 'export const x = "bg-white w-[3px]"\n',
    'components/pricing-card.tsx': 'export const y = "w-[7px]"\n',
  })
  const bad = run(dirty, ['--json'])
  assert.equal(bad.status, 1)
  const report = JSON.parse(bad.stdout)
  assert.deepEqual(Object.keys(report), ['version', 'summary', 'findings'])
  assert.deepEqual(Object.keys(report.summary), ['findings', 'allowed', 'layout', 'notes'])
  assert.deepEqual(report.findings.map((f) => `${f.file}:${f.rule}`).sort(), ['app/globals.css:dark-variant', 'app/globals.css:unresolved', 'app/page.tsx:bracket', 'app/page.tsx:palette'])
  assert.deepEqual(Object.keys(report.findings[0]), ['file', 'line', 'col', 'rule', 'value', 'fix'])
  assert.equal(JSON.parse(run(dirty, ['--json', '--include-ui']).stdout).summary.findings, 7)
  assert.equal(JSON.parse(run(dirty, ['--json', '--dir', 'components']).stdout).findings.filter((f) => f.file.startsWith('app/page')).length, 0)
})

test('an unknown flag exits 2, and a missing stylesheet is said, not hidden', () => {
  const root = app({ 'src/page.tsx': 'export const a = 1\n' })
  assert.equal(run(root, ['--bogus']).status, 2)
  assert.match(run(root).stdout, /note: no Tailwind entry stylesheet found/)
  assert.equal(run(root, ['--help']).status, 0)
})

test('run through a symlink it still checks (a path string comparison would exit 0 having checked nothing)', () => {
  const root = app({ 'app/globals.css': '@import "./mantis-theme.css";\n', 'app/page.tsx': 'export const c = "bg-zinc-900"\n' })
  symlinkSync(join(root, 'scripts/mantis-check.mjs'), join(root, 'check-link.mjs'))
  const result = run(root, ['--quiet'], 'check-link.mjs')
  assert.equal(result.status, 1)
  assert.match(result.stdout, /^1 finding/)
})

test('the registry publishes it as the item "check", installed to scripts/mantis-check.mjs', () => {
  const registry = JSON.parse(readFileSync(new URL('../registry.json', import.meta.url), 'utf8'))
  const item = registry.items.find((entry) => entry.name === 'check')
  assert.equal(item.type, 'registry:file')
  assert.deepEqual(item.files, [{ path: 'registry/check/mantis-check.mjs', type: 'registry:file', target: '~/scripts/mantis-check.mjs' }])
  assert.equal(execFileSync(process.execPath, [CHECK_PATH, '--help'], { encoding: 'utf8' }).split('\n')[0], `mantis-check ${checkData().version}`)
})

test('bracket widths, shadows, weights, line heights and tracking name the Mantis token', () => {
  assert.match(bracketRule('border-[3px]').fix, /^→ border-2 \(2px\); the border widths: 0 0px · 0\.5 0\.5px · 1 1px · 1\.5 1\.5px · 2 2px$/)
  assert.match(bracketRule('border-t-[1px]').fix, /^→ border-t \(1px\)/)
  assert.match(bracketRule('shadow-[0_1px_2px_black]').fix, /shadow-sm/)
  assert.match(bracketRule('font-[550]').fix, /^→ font-medium \(500\) or font-semibold \(600\)/)
  assert.match(bracketRule('leading-[22px]').fix, /^→ leading-5 \(20px\) or leading-6 \(24px\)/)
  assert.match(bracketRule('leading-[1.4]').fix, /on text-sm, 1\.4 is leading-5/)
  assert.match(bracketRule('tracking-[0.1em]').fix, /text-title-sm/)
  assert.equal(bracketRule('shadow-[0_1px_2px_black]', { shipped: true }), 'layout')
})

test('Tailwind steps that are not Mantis steps are findings, with the nearest step', () => {
  assert.match(offScaleRule('p-13').fix, /^→ p-12 \(48px\) or p-14 \(56px\)/)
  assert.match(offScaleRule('p-9').fix, /^→ p-8 \(32px\) or p-10 \(40px\)/)
  assert.match(offScaleRule('gap-x-3.5').fix, /^→ gap-x-3 \(12px\) or gap-x-4 \(16px\)/)
  assert.match(offScaleRule('h-9').fix, /^→ h-8 \(32px\) or h-10 \(40px\), or the component's size prop/)
  assert.match(offScaleRule('w-105').fix, /size prop, or let the layout size it/)
  assert.match(offScaleRule('border-4').fix, /^→ border-2 \(2px\)/)
  assert.match(offScaleRule('ring-3').fix, /^→ ring-2 \(2px\)/)
  assert.match(offScaleRule('leading-11').fix, /^→ leading-10 \(40px\) or leading-12 \(48px\)/)
  for (const fine of ['p-4', 'gap-0.5', '-mt-2.5', 'inset-0', 'w-24', 'border', 'border-0.5', 'ring-2', 'leading-7.5', 'translate-x-1/2', 'w-full', 'text-2', 'rounded-2', 'z-10', 'grid-cols-12', 'col-span-7', 'line-clamp-3', 'opacity-50']) assert.equal(offScaleRule(fine), null, fine)
  assert.deepEqual(rulesIn('<div className="md:-mt-13 p-4" />'), ['scale'])
})

test("Tailwind's own named values are findings, with the Mantis equivalent", () => {
  assert.match(stockRule('leading-normal').fix, /on text-sm, 1\.5 is leading-5/)
  assert.match(stockRule('leading-none').fix, /leading-3\.5/)
  assert.match(stockRule('tracking-wide').fix, /text-display-sm/)
  assert.match(stockRule('font-light').fix, /^→ font-normal \(400\)/)
  assert.match(stockRule('font-extrabold').fix, /^→ font-bold \(700\) or font-black \(900\)/)
  for (const fine of ['font-bold', 'font-semibold', 'font-sans', 'leading-5', 'tracking-[0]']) assert.equal(stockRule(fine), null, fine)
})

test('hard-coded numbers in a style={{ }} block are findings; tokens and zero are not', () => {
  const found = styleFindings(`<div style={{ padding: 13, borderRadius: 7,\n  fontSize: "13px", margin: "8px 12px", gap: 0, top: "var(--x)", height: "100%", fontWeight: 600 }} />`)
  assert.deepEqual(found.map((f) => `${f.line} ${f.value}`), ['1 padding: 13', '1 borderRadius: 7', '2 fontSize: "13px"', '2 margin: "8px 12px"', '2 fontWeight: 600'])
  assert.match(found[0].fix, /^→ className="p-3" \(12px\)/)
  assert.match(found[1].fix, /^→ className="rounded-md" \(6px\) or className="rounded-lg" \(8px\)/)
  assert.match(found[3].fix, /^→ className="my-2" \(8px\) with className="mx-3" \(12px\)/)
  assert.match(found[4].fix, /^→ className="font-semibold" \(600\)/)
  // a style prop in Mantis's own blocks holds the reference's measured values
  assert.deepEqual(scanFile('components/pricing-card.tsx', '<p style={{ padding: 13 }} />').findings, [])
  assert.deepEqual(rulesIn('<p style={{ padding: 13 }} />'), ['inline-style'])
})

test('app stylesheets: measured values, colours, the source layer and @apply', () => {
  const css = [
    '.a {', //                                                   1
    '  padding: 13px;', //                                       2
    '  /* margin: 99px */', //                                   3 a comment is not code
    '  border: 3px solid #ff0000;', //                           4
    '  border-radius: .5rem;', //                                5
    '  width: 100%;', //                                         6
    '  --gap: 13px;', //                                         7 a definition, not a use
    '  color: var(--mantis-color-lime-500);', //                 8
    '  @apply p-13 leading-normal bg-card;', //                  9
    '  margin: --theme(--spacing-3); box-shadow: var(--shadow-md); letter-spacing: var(--x);', // 10 tokens
    '}',
    '@media (min-width: 768px) { .b { margin: 0 } }', //         12
    '.c { border: 3px solid var(--border); top: var(--x) }', //   13 a raw width beside a token colour
  ].join('\n')
  const found = cssFindings(css)
  assert.deepEqual(found.map((f) => `${f.line} ${f.rule} ${f.value}`), [
    '2 css-value padding: 13px',
    '4 raw-color border: #ff0000',
    '4 css-value border: 3px solid #ff0000',
    '5 css-value border-radius: .5rem',
    '8 source-token --mantis-color-lime-500',
    '9 scale p-13',
    '9 scale leading-normal',
    '13 css-value border: 3px solid var(--border)',
  ])
  assert.match(found[0].fix, /^→ --theme\(--spacing-3\) \(12px\)/)
  assert.match(found[2].fix, /^→ --theme\(--border-width-2\) \(2px\)/)
  assert.match(found[3].fix, /^→ --theme\(--radius-lg\) \(8px\)/)
})

test('stylesheets: the theme file and the generated tokens block are exempt, and an allow covers one declaration', () => {
  assert.deepEqual(scanFile('app/mantis-theme.css', '.x { padding: 13px; color: #fff }').findings, [])
  assert.deepEqual(cssFindings('/* @tokens:start */\n.x { padding: 13px }\n/* @tokens:end */\n.y { padding: 5px }').map((f) => f.line), [4])
  const css = '.d {\n  /* mantis-check: allow css-value — the logo lockup is drawn at 7px */\n  padding: 7px;\n  margin: 7px;\n}'
  assert.deepEqual(scanFile('app/brand.css', css).findings.map((f) => `${f.line}${f.allowed ? ' allowed' : ''}`), ['3 allowed', '4'])
})
