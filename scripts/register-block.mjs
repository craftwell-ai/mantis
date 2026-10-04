// Registers a pattern (a composition of primitives) as a registry:block:
// adds or updates its registry item with the intent tags and use_when agents
// choose by, and lists its usage guide in usage/index.mjs. Blocks are not
// added to base; consumers install them one by one.
// Usage: node scripts/register-block.mjs <name> "<Title>" "<description>" <intent,intent> "<use_when>"
import { readFileSync, writeFileSync } from 'node:fs'
import { INTENT_TAG_NAMES } from './registry-intent-tags.mjs'
import { writeUsageIndex } from './usage-index.mjs'

const [, , name, title, description, intents = '', useWhen] = process.argv
if (!name || !title || !description || !intents || !useWhen) {
  throw new Error('usage: register-block.mjs <name> <title> <description> <intent,intent> <use_when>')
}
const intent = intents.split(',').map((tag) => tag.trim())
const unknown = intent.filter((tag) => !INTENT_TAG_NAMES.includes(tag))
if (unknown.length) throw new Error(`unknown intent tag(s) ${unknown.join(', ')}; pick from: ${INTENT_TAG_NAMES.join(', ')}`)

const registry = JSON.parse(readFileSync('registry.json', 'utf8'))
const ns = `@${registry.name}`
const file = `registry/${name}.tsx`
const source = readFileSync(file, 'utf8')
// Primitives come in as @/components/ui/<name>; other blocks as ./<name>
// (relative, because shadcn rewrites @/registry paths into broken imports).
const imported = [
  ...source.matchAll(/from ["']@\/components\/ui\/([\w-]+)["']/g),
  ...source.matchAll(/from ["']\.\/([\w-]+)["']/g),
].map((m) => m[1])
// A primitive this registry does not ship (such as shadcn's stock label)
// resolves from shadcn's own registry, so it keeps its bare name.
const ours = new Set(registry.items.map((entry) => entry.name))
const registryDependencies = [...new Set(imported.filter((dep) => dep !== 'icons.generated').map((dep) => (ours.has(dep) ? `${ns}/${dep}` : dep)))]
if (source.includes('@/lib/mantis-cn')) registryDependencies.push(`${ns}/mantis-cn`)
const item = {
  name,
  type: 'registry:block',
  title,
  description,
  meta: { intent, use_when: useWhen },
  registryDependencies: registryDependencies.length ? registryDependencies : undefined,
  files: [{ path: file, type: 'registry:component' }],
}
const existing = registry.items.findIndex((entry) => entry.name === name)
if (existing >= 0) registry.items[existing] = item
else registry.items.push(item)
writeFileSync('registry.json', JSON.stringify(registry, null, 2) + '\n')
writeUsageIndex()
console.log(`registered ${ns}/${name} [${intent.join(', ')}]`, registryDependencies.length ? `(uses ${registryDependencies.join(', ')})` : '')
