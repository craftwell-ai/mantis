// Bumps the Mantis version everywhere it is written and adds the changelog entry, in one step.
//
//   npm run version:bump -- patch "Site footer lays out from its own width"
//   npm run version:bump -- minor "Usage chart block" "Compare slider block"
//
// patch: a fix or a change nobody installing Mantis would notice. minor: something new (a block, a
// component, a prop, a token). major: something removed, renamed or changed in a way that breaks an
// existing install; confirm that with the owner first.
//
// Run it BEFORE the build scripts: llms.txt and the token files print the version.
import { readFileSync, writeFileSync } from 'node:fs'

const [level, ...notes] = process.argv.slice(2)
if (!['patch', 'minor', 'major'].includes(level) || !notes.length) {
  console.error('Usage: npm run version:bump -- <patch|minor|major> "<what changed>" ["<what else changed>" ...]')
  process.exit(1)
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const [major, minor, patch] = pkg.version.split('.').map(Number)
const next = level === 'major' ? `${major + 1}.0.0` : level === 'minor' ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`

// Replaces the first match only, and stops if the file no longer has the line it expects.
function rewrite(file, pattern, replacement) {
  const before = readFileSync(file, 'utf8')
  if (!pattern.test(before)) throw new Error(`${file}: could not find the version line to update`)
  writeFileSync(file, before.replace(pattern, replacement))
}

const current = pkg.version.replaceAll('.', '\\.')
rewrite('package.json', new RegExp(`"version": "${current}"`), `"version": "${next}"`)
// The lock file names this package twice near the top: once for the file, once for the root package.
rewrite('package-lock.json', new RegExp(`("name": "${pkg.name}",\\s+)"version": "${current}"`), `$1"version": "${next}"`)
rewrite('package-lock.json', new RegExp(`("": \\{\\s+"name": "${pkg.name}",\\s+)"version": "${current}"`), `$1"version": "${next}"`)
rewrite('tokens/mantis.tokens.mjs', new RegExp(`version: '${current}'`), `version: '${next}'`)

const today = new Date().toISOString().slice(0, 10)
const entry = `## [${next}] - ${today}\n${notes.map((note) => `- ${note}`).join('\n')}\n\n`
rewrite('CHANGELOG.md', /^(# Changelog\n\n)/, `$1${entry}`)

console.log(`${pkg.version} -> ${next}`)
