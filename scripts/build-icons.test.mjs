import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

import { ICON_NAMES } from './icons.manifest.mjs'
import { ICON_SOURCE_DIR, ICONS_MODULE_PATH, parseSvg, readIcon, renderIconsModule } from './build-icons.mjs'

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
