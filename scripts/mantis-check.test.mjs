import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { CHECK_PATH, checkData, renderCheck } from './build-check.mjs'
import { baseOf, bracketRule, containerRule, formatText, layerRule, motionRule, offScaleRule, opacityRule, paletteRule, scanFile, stockRule, styleFindings, cssFindings } from '../registry/check/mantis-check.mjs'

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
  assert.match(bracketRule('w-[420px]').fix, /^→ w-md \(448px\), or the component's size prop/)
  assert.match(bracketRule('text-[13px]').fix, /text-xs|text-sm/)
  assert.match(bracketRule('rounded-[5px]').fix, /rounded-(sm|md)/)
  assert.equal(bracketRule('w-[calc(100%-2rem)]'), 'layout')
  assert.equal(bracketRule('w-[13px]', { shipped: true }), 'layout')
  assert.equal(bracketRule('w-4'), null)
})

test('numeric durations and stock blur sizes point at the motion tokens', () => {
  assert.match(motionRule('duration-200').fix, /^→ duration-normal \(200ms\)/)
  assert.match(motionRule('duration-120').fix, /^→ duration-fast \(100ms\)/)
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
  assert.match(offScaleRule('h-15').fix, /^→ h-14 \(56px\) or h-16 \(64px\), or the component's size prop/)
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

test('sizes: an off-scale step that equals a size token suggests the token', () => {
  assert.equal(checkData().sizes.control, 36)
  assert.match(offScaleRule('h-9').fix, /^→ h-control \(36px\)/)
  assert.match(offScaleRule('size-3.5').fix, /^→ size-icon-sm \(14px\)/)
  assert.match(offScaleRule('min-h-11').fix, /^→ min-h-tap \(44px\)/)
  assert.match(bracketRule('w-[52px]').fix, /^→ w-control-cta \(52px\)/)
  // spacing never suggests a size
  assert.match(offScaleRule('p-9').fix, /^→ p-8 \(32px\) or p-10 \(40px\)/)
  // a size with no token keeps the nearest-step fix
  assert.match(offScaleRule('h-15').fix, /^→ h-14 \(56px\) or h-16 \(64px\)/)
  for (const fine of ['h-control', 'size-icon-sm', 'min-w-control-lg', 'h-tap']) assert.equal(offScaleRule(fine), null, fine)
})

test('sizes: only the families that have size tokens are offered them, and CSS reads the variable', () => {
  // max-w-control and basis-control do not exist: the theme wires sizes to w, h, size, min-w and min-h only
  assert.match(offScaleRule('max-w-9').fix, /^→ max-w-8 \(32px\) or max-w-10 \(40px\)/)
  assert.match(bracketRule('basis-[36px]').fix, /^→ basis-8 \(32px\) or basis-10 \(40px\)/)
  // negative sizes are not sizes
  assert.doesNotMatch(bracketRule('w-[-36px]').fix, /control/)
  // a stylesheet reads the runtime variable; a style prop gets the class
  assert.match(cssFindings('.x { height: 36px }')[0].fix, /^→ var\(--size-control\) \(36px\)/)
  assert.match(styleFindings('<div style={{ height: 44 }} />')[0].fix, /^→ className="h-tap" \(44px\)/)
})

test('sizes: a size token the app\'s theme file does not define is reported, so a button never silently collapses', () => {
  const page = 'export default () => <button className="h-control px-3" />\n'
  const old = app({ 'app/globals.css': '@import "tailwindcss";\n@import "./mantis-theme.css";\n', 'app/mantis-theme.css': '@theme inline {\n  --spacing: 4px;\n}\n', 'app/page.tsx': page })
  const report = JSON.parse(run(old, ['--json']).stdout)
  const finding = report.findings.find((f) => f.rule === 'unresolved' && f.value === 'h-control')
  assert.ok(finding, JSON.stringify(report.findings))
  assert.match(finding.fix, /reinstall the theme: npx shadcn@latest add @mantis\/base --overwrite/)
  const current = app({ 'app/globals.css': '@import "tailwindcss";\n@import "./mantis-theme.css";\n', 'app/mantis-theme.css': readFileSync(new URL('../registry/mantis-theme.css', import.meta.url), 'utf8'), 'app/page.tsx': page })
  assert.equal(JSON.parse(run(current, ['--json']).stdout).findings.filter((f) => f.rule === 'unresolved').length, 0)
  // primitives count too: they are what an update replaces
  const ui = app({ 'app/globals.css': '@import "./mantis-theme.css";\n', 'app/mantis-theme.css': '@theme inline {\n}\n', 'components/ui/button.tsx': 'export const b = "h-control"\n' })
  assert.ok(JSON.parse(run(ui, ['--json']).stdout).findings.some((f) => f.file === 'components/ui/button.tsx' && f.rule === 'unresolved'))
})

test('sizes: a mantis-cn older than the size tokens is reported, so a size passed in is never silently ignored', () => {
  const theme = readFileSync(new URL('../registry/mantis-theme.css', import.meta.url), 'utf8')
  const files = { 'app/globals.css': '@import "tailwindcss";\n@import "./mantis-theme.css";\n', 'app/mantis-theme.css': theme, 'app/page.tsx': 'export default () => <button className="h-control" />\n' }
  const oldHelper = 'import { createCn } from "cn/config"\nexport const TEXT_STYLES = ["display-sm"]\nexport const cn = createCn({ extend: { classGroups: { "font-size": [{ text: TEXT_STYLES }] } } })\n'
  const stale = JSON.parse(run(app({ ...files, 'lib/mantis-cn.ts': oldHelper }), ['--json']).stdout).findings.filter((f) => f.rule === 'unresolved')
  assert.equal(stale.length, 1, JSON.stringify(stale))
  assert.equal(stale[0].file, 'lib/mantis-cn.ts')
  assert.match(stale[0].fix, /npx shadcn@latest add @mantis\/mantis-cn --overwrite/)
  const current = run(app({ ...files, 'lib/mantis-cn.ts': readFileSync(new URL('../lib/mantis-cn.ts', import.meta.url), 'utf8') }), ['--json'])
  assert.equal(JSON.parse(current.stdout).findings.filter((f) => f.rule === 'unresolved').length, 0)
})

test('sizes: a theme the check cannot find is a note, not a finding the reinstall advice cannot clear', () => {
  const root = app({ 'app/globals.css': '@import "tailwindcss";\n@import "@/app/mantis-theme.css";\n', 'app/mantis-theme.css': readFileSync(new URL('../registry/mantis-theme.css', import.meta.url), 'utf8'), 'app/page.tsx': 'export default () => <button className="h-control" />\n' })
  const report = JSON.parse(run(root, ['--json']).stdout)
  assert.equal(report.findings.filter((f) => f.rule === 'unresolved').length, 0, JSON.stringify(report.findings))
  assert.ok(report.summary.notes.some((n) => /could not read @\/app\/mantis-theme\.css/.test(n)), JSON.stringify(report.summary.notes))
})

test('sizes: max-h- has the size tokens too (Tailwind reads the height keys for it)', () => {
  assert.match(offScaleRule('max-h-9').fix, /^→ max-h-control \(36px\)/)
  assert.equal(offScaleRule('max-h-control'), null)
})

test('sizes: an outdated theme is one finding that names every size it is missing, including stylesheet reads', () => {
  const root = app({
    'app/globals.css': '@import "tailwindcss";\n@import "./mantis-theme.css";\n',
    'app/mantis-theme.css': '@theme inline {\n}\n',
    'app/page.tsx': 'export default () => <><button className="h-control" /><i className="size-icon-sm max-h-tap" /></>\n',
    'app/panel.css': '.panel { height: var(--size-control-lg); }\n',
  })
  const stale = JSON.parse(run(root, ['--json']).stdout).findings.filter((f) => f.rule === 'unresolved')
  assert.equal(stale.length, 1, JSON.stringify(stale))
  assert.equal(stale[0].value, 'h-control')
  for (const name of ['h-control', 'size-icon-sm', 'max-h-tap', 'var(--size-control-lg)']) assert.ok(stale[0].fix.includes(name), `${name} missing from: ${stale[0].fix}`)
  // the advice says what else the reinstall replaces
  assert.match(stale[0].fix, /also replaces the installed primitives, mantis-cn and MANTIS\.md/)
})

test('opacity: a numeric step is a finding with the Mantis opacity as the fix; fully on and off are not', () => {
  assert.deepEqual(checkData().opacities, { disabled: 50, muted: 40, scrim: 30 })
  assert.equal(opacityRule('opacity-50').rule, 'scale')
  assert.match(opacityRule('opacity-50').fix, /^→ opacity-disabled \(50%\)/)
  assert.match(opacityRule('opacity-40').fix, /^→ opacity-muted \(40%\)/)
  assert.match(opacityRule('opacity-30').fix, /^→ opacity-scrim \(30%\)/)
  assert.match(opacityRule('opacity-20').fix, /^→ opacity-scrim \(30%\); the opacities: scrim 30% · muted 40% · disabled 50%$/)
  assert.match(opacityRule('opacity-35').fix, /^→ opacity-scrim \(30%\) or opacity-muted \(40%\)/)
  assert.equal(opacityRule('opacity-[0.3]').rule, 'bracket')
  assert.match(opacityRule('opacity-[0.3]').fix, /^→ opacity-scrim \(30%\)/)
  assert.match(opacityRule('opacity-[45%]').fix, /^→ opacity-muted \(40%\) or opacity-disabled \(50%\)/)
  for (const fine of ['opacity-0', 'opacity-100', 'opacity-disabled', 'opacity-muted', 'opacity-scrim', 'opacity-(--x)']) assert.equal(opacityRule(fine), null, fine)
  assert.deepEqual(rulesIn('<div className="disabled:opacity-50 hover:opacity-100 opacity-[0.3]" />'), ['scale', 'bracket'])
  // Mantis's own blocks are not judged on this
  assert.deepEqual(scanFile('components/pricing-card.tsx', '<div className="opacity-50" />').findings, [])
  const [style] = styleFindings('<div style={{ opacity: 0.5, zoom: 1 }} />')
  assert.equal(style.rule, 'inline-style')
  assert.match(style.fix, /^→ className="opacity-disabled" \(50%\)/)
  assert.deepEqual(styleFindings('<div style={{ opacity: 1 }} /><p style={{ opacity: 0 }} />'), [])
  const [css] = cssFindings('.x { opacity: .5; }\n.y { opacity: var(--opacity-muted); opacity: 1 }')
  assert.equal(`${css.line} ${css.rule}`, '1 css-value')
  assert.match(css.fix, /^→ var\(--opacity-disabled\) \(50%\)/)
  assert.equal(cssFindings('.y { opacity: var(--opacity-muted); opacity: 1 }').length, 0)
})

test('layers: a numeric z-index is a finding with the Mantis layer as the fix', () => {
  assert.deepEqual(checkData().layers, { raised: 10, sticky: 20, floating: 50 })
  assert.equal(layerRule('z-10').rule, 'scale')
  assert.match(layerRule('z-10').fix, /^→ z-raised \(10\)/)
  assert.match(layerRule('z-50').fix, /^→ z-floating \(50\)/)
  assert.match(layerRule('z-30').fix, /^→ z-sticky \(20\); the layers: raised 10 · sticky 20 · floating 50/)
  assert.match(layerRule('-z-10').fix, /^→ -z-raised \(-10\)/)
  assert.equal(layerRule('z-[5]').rule, 'bracket')
  assert.match(layerRule('z-[5]').fix, /^→ z-raised \(10\)/)
  for (const fine of ['z-0', 'z-auto', 'z-raised', '-z-raised', 'z-floating', 'z-(--x)', 'z-[var(--x)]']) assert.equal(layerRule(fine), null, fine)
  assert.deepEqual(rulesIn('<div className="sticky top-0 md:z-20 z-[5]" />'), ['scale', 'bracket'])
  assert.deepEqual(scanFile('components/pricing-card.tsx', '<div className="z-10" />').findings, [])
  const [style] = styleFindings('<div style={{ zIndex: 10 }} />')
  assert.equal(style.rule, 'inline-style')
  assert.match(style.fix, /^→ className="z-raised" \(10\)/)
  const found = cssFindings('.x { z-index: 50; }\n.y { z-index: -10 }\n.z { z-index: var(--z-sticky); z-index: 0 }')
  assert.deepEqual(found.map((f) => `${f.line} ${f.rule}`), ['1 css-value', '2 css-value'])
  assert.match(found[0].fix, /^→ var\(--z-floating\) \(50\)/)
  assert.match(found[1].fix, /^→ calc\(var\(--z-raised\) \* -1\) \(-10\)/)
})

test('widths: Tailwind\'s widths Mantis does not name are findings, and a long length suggests a Mantis width', () => {
  assert.deepEqual(checkData().containers, { xs: 320, sm: 384, md: 448, lg: 512, xl: 576, '2xl': 672, '3xl': 768, '4xl': 896, '5xl': 1024, '6xl': 1152, '7xl': 1280 })
  assert.equal(containerRule('max-w-3xs').rule, 'scale')
  assert.match(containerRule('max-w-3xs').fix, /^→ the component's size prop, or let the layout size it \(w-full, flex-1, grid columns\); no Mantis width is near 256px; the widths: xs 320px/)
  assert.match(containerRule('w-2xs').fix, /^→ w-xs \(320px\)/)
  assert.match(containerRule('max-w-prose').fix, /^→ a Mantis width for a text column, such as max-w-xl \(576px\) or max-w-2xl \(672px\)/)
  for (const fine of ['max-w-md', 'max-w-7xl', 'w-full', 'max-w-none', 'min-w-0', 'basis-1/2']) assert.equal(containerRule(fine), null, fine)
  assert.match(bracketRule('max-w-[640px]').fix, /^→ max-w-2xl \(672px\), or the component's size prop/)
  assert.match(bracketRule('w-[317px]').fix, /^→ w-xs \(320px\)/)
  assert.match(bracketRule('max-w-[448px]').fix, /^→ max-w-md \(448px\)$/)
  assert.match(bracketRule('h-[400px]').fix, /Mantis has no size step above 96px/)
  assert.match(offScaleRule('w-105').fix, /^→ w-md \(448px\), or the component's size prop, or let the layout size it/)
  assert.deepEqual(rulesIn('<div className="mx-auto max-w-prose sm:max-w-md" />'), ['scale'])
  const [style] = styleFindings('<div style={{ maxWidth: 448 }} />')
  assert.match(style.fix, /^→ className="max-w-md" \(448px\)/)
  const [css] = cssFindings('.x { max-width: 28rem }')
  assert.match(css.fix, /^→ --theme\(--container-md\) \(448px\)/)
})

test('motion: bracket durations and hand-made curves are findings; Mantis names are not', () => {
  assert.equal(motionRule('duration-[250ms]').rule, 'motion')
  assert.match(motionRule('duration-[250ms]').fix, /^→ duration-normal \(200ms\) or duration-slow \(300ms\)/)
  assert.match(motionRule('duration-[0.3s]').fix, /^→ duration-slow \(300ms\)/)
  assert.match(motionRule('duration-75').fix, /^→ duration-fast \(100ms\)/)
  assert.equal(motionRule('ease-[cubic-bezier(0,0,1,1)]').rule, 'motion')
  assert.match(motionRule('ease-[cubic-bezier(0,0,1,1)]').fix, /^→ a Mantis curve: ease-in · ease-out · ease-in-out · ease-swift · ease-emphasized · ease-spring · ease-out-expo/)
  for (const fine of ['duration-normal', 'duration-fast', 'duration-0', 'duration-(--duration-normal)', 'ease-swift', 'ease-in-out', 'ease-linear', 'ease-(--x)']) assert.equal(motionRule(fine), null, fine)
  assert.deepEqual(rulesIn('<div className="transition hover:duration-[250ms] ease-[cubic-bezier(0,0,1,1)]" />'), ['motion', 'motion'])
  const [style] = styleFindings('<div style={{ transitionDuration: "200ms" }} />')
  assert.equal(style.rule, 'inline-style')
  assert.match(style.fix, /^→ className="duration-normal" \(200ms\)/)
  const found = cssFindings('.x { transition-duration: .2s }\n.y { transition-duration: var(--duration-slow) }')
  assert.deepEqual(found.map((f) => `${f.line} ${f.rule}`), ['1 css-value'])
  assert.match(found[0].fix, /^→ var\(--duration-normal\) \(200ms\)/)
})

test('install: a theme older than the opacity, layer and duration names is one finding naming each', () => {
  const page = 'export default () => <div className="opacity-disabled -z-raised z-floating duration-normal h-control" />\n'
  const css = '.x { opacity: var(--opacity-muted); z-index: var(--z-sticky) }\n'
  const old = app({ 'app/globals.css': '@import "tailwindcss";\n@import "./mantis-theme.css";\n', 'app/mantis-theme.css': '@theme inline {\n}\n', 'app/page.tsx': page, 'app/x.css': css })
  const stale = JSON.parse(run(old, ['--json']).stdout).findings.filter((f) => f.rule === 'unresolved')
  assert.equal(stale.length, 1, JSON.stringify(stale))
  for (const name of ['opacity-disabled', 'z-raised', 'z-floating', 'duration-normal', 'h-control', 'var(--opacity-muted)', 'var(--z-sticky)']) assert.ok(stale[0].fix.includes(name), `${name} missing from: ${stale[0].fix}`)
  assert.match(stale[0].fix, /reinstall the theme: npx shadcn@latest add @mantis\/base --overwrite/)
  const current = app({ 'app/globals.css': '@import "tailwindcss";\n@import "./mantis-theme.css";\n', 'app/mantis-theme.css': readFileSync(new URL('../registry/mantis-theme.css', import.meta.url), 'utf8'), 'app/page.tsx': page, 'app/x.css': css, 'lib/mantis-cn.ts': readFileSync(new URL('../lib/mantis-cn.ts', import.meta.url), 'utf8') })
  assert.deepEqual(JSON.parse(run(current, ['--json']).stdout).findings.filter((f) => f.rule === 'unresolved'), [])
})

test('install: a mantis-cn older than the opacity, layer and duration names is reported', () => {
  const files = { 'app/globals.css': '@import "tailwindcss";\n@import "./mantis-theme.css";\n', 'app/mantis-theme.css': readFileSync(new URL('../registry/mantis-theme.css', import.meta.url), 'utf8'), 'app/page.tsx': 'export default () => <div className="z-floating opacity-disabled duration-normal" />\n' }
  const sizesOnly = 'import { createCn } from "cn/config"\nexport const SIZES = ["control"]\nexport const cn = createCn({})\n'
  const stale = JSON.parse(run(app({ ...files, 'lib/mantis-cn.ts': sizesOnly }), ['--json']).stdout).findings.filter((f) => f.rule === 'unresolved')
  assert.equal(stale.length, 1, JSON.stringify(stale))
  assert.match(stale[0].fix, /floating/)
  assert.match(stale[0].fix, /disabled/)
  assert.match(stale[0].fix, /npx shadcn@latest add @mantis\/mantis-cn --overwrite/)
})

test('radius-override: shadcn\'s radius lines after the Mantis import are findings on their own lines', () => {
  const globals = [
    '@import "tailwindcss";', //                                1
    '@import "shadcn/tailwind.css";', //                        2
    '@import "./mantis-theme.css";', //                         3
    '', //                                                      4
    '@theme inline {', //                                       5
    '  --color-background: var(--background);', //              6
    '  --radius-sm: calc(var(--radius) * 0.6);', //            7 4.8px, Mantis's is 4px
    '  --radius-md: var(--radius-md);', //                      8 points back at Mantis
    '  --radius-lg: var(--radius);', //                         9 the same line Mantis writes
    '  --radius-xl: calc(var(--radius) * 1.4);', //            10 11.2px, Mantis's is 12px
    '  --radius-2xl: 1rem;', //                                 11 Mantis's own 16px, as a length
    '  --radius-3xl: var(--my-radius);', //                     12 cannot tell: reported as what it reads
    '}', //                                                    13
    ':root { --radius: 0.625rem; }', //                        14 loses to Mantis's html:root
  ].join('\n')
  const root = app({ 'app/globals.css': globals + '\n', 'app/mantis-theme.css': readFileSync(new URL('../registry/mantis-theme.css', import.meta.url), 'utf8') })
  const found = JSON.parse(run(root, ['--json']).stdout).findings.filter((f) => f.rule === 'radius-override')
  assert.deepEqual(found.map((f) => `${f.line} ${f.value}`), ['7 --radius-sm: calc(var(--radius) * 0.6)', '10 --radius-xl: calc(var(--radius) * 1.4)', '12 --radius-3xl: var(--my-radius)'])
  assert.match(found[0].fix, /^→ shadcn's radius line overrides Mantis's: rounded-sm renders 4\.8px, Mantis's is 4px\. Delete it \(Mantis's theme defines every radius\)/)
  assert.match(found[2].fix, /rounded-3xl reads var\(--my-radius\)/)
  // a radius line above the Mantis import loses to it: no finding
  const above = app({ 'app/globals.css': '@theme inline {\n  --radius-sm: 9px;\n}\n@import "./mantis-theme.css";\n', 'app/mantis-theme.css': readFileSync(new URL('../registry/mantis-theme.css', import.meta.url), 'utf8') })
  assert.equal(JSON.parse(run(above, ['--json']).stdout).findings.filter((f) => f.rule === 'radius-override').length, 0)
  assert.match(run(root, []).stdout, /radius-override|radius {2,}/)
})

test('blur: Tailwind\'s own filter blur steps are findings like the backdrop ones, with the Mantis blurs as the fix', () => {
  assert.equal(motionRule('blur-3xl').rule, 'motion')
  assert.match(motionRule('blur-3xl').fix, /^→ blur-dialog \(32px\); the steps: chip 8px · glass 12px · dialog 32px/)
  assert.match(motionRule('blur-md').fix, /^→ blur-glass \(12px\)/)
  for (const fine of ['blur-dialog', 'blur-none', 'blur-glass', 'backdrop-blur-chip']) assert.equal(motionRule(fine), null, fine)
})

test('review fixes: a negative layer keeps its sign through a real scan', () => {
  const found = scanFile('app/page.tsx', '<div className="absolute -z-10 md:-z-[5] z-10" />').findings
  assert.deepEqual(found.map((f) => `${f.value} ${f.fix.split(';')[0]}`), ['-z-10 → -z-raised (-10)', 'md:-z-[5] → -z-raised (-10)', 'z-10 → z-raised (10)'])
  const [css] = cssFindings('.x { @apply -z-10; }')
  assert.match(css.fix, /^→ -z-raised \(-10\)/)
})

test('review fixes: Tailwind\'s filter blur steps are flagged in app code, not in Mantis\'s own shipped blocks', () => {
  assert.deepEqual(rulesIn('<img className="blur-3xl" />'), ['motion'])
  assert.deepEqual(scanFile('components/lightbox-inspector.tsx', '<img className="blur-3xl" />').findings, [])
  // backdrop blur stays judged everywhere, as before
  assert.deepEqual(scanFile('components/lightbox-inspector.tsx', '<div className="backdrop-blur-md" />').findings.map((f) => f.rule), ['motion'])
})

test('review fixes: a fix leads with a token only when one is close to what was written', () => {
  // widths far from every container width lead with the layout advice
  assert.match(bracketRule('w-[120px]').fix, /^→ the component's size prop, or let the layout size it \(w-full, flex-1, grid columns\); no Mantis width is near 120px; the widths: xs 320px/)
  assert.match(offScaleRule('w-64').fix, /^→ the component's size prop, or let the layout size it/)
  assert.match(styleFindings('<div style={{ maxWidth: 200 }} />')[0].fix, /^→ the component's size prop, or let the layout size it/)
  // a close one still leads with the width
  assert.match(bracketRule('w-[317px]').fix, /^→ w-xs \(320px\)/)
  assert.match(bracketRule('max-w-[640px]').fix, /^→ max-w-2xl \(672px\)/)
  // an opacity above Mantis's highest is a hover or press dim, not a disabled state
  for (const cls of ['opacity-90', 'opacity-75', 'opacity-60']) {
    assert.match(opacityRule(cls).fix, /^→ Mantis names no opacity above 50%: dim a hover or press with hover:brightness-80 or active:brightness-60; the opacities: scrim 30% · muted 40% · disabled 50%$/, cls)
  }
  assert.match(opacityRule('opacity-50').fix, /^→ opacity-disabled \(50%\)$/)
})

test('review fixes: a radius line equal to Mantis\'s today says so instead of contradicting itself', () => {
  const globals = '@import "tailwindcss";\n@import "./mantis-theme.css";\n@theme inline {\n  --radius-sm: calc(var(--radius) - 4px);\n}\n'
  const root = app({ 'app/globals.css': globals, 'app/mantis-theme.css': readFileSync(new URL('../registry/mantis-theme.css', import.meta.url), 'utf8') })
  const [found] = JSON.parse(run(root, ['--json']).stdout).findings.filter((f) => f.rule === 'radius-override')
  assert.match(found.fix, /rounded-sm renders 4px, the same as Mantis's only because --radius is 8px/)
})
