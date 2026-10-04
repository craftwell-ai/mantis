/**
 * Reads each primitive's public API straight from components/ui with the
 * TypeScript checker: its exports, and for each exported component the props
 * Mantis itself defines (cva variants and hand-written props), with the
 * allowed values of every string-union prop.
 *
 * Props inherited from Base UI or the DOM are left out on purpose: agents
 * already know those, and listing them would bury the Mantis-specific ones.
 */
import { readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const UI = join(root, 'components', 'ui')

// Where a prop must be declared to count as "defined by Mantis".
const OWN = (file) => file.startsWith(UI) || file.includes('/class-variance-authority/')

// Unions come back in the checker's internal order; source order reads better
// (a cva block lists default first, then by emphasis).
const bySourceOrder = (text) => (a, b) => {
  const at = (v) => {
    const i = text.search(new RegExp(`["']?\\b${v.replace(/[-]/g, "\\-")}["']?\\s*:`))
    return i < 0 ? Infinity : i
  }
  return at(a) - at(b)
}

function literalValues(type) {
  const parts = type.isUnion() ? type.types : [type]
  const values = parts.filter((t) => t.isStringLiteral()).map((t) => t.value)
  const onlyLiterals = parts.every((t) => t.isStringLiteral() || t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null))
  return onlyLiterals && values.length > 1 ? values : null
}

export function readComponentApi() {
  const files = readdirSync(UI)
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => join(UI, f))
  const configPath = ts.findConfigFile(root, ts.sys.fileExists, 'tsconfig.json')
  const { config } = ts.readConfigFile(configPath, ts.sys.readFile)
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, root)
  const program = ts.createProgram(files, options)
  const checker = program.getTypeChecker()

  const api = {}
  for (const file of files) {
    const name = file.slice(UI.length + 1, -'.tsx'.length)
    if (name.endsWith('.generated')) continue
    const source = program.getSourceFile(file)
    const moduleSymbol = checker.getSymbolAtLocation(source)
    if (!moduleSymbol) continue
    const exports = checker.getExportsOfModule(moduleSymbol).map((s) => s.getName()).sort()
    const props = {}
    for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
      const exportName = symbol.getName()
      // Components are PascalCase; helpers like buttonVariants are skipped.
      if (!/^[A-Z]/.test(exportName)) continue
      const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
      const type = checker.getTypeOfSymbolAtLocation(target, source)
      const [signature] = type.getCallSignatures()
      const param = signature?.getParameters()[0]
      if (!param) continue
      const own = []
      for (const prop of checker.getTypeOfSymbolAtLocation(param, source).getProperties()) {
        const declFile = prop.declarations?.[0]?.getSourceFile().fileName ?? ''
        if (!OWN(declFile)) continue
        const propType = checker.getTypeOfSymbolAtLocation(prop, source)
        const values = literalValues(checker.getNonNullableType(propType))?.sort(bySourceOrder(source.text))
        let type = checker.typeToString(checker.getNonNullableType(propType))
        // The checker expands React.ReactNode into a long union; the type as
        // written ("ReactNode") is what an agent needs to read.
        const written = prop.declarations?.[0]?.type?.getText()
        if (/ReactElement/.test(type) && written) type = written.replace(/\bReact\./g, '').replace(/\s+/g, ' ')
        own.push(values ? { name: prop.getName(), values } : { name: prop.getName(), type })
      }
      if (own.length) props[exportName] = own
    }
    api[name] = { exports, props }
  }
  return api
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(readComponentApi(), null, 2))
}
