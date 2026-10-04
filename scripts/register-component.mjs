// Registers an owned primitive: adds its registry item (or updates it), adds it
// to base's registryDependencies and lists its usage guide in usage/index.mjs.
// Usage: node scripts/register-component.mjs <name> "<title>" "<description>" [dep,dep]
import { readFileSync, writeFileSync } from 'node:fs'
import { writeUsageIndex } from './usage-index.mjs'

const [, , name, title, description, deps = ''] = process.argv
if (!name || !title || !description) throw new Error('usage: register-component.mjs <name> <title> <description> [deps]')

const registry = JSON.parse(readFileSync('registry.json', 'utf8'))
const ns = `@${registry.name}`
const file = `components/ui/${name}.tsx`
const source = readFileSync(file, 'utf8')
const registryDependencies = [...source.matchAll(/from ["']@\/components\/ui\/([\w-]+)["']/g)]
  .map((m) => m[1])
  .filter((dep) => dep !== name && dep !== 'icons.generated')
  // A primitive this registry does not ship (such as shadcn's stock label)
  // resolves from shadcn's own registry, so it keeps its bare name.
  .map((dep) => (registry.items.some((entry) => entry.name === dep) ? `${ns}/${dep}` : dep))
if (source.includes('@/lib/mantis-cn')) registryDependencies.push(`${ns}/mantis-cn`)
const item = {
  name,
  type: 'registry:ui',
  title,
  description,
  dependencies: deps ? deps.split(',') : undefined,
  registryDependencies: registryDependencies.length ? [...new Set(registryDependencies)] : undefined,
  files: [{ path: file, type: 'registry:ui' }],
}
const existing = registry.items.findIndex((entry) => entry.name === name)
if (existing >= 0) registry.items[existing] = item
else registry.items.push(item)

const base = registry.items.find((entry) => entry.type === 'registry:base')
base.registryDependencies = base.registryDependencies.filter((dep) => dep !== name)
if (!base.registryDependencies.includes(`${ns}/${name}`)) base.registryDependencies.push(`${ns}/${name}`)
writeFileSync('registry.json', JSON.stringify(registry, null, 2) + '\n')

writeUsageIndex()
console.log(`registered ${ns}/${name}`, registryDependencies.length ? `(depends on ${registryDependencies.join(', ')})` : '')
