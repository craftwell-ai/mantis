import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFigmaVariables, splitFigmaCollections } from './figma-variables.mjs'
import { importDtcg } from './dtcg-io.mjs'

// A stand-in for the Plugin API's figma.variables, shaped like the real
// objects: collections carry modes and variableIds; variables carry
// resolvedType, scopes and valuesByMode keyed by modeId. Values are invented.
const fakeFigma = () => {
  const collections = [
    { id: 'c1', name: 'Primitives', defaultModeId: 'm0', modes: [{ modeId: 'm0', name: 'Value' }], variableIds: ['v1', 'v2', 'v3'] },
    { id: 'c2', name: 'Theme', defaultModeId: 'm1', modes: [{ modeId: 'm1', name: 'Light' }, { modeId: 'm2', name: 'Dark' }], variableIds: ['v4', 'v6'] },
    { id: 'c3', name: 'Brand', defaultModeId: 'm3', modes: [{ modeId: 'm3', name: 'Harbor' }, { modeId: 'm4', name: 'Orchard' }], variableIds: ['v5'] },
  ]
  const variables = {
    v1: { id: 'v1', name: 'blue/600', variableCollectionId: 'c1', resolvedType: 'COLOR', scopes: ['ALL_SCOPES'], valuesByMode: { m0: { r: 0.12, g: 0.37, b: 0.68, a: 1 } } },
    v2: { id: 'v2', name: 'space/4', variableCollectionId: 'c1', resolvedType: 'FLOAT', scopes: ['GAP'], valuesByMode: { m0: 16 } },
    v3: { id: 'v3', name: 'scrim', variableCollectionId: 'c1', resolvedType: 'COLOR', scopes: ['ALL_SCOPES'], valuesByMode: { m0: { r: 0, g: 0, b: 0, a: 0.5 } } },
    v4: { id: 'v4', name: 'surface/page', description: 'Page background', variableCollectionId: 'c2', resolvedType: 'COLOR', scopes: ['FRAME_FILL'], valuesByMode: { m1: { type: 'VARIABLE_ALIAS', id: 'v1' }, m2: { r: 0.06, g: 0.07, b: 0.08, a: 1 } } },
    v5: { id: 'v5', name: 'primary', variableCollectionId: 'c3', resolvedType: 'COLOR', scopes: ['ALL_SCOPES'], valuesByMode: { m3: { type: 'VARIABLE_ALIAS', id: 'v1' }, m4: { r: 0.71, g: 0.27, b: 0.12, a: 1 } } },
    v6: { id: 'v6', name: 'lib-ref', variableCollectionId: 'c2', resolvedType: 'COLOR', scopes: ['ALL_SCOPES'], valuesByMode: { m1: { type: 'VARIABLE_ALIAS', id: 'v_lib' }, m2: { type: 'VARIABLE_ALIAS', id: 'v_lib' } } },
    v_lib: { id: 'v_lib', name: 'library-color', variableCollectionId: 'c_lib', resolvedType: 'COLOR', scopes: ['ALL_SCOPES'], valuesByMode: { m_lib: { r: 0.5, g: 0.5, b: 0.5, a: 1 } } },
  }
  return {
    variables: {
      getLocalVariableCollectionsAsync: async () => collections,
      getVariableByIdAsync: async (id) => variables[id] ? variables[id] : null,
    },
  }
}

test('every collection and every mode is read, aliases name their collection', async () => {
  const result = await readFigmaVariables(fakeFigma())
  assert.deepEqual(result.collections.map((c) => [c.name, c.modes]), [
    ['Primitives', ['Value']], ['Theme', ['Light', 'Dark']], ['Brand', ['Harbor', 'Orchard']],
  ])
  assert.deepEqual(result.collections[1].tokens.surface.page, {
    $type: 'color',
    $value: '{Primitives.blue.600}',
    $description: 'Page background',
    $extensions: { modes: { Light: '{Primitives.blue.600}', Dark: '#0F1214' } },
  })
})

test('colors become hex or rgba, floats become px, one-mode collections get plain values', async () => {
  const [primitives] = (await readFigmaVariables(fakeFigma())).collections
  assert.deepEqual(primitives.tokens.blue['600'], { $type: 'color', $value: '#1F5EAD' })
  assert.deepEqual(primitives.tokens.space['4'], { $type: 'dimension', $value: '16px' })
  assert.equal(primitives.tokens.scrim.$value, 'rgba(0, 0, 0, 0.5)')
})

test('the use_figma snippet runs on its own — no imports, no helpers outside the function', async () => {
  const code = `${readFigmaVariables.toString()}\nreturn await readFigmaVariables(figma)`
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor
  const result = await new AsyncFunction('figma', code)(fakeFigma())
  assert.equal(result.collections.length, 3)
  assert.ok(!/\?\?|\?\./.test(readFigmaVariables.toString()), 'keep to syntax the plugin sandbox has always run: no ?? or ?.')
})

test('theme modes become the system modes; brand modes become accents', async () => {
  const result = await readFigmaVariables(fakeFigma())
  assert.throws(() => splitFigmaCollections(result, { themeCollection: 'Theme' }), /Brand \(Harbor, Orchard\)/)
  const { doc, accents, defaultMode } = splitFigmaCollections(result, { themeCollection: 'Theme', accentCollection: 'Brand' })
  const { modes, source } = importDtcg({ [defaultMode]: doc })
  assert.deepEqual(modes, ['light', 'dark'])
  assert.deepEqual(source.Theme.surface.page.$modes, { dark: '#0F1214' })
  assert.equal(source.Brand.primary.$value, '{Primitives.blue.600}')
  assert.deepEqual(accents, { orchard: { source: { Brand: { primary: { $type: 'color', $value: '#B5451F' } } } } })
})

test('the only filter still resolves aliases to excluded collections', async () => {
  const result = await readFigmaVariables(fakeFigma(), ['Theme'])
  assert.equal(result.collections.length, 1)
  assert.equal(result.collections[0].name, 'Theme')
  assert.equal(result.collections[0].tokens.surface.page.$value, '{Primitives.blue.600}')
})

test('a library alias is copied as the first mode value and produces a warning', async () => {
  const result = await readFigmaVariables(fakeFigma())
  const theme = result.collections.find((c) => c.name === 'Theme')
  assert.equal(theme.tokens['lib-ref'].$value, '#808080')
  assert.ok(result.warnings.some((w) => w.match(/copied as its first mode's value/)), 'warning present for library alias')
})
