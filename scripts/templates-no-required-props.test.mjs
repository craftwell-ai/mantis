// Every page template must render with no props at all, like a component
// dragged out of a library with its placeholder content baked in: each prop
// falls back to registry/sample-content.tsx. This reads each template's
// exported component with the TypeScript checker (as scripts/component-api.mjs
// does for primitives) and fails on any required prop, so a new required prop
// cannot slip in unnoticed.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import ts from 'typescript'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'))

// The same test scripts/build-agents.mjs uses to call a block a page template.
const isTemplate = (name) => /^app-shell|-page$|-shell$/.test(name)
const templates = registry.items.filter((item) => item.type === 'registry:block' && isTemplate(item.name))

// "studio-home-page" exports StudioHomePage.
const componentName = (name) => name.replace(/(^|-)(\w)/g, (_, __, letter) => letter.toUpperCase())

function requiredPropsByTemplate() {
  const files = templates.map((item) => join(root, item.files[0].path))
  const configPath = ts.findConfigFile(root, ts.sys.fileExists, 'tsconfig.json')
  const { config } = ts.readConfigFile(configPath, ts.sys.readFile)
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, root)
  const program = ts.createProgram(files, options)
  const checker = program.getTypeChecker()

  const result = {}
  for (const item of templates) {
    const source = program.getSourceFile(join(root, item.files[0].path))
    assert.ok(source, `could not read ${item.files[0].path}`)
    const moduleSymbol = checker.getSymbolAtLocation(source)
    const exportName = componentName(item.name)
    const symbol = checker.getExportsOfModule(moduleSymbol).find((entry) => entry.getName() === exportName)
    assert.ok(symbol, `${item.files[0].path} does not export ${exportName}`)
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
    const [signature] = checker.getTypeOfSymbolAtLocation(target, source).getCallSignatures()
    assert.ok(signature, `${exportName} is not a function component`)
    const param = signature.getParameters()[0]
    // A component with no parameter at all needs no props.
    if (!param) {
      result[item.name] = []
      continue
    }
    const props = checker.getTypeOfSymbolAtLocation(param, source).getProperties()
    result[item.name] = props.filter((prop) => !(prop.flags & ts.SymbolFlags.Optional)).map((prop) => prop.getName())
  }
  return result
}

test('the registry still has its page templates', () => {
  // Guards the filter above: if templates were renamed out of the pattern, the next test would pass on nothing.
  assert.ok(templates.length >= 12, `expected at least 12 page templates, found ${templates.map((item) => item.name).join(', ')}`)
})

test('every page template renders with no props (none are required)', () => {
  const required = requiredPropsByTemplate()
  const offenders = Object.entries(required).filter(([, props]) => props.length > 0)
  assert.deepEqual(
    offenders,
    [],
    'These templates have required props. Make each one optional and default it to sample content from registry/sample-content.tsx:\n' +
      offenders.map(([name, props]) => `  ${name}: ${props.join(', ')}`).join('\n'),
  )
})
