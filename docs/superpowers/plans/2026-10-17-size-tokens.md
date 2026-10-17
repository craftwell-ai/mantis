# Size Tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Mantis named size tokens for icons, controls and the tap target, so `h-control`, `size-icon-sm` and `h-tap` replace raw Tailwind steps like `h-9` and `size-3.5`, with no visual change.

**Architecture:** A new `size` section in `tokens/mantis.tokens.mjs` becomes runtime variables (`--size-control: 2.25rem`) plus keys in Tailwind's width, height, size, min-width and min-height theme families, which do not leak into spacing (`p-control` generates nothing). mantis-check suggests the tokens and guards against an app whose theme file is older than its components. Primitives and blocks are renamed by role, and a before/after measurement of every story proves nothing moved.

**Tech Stack:** Tailwind CSS 4.3.3 (`@theme inline`), Node test runner, Playwright (already a devDependency), shadcn registry build.

**Spec:** No separate spec. The decisions below were agreed in conversation on 2026-10-17, with evidence gathered that day.

## Decisions (agreed 2026-10-17; change them here before executing)

- **Which sizes:** icons, controls and the tap target now. Panel and menu widths wait for a pass that names each width's job. Breakpoints are a separate change, because wiring them changes when layouts switch.
- **Names, not numbers:** `h-control-lg` rather than `h-10`. The checker points old numbers to names.
- **Icon scale (9 steps):** every glyph size Mantis's parts use. Five alias the source's own icon tokens; four (8, 10, 14, 18px) are measured from Mantis's primitives and are authored. The names are Mantis's own, so they do **not** match the source's (the source's `icon-sm` is 16px; Mantis's `icon-md` is 16px).

  | Token | px | Value |
  |---|---|---|
  | `icon-3xs` | 8 | `0.5rem` (authored: avatar badge glyph) |
  | `icon-2xs` | 10 | `0.625rem` (authored: checkbox xs check) |
  | `icon-xs` | 12 | `{icon-xs}` |
  | `icon-sm` | 14 | `0.875rem` (authored: 20 uses) |
  | `icon-md` | 16 | `{icon-sm}` |
  | `icon-lg` | 18 | `1.125rem` (authored: 13 uses) |
  | `icon-xl` | 20 | `{icon-md}` |
  | `icon-2xl` | 24 | `{icon-lg}` |
  | `icon-3xl` | 28 | `{icon-xl}` |

- **Control scale:** Button's own size ladder, named after Button's size prop. The default is the bare name, as `rounded-control` already is.

  | Token | px | Button size |
  |---|---|---|
  | `control-2xs` | 16 | `2xs` |
  | `control-xs` | 24 | `xs`, `icon-xs` |
  | `control-sm` | 32 | `sm`, `icon-sm` |
  | `control` | 36 | `default`, `icon` |
  | `control-lg` | 40 | `lg`, `icon-lg` |
  | `control-xl` | 48 | `xl` |
  | `control-cta` | 52 | `cta` |
  | `control-2xl` | 56 | `2xl` |
  | `control-3xl` | 64 | `3xl` |

- **Tap target:** `tap`, 44px (`2.75rem`), used by the large input and the command palette field.
- **What counts as a control:** a height or side that sizes something you press or type into: buttons, toggles, field and select triggers, tabs, select items, and rows that are themselves the button (nav items, layer rows). Badges, kbd keys, checkbox and radio boxes, avatars, icon-tile boxes, table rows, decorative circles and fixed text widths are **not** controls and keep their classes.
- **Scope of renames:** every glyph size and every control height in `components/ui/`; in `registry/` blocks, glyph sizes plus the off-scale control heights (`h-9`, `size-9`, `h-11`). On-scale control heights in blocks (`h-8`, `h-10` rows) are legal spacing steps and move to the lint-review follow-up. Stories are not renamed.
- **Known exceptions that keep their classes:** toggle `sm` (`h-7 min-w-7`, 28px is not on the ladder), the tabs `line` bar (`h-13`, a bar rather than a control), switch `lg` track (`w-9`), and the block one-offs listed in Task 6.
- **AGENTS.md room:** shorten repeated export prefixes (`DropdownMenu, …Content, …Item`). Measured: saves 554 bytes (25,957 → 25,403), leaving room for the size line under the 26,000 cap.
- **Shipping:** work on branch `size-tokens` with commits per task and no version bumps; the last task bumps to **1.7.0** and squash-merges into `main` as one commit, so `main` keeps one bump per commit. No push or deploy without the owner's OK.

## Global Constraints

- Components read semantic tokens only (`--size-*`), never `--mantis-*`; `scripts/registry-meta.test.mjs` fails any registry file that reads `--mantis-`.
- No new dependencies. Playwright, Tailwind and the Node test runner are already installed.
- Never hand-edit generated files: `app/globals.css` outside the `@tokens` markers only, `registry/mantis-theme.css`, `tokens/mantis.tokens.json`, `public/llms.txt`, `public/r/*.json`, `registry/check/mantis-check.mjs`, `public/usage/*.md`. Edit the sources and regenerate.
- After touching tokens, `registry.json`, `usage/` or `components/ui` props: `node scripts/build-tokens.mjs`, `node scripts/build-llms.mjs`, `node scripts/build-usage.mjs`, `node scripts/build-agents.mjs`, `node scripts/build-check.mjs`, then `npm run registry:build`.
- Gates before calling a task done: `npm test`, `npm run lint`, `npx tsc --noEmit`; before the final commit also `npm run test-storybook` (stop any `npm run storybook` first).
- AGENTS.md stays under 26,000 bytes (`scripts/build-agents.test.mjs`).
- Every computed pixel value stays identical. Proven by `scripts/tailwind-theme.test.mjs` and by the story measurement in Tasks 1 and 7.
- Base UI, not Radix; Material Symbols through `Icon`; dark only. None of these change here.

## Review Focus

1. **An app updates a component but not its theme file.** The new class (`h-control`) produces no CSS and the button collapses to its content height, with no error. Expected: mantis-check reports it. Test in Task 3.
2. **A misspelt token name** (`h-contrl`) also produces no CSS silently. Expected: the story measurement in Task 7 shows the element changed size. Covered by the Task 1/7 compare.
3. **Size names leaking into spacing.** `p-control` or `gap-icon-sm` would make sizes usable as padding. Expected: they generate no CSS. Test in Task 2.
4. **Self-referencing theme keys.** `--size-control: var(--size-control)` in `@theme inline` must resolve through the runtime variable, not loop. Expected: `size-control` computes to 36px. Test in Task 2.
5. **Default-icon selectors.** `[&_svg:not([class*='size-'])]` must still skip an icon given `size-icon-sm`, because the new name still contains `size-`. Expected: an icon with its own size keeps it. Covered by the Task 7 compare (button and input-group stories).

---

### Task 1: Story measurement tool and the "before" baseline

**Files:**
- Create: `scripts/story-geometry.mjs`

**Interfaces:**
- Produces: `node scripts/story-geometry.mjs capture <storybook-static-dir> <out.json>` and `node scripts/story-geometry.mjs compare <before.json> <after.json> [<before-again.json>]`. Task 7 runs both.

- [ ] **Step 1: Write the tool**

```js
// Measures every element of every story in a built Storybook, so a refactor that should change
// nothing visible can prove it. Layout boxes only (computed width and height, offset position):
// transforms and animations such as the skeleton shimmer move pixels without moving layout.
// Usage:
//   node scripts/story-geometry.mjs capture <storybook-static-dir> <out.json>
//   node scripts/story-geometry.mjs compare <before.json> <after.json> [<before-again.json>]
// A third file is a second "before" capture: anything that differs between the two before runs
// is noise (maps, video, timers) and is reported but not counted.
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'
import { chromium } from 'playwright'

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mp4': 'video/mp4' }

function serve(dir) {
  const server = createServer((req, res) => {
    const path = join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname))
    const file = existsSync(path) && statSync(path).isDirectory() ? join(path, 'index.html') : path
    if (!resolve(file).startsWith(resolve(dir)) || !existsSync(file)) { res.writeHead(404); return res.end() }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
    res.end(readFileSync(file))
  })
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)))
}

function measure() {
  const out = []
  const walk = (el, path) => {
    for (const [i, child] of [...el.children].entries()) {
      if (['SCRIPT', 'STYLE', 'LINK', 'META'].includes(child.tagName)) continue
      const key = `${path}/${child.tagName.toLowerCase()}${child.dataset.slot ? `[${child.dataset.slot}]` : ''}:${i}`
      const cs = getComputedStyle(child)
      if (cs.display !== 'none') out.push(`${key} ${cs.width} ${cs.height} ${child.offsetLeft ?? ''},${child.offsetTop ?? ''}`)
      walk(child, key)
    }
  }
  walk(document.body, '')
  return out
}

async function capture(dir, outFile) {
  const index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8'))
  const ids = Object.values(index.entries).filter((e) => e.type === 'story').map((e) => e.id).sort()
  const server = await serve(dir)
  const base = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  const result = {}
  const queue = [...ids]
  const worker = async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
    while (queue.length) {
      const id = queue.shift()
      try {
        await page.goto(`${base}/iframe.html?id=${id}&viewMode=story`, { waitUntil: 'networkidle', timeout: 30_000 })
        await page.evaluate(() => document.fonts.ready)
        await page.waitForTimeout(400)
        result[id] = await page.evaluate(measure)
      } catch (cause) {
        result[id] = [`error ${cause.message.split('\n')[0]}`]
      }
    }
    await page.close()
  }
  await Promise.all([worker(), worker(), worker(), worker()])
  await browser.close()
  server.close()
  writeFileSync(outFile, JSON.stringify(result))
  console.log(`measured ${ids.length} stories → ${outFile}`)
}

function compare(beforeFile, afterFile, againFile) {
  const before = JSON.parse(readFileSync(beforeFile, 'utf8'))
  const after = JSON.parse(readFileSync(afterFile, 'utf8'))
  const again = againFile ? JSON.parse(readFileSync(againFile, 'utf8')) : null
  let changed = 0
  let noisy = 0
  for (const id of Object.keys(before).sort()) {
    const a = before[id].join('\n')
    const b = (after[id] ?? ['missing']).join('\n')
    if (a === b) continue
    if (again && again[id]?.join('\n') !== a) { noisy++; console.log(`noise   ${id} (differs between the two before runs)`); continue }
    changed++
    const lines = new Set(before[id])
    console.log(`CHANGED ${id}`)
    for (const line of (after[id] ?? []).filter((l) => !lines.has(l)).slice(0, 5)) console.log(`   after: ${line}`)
  }
  for (const id of Object.keys(after)) if (!(id in before)) console.log(`new     ${id}`)
  console.log(`${Object.keys(before).length} stories, ${changed} changed, ${noisy} noisy`)
  return changed
}

const [mode, a, b, c] = process.argv.slice(2)
if (mode === 'capture') await capture(a, b)
else if (mode === 'compare') process.exitCode = compare(a, b, c) ? 1 : 0
else console.log('usage: story-geometry.mjs capture <dir> <out.json> | compare <before.json> <after.json> [<before-again.json>]')
```

- [ ] **Step 2: Build Storybook and capture "before" twice** (still on the unchanged code)

```bash
npm run build-storybook -- -o .paper-build/sb-before --quiet
node scripts/story-geometry.mjs capture .paper-build/sb-before .paper-build/geometry-before.json
node scripts/story-geometry.mjs capture .paper-build/sb-before .paper-build/geometry-before-2.json
node scripts/story-geometry.mjs compare .paper-build/geometry-before.json .paper-build/geometry-before-2.json
```

Expected: `measured 392 stories` twice. The self-compare prints the noisy stories (maps, video) and should report few or none changed. If many stories differ between two identical runs, raise the 400ms settle time before going on; a baseline that disagrees with itself proves nothing.

- [ ] **Step 3: Check it catches a change.** Temporarily change `h-9` to `h-10` in `components/ui/button.tsx` (default size), rebuild into `.paper-build/sb-probe`, capture, and compare with `geometry-before.json`.

Expected: the button stories show `CHANGED` with a 36px → 40px height. Then revert the probe edit (`git checkout components/ui/button.tsx`).

- [ ] **Step 4: Commit**

```bash
git add scripts/story-geometry.mjs
git commit -m "chore(scripts): measure every story, to prove a refactor moved nothing"
```

---

### Task 2: AGENTS.md room

**Files:**
- Modify: `scripts/build-agents.mjs:103,109` (component line and its intro)
- Test: `scripts/build-agents.test.mjs` (existing size cap; add one assertion)

**Interfaces:**
- Produces: AGENTS.md about 25,460 bytes, which Task 5 needs for the size line.

- [ ] **Step 1: Write the failing test.** Append to `scripts/build-agents.test.mjs`:

```js
test('a compound component lists its parts once, after its root name', () => {
  const line = rendered.split('\n').find((l) => l.startsWith('- **dropdown-menu**'))
  assert.match(line, /\*\* DropdownMenu, …CheckboxItem, …Content,/)
  assert.ok(Buffer.byteLength(rendered) < 25_500, `AGENTS.md is ${Buffer.byteLength(rendered)} bytes; it needs room for the size tokens`)
})
```

- [ ] **Step 2: Run it.** `node --test scripts/build-agents.test.mjs`. Expected: FAIL on the regex.

- [ ] **Step 3: Implement.** In `scripts/build-agents.mjs`, replace line 109:

```js
    // `…Content` is short for `<Root>Content`: the shared prefix is written once, which keeps the index under its cap.
    const named = exports.filter((e) => /^[A-Z]/.test(e))
    const root = named[0]
    const parts = [`**${name}** ${named.map((e, i) => (i > 0 && e !== root && e.startsWith(root) ? `…${e.slice(root.length)}` : e)).join(', ')}`]
```

and in the intro on line 103 change `**name** exports` to `**name** exports (\`…Item\` means \`<First export>Item\`)`.

- [ ] **Step 4: Regenerate and run.** `node scripts/build-agents.mjs && node --test scripts/build-agents.test.mjs`. Expected: PASS, about 25,460 bytes.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-agents.mjs scripts/build-agents.test.mjs AGENTS.md registry/MANTIS.md public/design.md
git commit -m "chore(agents): write a compound component's shared prefix once"
```

---

### Task 3: Size tokens in the theme

**Files:**
- Modify: `tokens/mantis.tokens.mjs` (new `size` section after `leading`)
- Modify: `scripts/build-tokens.mjs` (`buildCss`: runtime variables in the default block, theme keys)
- Test: `scripts/build-tokens.test.mjs`, `scripts/tailwind-theme.test.mjs`

**Interfaces:**
- Produces: runtime CSS variables `--size-<name>` on `html:root`; Tailwind classes `w-<name>`, `h-<name>`, `size-<name>`, `min-w-<name>`, `min-h-<name>` for every key of `tokens.size` (for example `h-control`, `size-icon-sm`, `min-w-control-sm`, `h-tap`). Tasks 4–6 use exactly these names.

- [ ] **Step 1: Write the failing tests.** Append to `scripts/build-tokens.test.mjs`:

```js
test('size tokens become runtime variables and width, height, size, min-width and min-height keys', () => {
  const sized = { ...fixture, size: { control: '2.25rem', 'icon-md': '{icon-sm}' } }
  const css = renderRegistryTheme(sized)
  const theme = css.split('\n}')[0]
  for (const family of ['width', 'height', 'size', 'min-width', 'min-height']) {
    assert.ok(theme.includes(`  --${family}-control: var(--size-control);`), `${family}-control`)
  }
  const root = css.slice(css.indexOf('html:root {'))
  assert.ok(root.includes('  --size-control: 2.25rem;'))
  assert.ok(root.includes(`  --size-icon-md: var(--${name}-icon-sm);`))
  assert.ok(!/--size-control/.test(renderRegistryTheme(fixture)))
})
```

In `scripts/tailwind-theme.test.mjs`, make `variables()` skip self-references (a theme key that reads the runtime variable of the same name), by changing its first loop body to:

```js
    for (const m of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
      if (m[2].trim() === `var(${m[1]})`) continue // @theme inline key pointing at its runtime variable
      if (!map.has(m[1]) || m[2].includes('mantis')) map.set(m[1], m[2].trim())
    }
```

Then append:

```js
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
```

- [ ] **Step 2: Run them.** `node --test scripts/build-tokens.test.mjs scripts/tailwind-theme.test.mjs`. Expected: FAIL (no `size` section yet).

- [ ] **Step 3: Add the tokens.** In `tokens/mantis.tokens.mjs`, after the `leading` section:

```js
  // Named sizes (owner-approved 2026-10-17). The source names only its icon sizes; the rest are
  // measured from Mantis's own primitives, so they are authored values. Icon names are Mantis's
  // own scale and do not match the source's: the source's icon-sm is Mantis's icon-md (16px).
  // Each becomes a runtime variable (--size-control) and w-/h-/size-/min-w-/min-h- classes.
  size: {
    'icon-3xs': '0.5rem', 'icon-2xs': '0.625rem', 'icon-xs': '{icon-xs}', 'icon-sm': '0.875rem', 'icon-md': '{icon-sm}',
    'icon-lg': '1.125rem', 'icon-xl': '{icon-md}', 'icon-2xl': '{icon-lg}', 'icon-3xl': '{icon-xl}',
    // Button's size ladder, named after its size prop; the default is the bare name.
    'control-2xs': '1rem', 'control-xs': '1.5rem', 'control-sm': '2rem', control: '2.25rem', 'control-lg': '2.5rem',
    'control-xl': '3rem', 'control-cta': '3.25rem', 'control-2xl': '3.5rem', 'control-3xl': '4rem',
    // The large field and the command palette: 44px, the accessible touch size.
    tap: '2.75rem',
  },
```

- [ ] **Step 4: Emit them.** In `scripts/build-tokens.mjs` `buildCss`, after the `--duration-*` line in the default block:

```js
    // Sizes are plain variables on the default block, like durations; the theme keys below read them.
    if (!block.accent && block.mode === first) lines.push(...Object.entries(t.size ?? {}).map(([key, value]) => `  --size-${key}: ${cssValue(t, value)};`))
```

and in the `theme` array, after the `--leading-*` line:

```js
    // Width, height, size and the two minimums each have their own Tailwind family, so a size never becomes a spacing step.
    ...Object.keys(t.size ?? {}).flatMap((key) => ['width', 'height', 'size', 'min-width', 'min-height'].map((family) => `  --${family}-${key}: var(--size-${key});`)),
```

- [ ] **Step 5: Regenerate and run.** `node scripts/build-tokens.mjs && node --test scripts/build-tokens.test.mjs scripts/tailwind-theme.test.mjs`. Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add tokens/mantis.tokens.mjs tokens/mantis.tokens.json scripts/build-tokens.mjs scripts/build-tokens.test.mjs scripts/tailwind-theme.test.mjs app/globals.css registry/mantis-theme.css
git commit -m "feat(tokens): icon, control and tap sizes as named tokens"
```

---

### Task 4: mantis-check suggests the size tokens and guards an outdated theme

**Files:**
- Modify: `scripts/build-check.mjs` (`checkData`: add `sizes`)
- Modify: `scripts/check/mantis-check.template.mjs` (size suggestions; theme-key guard in `checkEntry`)
- Test: `scripts/mantis-check.test.mjs`

**Interfaces:**
- Consumes: `tokens.size` (Task 3) and the class names `<prefix>-<size key>`.
- Produces: `DATA.sizes` (`{ 'icon-sm': 14, control: 36, tap: 44, … }`); fixes such as `→ h-control (36px, Mantis's control height)`; a finding with rule `unresolved` when app code uses a size token that the app's `mantis-theme.css` does not define.

- [ ] **Step 1: Write the failing tests.** Append to `scripts/mantis-check.test.mjs`:

```js
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
```

- [ ] **Step 2: Run them.** `node scripts/build-check.mjs && node --test scripts/mantis-check.test.mjs`. Expected: FAIL (`sizes` undefined).

- [ ] **Step 3: Data.** In `scripts/build-check.mjs` `checkData`, after `leading`:

```js
    sizes: resolved(t, t.size ?? {}),
```

- [ ] **Step 4: Suggestions.** In the template, change `stepNames` so that a size kind lists an exact size token first:

```js
// The nearest steps, written the way the author types them: `p-3 (12px) or p-4 (16px)`. A size
// that equals a named size token gets the token instead: it says what the size is for.
const SIZE_TOKEN_KINDS = new Set(['size'])
const stepNames = (kind, value, write, negative = false) => {
  if (SIZE_TOKEN_KINDS.has(kind) && !negative) {
    const named = Object.entries(DATA.sizes).filter(([, px]) => px === value).map(([key, px]) => `${write(key)} (${px}px)`)
    if (named.length) return named.join(' or ')
  }
  return nearestSteps(kind, value).map(([key, v]) => `${negative ? '-' : ''}${write(key)} (${v}${unit(kind)})`).join(' or ')
}
```

In `offScaleRule`, size classes that name a token are not numbers, so they never match its `\d` pattern; no change is needed there. Check that `asClass('h', 'control', 'size')` returns `h-control` (it does: the size kind writes `${prefix}-${key}`).

- [ ] **Step 5: The guard.** In the template, add `sizeClassesIn` after `listFiles`. It scans `components/ui` too, whatever `--include-ui` says, because an updated primitive is exactly what can outrun the theme. Then `checkEntry` reads the theme file the entry imports and reports each size class it does not define:

```js
// A size token only has CSS if the app's copy of the theme defines it. An app that updates a
// component but not the theme gets a class with no CSS, and the control collapses without an error.
const SIZE_CLASS = new RegExp(`^(?:w|h|size|min-w|min-h)-(${Object.keys(DATA.sizes).map((k) => k.replace(/[-]/g, '\\-')).join('|')})$`)
export function sizeClassesIn(cwd) {
  const seen = new Map()
  for (const path of listFiles(cwd, { includeUi: true })) {
    if (path.endsWith('.css')) continue
    for (const c of extractCandidates(readFileSync(path, 'utf8'))) {
      const m = c.base.match(SIZE_CLASS)
      if (m && !seen.has(c.base)) seen.set(c.base, { file: relative(cwd, path), line: c.line, col: c.col, key: m[1] })
    }
  }
  return seen
}
```

and inside `checkEntry`, after the wiring check:

```js
  const themeImport = lines.map((line) => line.match(/@import\s+["']([^"']*mantis-theme\.css)["']/)).find(Boolean)
  if (themeImport) {
    const themePath = resolve(dirname(entry), themeImport[1])
    const theme = existsSync(themePath) ? readFileSync(themePath, 'utf8') : ''
    for (const [cls, at] of sizeClassesIn(cwd)) {
      const family = { w: 'width', h: 'height', size: 'size', 'min-w': 'min-width', 'min-h': 'min-height' }[cls.slice(0, cls.length - at.key.length - 1)]
      if (!theme.includes(`--${family}-${at.key}:`)) findings.push({ file: at.file, line: at.line, col: at.col, rule: 'unresolved', value: cls, fix: `→ the app's mantis-theme.css predates this size token, so ${cls} has no CSS; reinstall the theme: npx shadcn@latest add @mantis/base --overwrite` })
    }
  }
```

Add `dirname` to the template's `node:path` import line in `scripts/build-check.mjs` (`renderCheck`): `"import { join, relative, resolve, extname, dirname } from 'node:path'"`.

- [ ] **Step 6: Regenerate and run.** `node scripts/build-check.mjs && node --test scripts/mantis-check.test.mjs`. Expected: PASS, all earlier tests still passing.

- [ ] **Step 7: Commit**

```bash
git add scripts/build-check.mjs scripts/check/mantis-check.template.mjs scripts/mantis-check.test.mjs registry/check/mantis-check.mjs
git commit -m "feat(check): suggest the size tokens, and report a theme too old for them"
```

---

### Task 5: Rename sizes in the primitives

**Files:**
- Modify: `components/ui/button.tsx`, `toggle.tsx`, `select.tsx`, `input.tsx`, `input-group.tsx`, `tabs.tsx`, plus every primitive with a glyph size: `avatar.tsx`, `badge.tsx`, `checkbox.tsx`, `combobox.tsx`, `dropdown-menu.tsx`, `icon-tile.tsx`, `kbd.tsx`, `media-tile.tsx`, `radio-group.tsx`
- Create (not committed): `.paper-build/size-icon-codemod.mjs`

**Interfaces:**
- Consumes: class names from Task 3.

- [ ] **Step 1: Glyph sizes, by script.** A glyph size is a `size-N` inside an `svg` selector (`[&_svg]:size-3`, `[&_svg:not([class*='size-'])]:size-4`, `[&>svg]:size-2`) or in an `<Icon … className="…">`. Write `.paper-build/size-icon-codemod.mjs`:

```js
// One-off: glyph sizes become icon tokens. Only inside svg selectors and <Icon> classNames.
import { readFileSync, writeFileSync } from 'node:fs'
const ICON = { 2: '3xs', '2.5': '2xs', 3: 'xs', '3.5': 'sm', 4: 'md', '4.5': 'lg', 5: 'xl', 6: '2xl', 7: '3xl' }
const swap = (n) => (n in ICON ? `size-icon-${ICON[n]}` : `size-${n}`)
for (const file of process.argv.slice(2)) {
  const before = readFileSync(file, 'utf8')
  const after = before
    // An svg selector, which may hold a bracket of its own: [&_svg:not([class*='size-'])]:size-4
    .replace(/(\[(?:[^[\]\s]|\[[^\]]*\])*?svg(?:[^[\]\s]|\[[^\]]*\])*\]:)size-([\d.]+)\b/g, (_, sel, n) => sel + swap(n))
    .replace(/<Icon\b[^>]*?className=(\{cn\()?["'`][^"'`]*/g, (tag) => tag.replace(/(?<![\w:-])size-([\d.]+)\b/g, (_, n) => swap(n)))
  if (after !== before) { writeFileSync(file, after); console.log(`updated ${file}`) }
}
```

Run: `node .paper-build/size-icon-codemod.mjs components/ui/*.tsx`, then review `git diff components/ui`. Every changed class must sit inside an svg selector or an `<Icon>` className, and none may be a box (avatar badge circle `size-2.5`/`size-3`, checkbox box `size-4.5`, radio dot) — those keep their classes.

- [ ] **Step 2: Control heights, by hand.** Apply exactly this table. Each pair is old class → new class, at the line shown (line numbers from 2026-10-17; find by the variant name if they moved).

| File | Where | Old → New |
|---|---|---|
| `button.tsx` | size `"2xs"` | `h-4` → `h-control-2xs` |
| | size `xs` | `h-6` → `h-control-xs` |
| | size `sm` | `h-8` → `h-control-sm` |
| | size `default` | `h-9` → `h-control` |
| | size `lg` | `h-10` → `h-control-lg` |
| | size `xl` | `h-12` → `h-control-xl` |
| | size `cta` | `h-13` → `h-control-cta` |
| | size `"2xl"` | `h-14` → `h-control-2xl` |
| | size `"3xl"` | `h-16` → `h-control-3xl` |
| | size `"icon-xs"` | `size-6` → `size-control-xs` |
| | size `"icon-sm"` | `size-8` → `size-control-sm` |
| | size `icon` | `size-9` → `size-control` |
| | size `"icon-lg"` | `size-10` → `size-control-lg` |
| `toggle.tsx` | size `default` | `h-8 min-w-8` → `h-control-sm min-w-control-sm` |
| | size `lg` | `h-10 min-w-10` → `h-control-lg min-w-control-lg` |
| `select.tsx:44` | trigger | `data-[size=default]:h-10` → `data-[size=default]:h-control-lg`; `data-[size=sm]:h-8` → `data-[size=sm]:h-control-sm` |
| `select.tsx:120` | item row | `h-8` → `h-control-sm` |
| `input.tsx:22` | field | `data-[size=default]:h-10` → `data-[size=default]:h-control-lg`; `data-[size=lg]:h-11` → `data-[size=lg]:h-tap`; `file:h-6` → `file:h-control-xs` |
| `input-group.tsx:17` | group | `h-10` → `h-control-lg` |
| `input-group.tsx:75` | button size `xs` | `h-6` → `h-control-xs` |
| `tabs.tsx:66` | default list | `group-data-[variant=default]/tabs-list:h-8` → `…:h-control-sm` |
| `tabs.tsx:68` | pill list | `group-data-[variant=pill]/tabs-list:h-10` → `…:h-control-lg` |

Unchanged on purpose: toggle `sm` (`h-7 min-w-7`), tabs `line` (`h-13`), tabs indicator (`h-0.5`), switch `lg` (`w-9`), badges, kbd, checkbox and radio boxes, avatar and icon-tile boxes.

- [ ] **Step 3: Gates.** `npm run lint && npx tsc --noEmit && npm test`. Expected: all pass. (`scripts/registry-meta.test.mjs` passes: the new classes read `--size-*`, not `--mantis-*`.)

- [ ] **Step 4: Commit**

```bash
git add components/ui
git commit -m "refactor(ui): icon and control sizes use the size tokens"
```

---

### Task 6: Rename sizes in the blocks, and the docs

**Files:**
- Modify: `registry/*.tsx` (glyph sizes by the Task 5 script; the control heights below)
- Modify: `usage/icon.usage.mjs` (rule `inherit-size-and-color`)
- Modify: `scripts/build-agents.mjs` (Tokens: size line)
- Modify: `CLAUDE.md` (Token rules: the size tokens and their provenance)

- [ ] **Step 1: Glyph sizes.** `node .paper-build/size-icon-codemod.mjs registry/*.tsx`, then review `git diff registry` with the same rule as Task 5 Step 1. Expected: about 20 `<Icon>` sizes change (`size-3.5`, `size-4.5`, `size-4`, `size-5`), and `asset-library-page.tsx:214` (`Skeleton h-3.5`) does not.

- [ ] **Step 2: Off-scale control heights in blocks.**

| File:line | Old → New | Why |
|---|---|---|
| `agent-approval-card.tsx:212` | `h-9` → `h-control` | a field in the card |
| `app-shell-sidebar.tsx:56` | `h-9` → `h-control` | nav row that is the button |
| `canvas-shell.tsx:172` | `h-9` → `h-control` | layer row that is the button |
| `settings-nav.tsx:39` | `h-9` → `h-control` | nav row that is the button |
| `video-player.tsx:58` | `size-9` → `size-control` | icon buttons |
| `video-player.tsx:145`, `:152` | `h-9` → `h-control` | scrub and volume sliders |
| `compare-slider.tsx:68` | `size-9` → `size-control` | drag handle |
| `command-palette.tsx:214` | `h-11` → `h-tap` | the search field |
| `canvas-shell.tsx:345` | `h-11` → `h-tap` | floating toolbar of controls |

Unchanged on purpose: `plan-matrix.tsx:169` (table row), `settings-section.tsx:84` (icon box), `upload-dropzone.tsx:135` (icon circle), `workflow-canvas.tsx:178` (fixed text width), `plan-matrix.tsx` `h-6.5`, sample-content placements.

- [ ] **Step 3: Icon guide.** In `usage/icon.usage.mjs`, rule `inherit-size-and-color`, change `do` to: `'Let the icon take its size and color from the text beside it, so it sits in line with its label. When it needs its own size, use a size token (size-icon-sm 14px, size-icon-md 16px…).'`

- [ ] **Step 4: AGENTS.md size line.** In `scripts/build-agents.mjs`, after the spacing line:

```js
  if (t.size) p(`- **Sizes** (\`size-\` \`h-\` \`w-\` \`min-w-\` \`min-h-\`): icons ${Object.keys(t.size).filter((k) => k.startsWith('icon-')).map((k) => code(k.slice(5))).join(' ')} (\`size-icon-sm\` 14px); controls \`control-2xs\`…\`control-3xl\`, Button's own sizes (\`h-control\` 36px); \`tap\` 44px.`)
```

- [ ] **Step 5: CLAUDE.md.** Under "Token rules", add: `- **Sizes (owner-approved 2026-10-17):** icon, control and tap sizes are tokens (\`tokens.size\`). Five icon sizes alias the source's icon tokens under Mantis's own names (the source's \`icon-sm\` is Mantis's \`icon-md\`); 8, 10, 14 and 18px icons, the control ladder and the 44px tap target are measured from Mantis's primitives and authored. Panel widths and breakpoints are not tokens yet.`

- [ ] **Step 6: Regenerate and gates.**

```bash
node scripts/build-tokens.mjs && node scripts/build-llms.mjs && node scripts/build-usage.mjs && node scripts/build-agents.mjs && node scripts/build-check.mjs && npm run registry:build
npm test && npm run lint && npx tsc --noEmit
```

Expected: all pass; AGENTS.md under 26,000 bytes.

- [ ] **Step 7: Commit**

```bash
git add -A registry usage scripts/build-agents.mjs CLAUDE.md AGENTS.md registry/MANTIS.md public tokens app/globals.css
git commit -m "refactor(blocks): icon and control sizes use the size tokens; docs list them"
```

---

### Task 7: Prove nothing moved, then ship 1.7.0

**Files:** none new.

- [ ] **Step 1: Measure "after".**

```bash
npm run build-storybook -- -o .paper-build/sb-after --quiet
node scripts/story-geometry.mjs capture .paper-build/sb-after .paper-build/geometry-after.json
node scripts/story-geometry.mjs compare .paper-build/geometry-before.json .paper-build/geometry-after.json .paper-build/geometry-before-2.json
```

Expected: `0 changed`. Any `CHANGED` story is a misspelt or wrong token: fix it at the source and measure again. Noisy stories are listed; look at each noisy story's screenshot in Storybook rather than trusting it blind.

- [ ] **Step 2: The Quill CLI's view of the theme.** Run the CLI's own token reading on the old and new `public/r/base.json` (CLAUDE.md rule) and confirm spacing, radius and type sizes are unchanged:

```bash
git show main:public/r/base.json > .paper-build/base-main.json
node --input-type=module -e '
import { readFileSync } from "node:fs"
import { parseCssTokens } from "/Users/ryanphillips/projects/quill-cli/src/connectors/css-tokens.mjs"
import { allowedValues } from "/Users/ryanphillips/projects/quill-cli/src/design/values.mjs"
const view = (file) => { const item = JSON.parse(readFileSync(file, "utf8")); const modes = {}; for (const f of item.files) if (/\.css$/.test(f.path)) for (const [m, v] of Object.entries(parseCssTokens(f.content))) Object.assign((modes[m] ??= {}), v); const a = allowedValues({ tokens: { modes } }); return JSON.stringify([[...a.spaces.keys()].sort((x, y) => x - y), [...a.radii.keys()].sort((x, y) => x - y), [...a.textSizes.keys()].sort((x, y) => x - y), a.spaceUnit]) }
const before = view(".paper-build/base-main.json"), after = view("public/r/base.json")
console.log(before === after ? "CLI view unchanged" : `CLI view CHANGED\n${before}\n${after}`)'
```

Expected: `CLI view unchanged`. If the `--size-*` names change what the CLI allows, stop and report it.

- [ ] **Step 3: Full gates.** Stop any `npm run storybook`, then `npm test && npm run lint && npx tsc --noEmit && npm run test-storybook`. Expected: all pass. A single story failing once and passing on rerun is a known flake (follow-up 5); a story that fails twice is real.

- [ ] **Step 4: Show the owner the before/after and the test results, and wait for their OK.**

- [ ] **Step 5: Bump and squash into main.**

```bash
git switch main
git merge --squash size-tokens
npm run version:bump -- minor "Size tokens: icons (size-icon-3xs…3xl, 8–28px), controls (h-control-2xs…3xl, Button's own ladder) and the 44px tap target (h-tap) are named tokens, and the primitives and blocks use them. Same pixels. mantis-check suggests them (h-9 → h-control) and reports a theme file too old for them."
node scripts/build-tokens.mjs && node scripts/build-llms.mjs && node scripts/build-usage.mjs && node scripts/build-agents.mjs && node scripts/build-check.mjs && npm run registry:build
npm test
git add -A && git commit -F - <<'MSG'
feat(tokens): icon, control and tap sizes as named tokens (1.7.0)

Icons (size-icon-3xs…3xl, 8–28px), controls (h-control-2xs…3xl, Button's
own ladder) and the 44px tap target (h-tap) are named tokens, wired to
Tailwind's width, height, size and minimum families so they never become
spacing steps. The primitives and blocks use them; every story measures
the same before and after (scripts/story-geometry.mjs). mantis-check
suggests them (h-9 → h-control) and reports a theme file too old for them.
AGENTS.md writes a compound component's shared prefix once.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
MSG
```

- [ ] **Step 6: After the owner says push:** `git tag -a v1.7.0 -m 1.7.0 && git push origin main v1.7.0`; wait for the Vercel production build to report Ready; confirm `https://mantisdesignsystem.com/llms.txt` shows 1.7.0 and `/r/base.json` contains `--height-control`.

- [ ] **Step 7: Paper sync** (CLAUDE.md: a changed token is followed by a Paper sync once live). With Paper open on "Mantis Design System": read the existing tokens (`get_tokens`), add a size group with the 19 tokens (`create_tokens`), and update Foundations if it draws sizes. Component boards need no change: nothing visible moved. If Paper is not running, report that the size tokens are behind in Paper rather than calling the release synced.

---

## Follow-ups this plan does not do

- Panel and menu widths (128–720px): one pass to name each width's job, then tokens.
- Breakpoints: wire the source's four (320, 768, 1280, 1920px); this changes when `sm:` and `lg:` switch, so it needs its own visual review.
- On-scale control heights in blocks (`h-8`, `h-10` rows) and the stories: the repo lint-review follow-up.
- Toggle `sm` (28px) and the tabs `line` bar (52px) sit off the ladder; decide whether they get tokens.
