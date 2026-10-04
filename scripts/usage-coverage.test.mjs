import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { ALL_USAGE } from '../usage/index.mjs'
import { validateUsage } from '../usage/schema.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'))
const base = registry.items.find((i) => i.type === 'registry:base')
// Everything this registry puts in front of a consumer: its own blocks and
// primitives, plus the stock shadcn components the base item installs (bare
// names; namespaced entries like @ds/icon are this registry's own items).
const COMPONENTS = [
  ...registry.items.filter((i) => i.type === 'registry:block' || i.type === 'registry:ui').map((i) => i.name),
  ...(base?.registryDependencies ?? []).filter((dep) => !dep.startsWith('@')),
]
const storyFile = (name) => join(root, 'stories', `${name}.stories.tsx`)

test('every usage guide is valid and usage/index.mjs lists every file on disk', () => {
  const onDisk = readdirSync(join(root, 'usage'))
    .filter((f) => f.endsWith('.usage.mjs'))
    .map((f) => f.slice(0, -'.usage.mjs'.length))
    .sort()
  assert.deepEqual(ALL_USAGE.map((u) => u.name).sort(), onDisk, 'usage/index.mjs is out of step with usage/*.usage.mjs')
  for (const u of ALL_USAGE) assert.deepEqual(validateUsage(u), [], `usage/${u.name}.usage.mjs is invalid`)
})

test('every component has a usage guide, and every guide is a component', () => {
  const documented = new Set(ALL_USAGE.map((u) => u.name))
  for (const name of COMPONENTS) assert.ok(documented.has(name), `component '${name}' has no usage/${name}.usage.mjs`)
  for (const u of ALL_USAGE) {
    assert.ok(COMPONENTS.includes(u.name), `usage '${u.name}' documents nothing registry.json offers`)
  }
})

test('every component has a story file', () => {
  for (const name of COMPONENTS) {
    assert.ok(existsSync(storyFile(name)), `component '${name}' has no stories/${name}.stories.tsx`)
  }
})

test("every visual rule has a rendered Do/Don't pair in its story", () => {
  for (const u of ALL_USAGE) {
    if (!existsSync(storyFile(u.name))) continue
    const source = readFileSync(storyFile(u.name), 'utf8')
    for (const r of u.rules.filter((rule) => rule.visual)) {
      assert.ok(
        source.includes(`id="${r.id}"`),
        `stories/${u.name}.stories.tsx renders no DoDontPair for visual rule '${r.id}'`,
      )
    }
  }
})
