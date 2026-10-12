import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { ICON_NAMES } from './icons.manifest.mjs'
import { ICON_SOURCE_DIR, ICONS_MODULE_PATH, PUBLIC_ICONS_DIR, parseSvg, readIcon, renderIconsModule, renderPublicIcons } from './build-icons.mjs'

test('every manifest name is a real Material Symbols (Rounded) icon', () => {
  assert.ok(
    existsSync(ICON_SOURCE_DIR),
    `${ICON_SOURCE_DIR} is missing — @material-symbols/svg-300 is not installed. Run npm install.`,
  )
  assert.ok(ICON_NAMES.length > 0, 'scripts/icons.manifest.mjs lists no icons')
  for (const name of ICON_NAMES) {
    const { viewBox, paths } = readIcon(name)
    assert.match(viewBox, /^-?[\d.]+ -?[\d.]+ [\d.]+ [\d.]+$/, `${name}: unexpected viewBox '${viewBox}'`)
    assert.ok(paths.length > 0, `${name}: no path data`)
  }
})

test('parseSvg refuses an SVG that would render nothing', () => {
  assert.throws(() => parseSvg('<svg xmlns="http://www.w3.org/2000/svg"></svg>', 'empty'), /no viewBox/)
  assert.throws(() => parseSvg('<svg viewBox="0 0 24 24"><g/></svg>', 'pathless'), /no <path/)
  assert.deepEqual(parseSvg('<svg viewBox="0 -960 960 960"><path d="M0 0h1Z"/></svg>'), {
    viewBox: '0 -960 960 960',
    paths: ['M0 0h1Z'],
  })
})

test('the committed icon module exists and matches the manifest (byte equality)', () => {
  assert.ok(existsSync(ICONS_MODULE_PATH), `${ICONS_MODULE_PATH} does not exist — run node scripts/build-icons.mjs`)
  assert.equal(
    readFileSync(ICONS_MODULE_PATH, 'utf8'),
    renderIconsModule(),
    'the icon module is stale — run node scripts/build-icons.mjs and commit the result',
  )
})

const CLI_SKIPS = ['circle-fill', 'star_shine-fill']

test('public/icons holds exactly the shipped icons, in the shape tools read', () => {
  const files = renderPublicIcons()
  assert.ok(existsSync(PUBLIC_ICONS_DIR), 'public/icons does not exist — run node scripts/build-icons.mjs')
  assert.deepEqual(readdirSync(PUBLIC_ICONS_DIR).sort(), Object.keys(files).sort(), 'public/icons has a missing or left-over file — run node scripts/build-icons.mjs')
  for (const [name, content] of Object.entries(files)) {
    assert.equal(readFileSync(join(PUBLIC_ICONS_DIR, name), 'utf8'), content, `public/icons/${name} is stale — run node scripts/build-icons.mjs`)
  }
  const index = JSON.parse(files['index.json'])
  assert.deepEqual(index.icons, [...new Set(ICON_NAMES)].sort(), 'the index lists exactly the manifest')
  for (const name of index.icons) {
    // The limits the Quill CLI applies: it drops any other name and any larger or non-SVG file.
    // The two filled variants carry the source package's hyphenated file names, which <Icon> uses
    // as-is, so they are published truthfully and the CLI skips them until it accepts a hyphen or
    // the icons are renamed (a breaking change). No new name may join them.
    if (!CLI_SKIPS.includes(name)) assert.match(name, /^[a-z0-9_]{1,64}$/, `${name}: tools only accept lowercase letters, digits and underscores, 64 at most`)
    const svg = files[`${name}.svg`]
    assert.ok(svg.startsWith('<svg'), `${name}.svg must start with <svg`)
    assert.ok(svg.length < 20000, `${name}.svg is ${svg.length} characters; tools refuse 20,000 or more`)
    assert.ok(svg.includes(`viewBox="${index.viewBox}"`), `${name}.svg does not use the shared viewBox`)
  }
})
