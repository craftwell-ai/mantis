/**
 * Drift audit — the "watch" step of the self-healing loop, kept deliberately
 * narrow and deterministic (no AI judgment, so no noise). TEMPLATE, copied
 * verbatim into every generated client repo's scripts/ directory and run via
 * templates/ci/drift-audit.yml.
 *
 * Reports the time-based drift that per-PR CI can't catch: dependency
 * freshness, security advisories, and release housekeeping. Read-only — it
 * never edits anything. Run locally with `node scripts/drift-audit.mjs`, or
 * weekly via the scheduled workflow.
 *
 * Exit code: 0 normally; 1 only when there is an *actionable* HIGH or CRITICAL
 * security advisory — one with a real, non-major fix available. So a scheduled
 * run turns red (and notifies) on security drift that can actually be acted
 * on, but stays quiet for routine outdatedness and for advisories whose only
 * "fix" is a breaking major (deliberately held) — no weekly false alarms. The
 * invariant checks that CAN be deterministic per-PR (intent tags, generated-
 * file sync, changelog, registry file paths) live in this template's own test
 * suite (scripts/*.test.mjs) and run on every PR instead.
 *
 * Ported from Quill DS's scripts/drift-audit.mjs. The dependency/audit/
 * changelog logic below is already package-agnostic (it only reads this
 * repo's own package.json, CHANGELOG.md, and git tags), so the only change is
 * the report title, generalized off "Quill" to the consuming package's own
 * name so the ported output never mentions a system that isn't this one.
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

// npm outdated / audit exit non-zero by design; capture output regardless.
function jsonCmd(cmd) {
  try {
    return JSON.parse(execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) || '{}')
  } catch (e) {
    try {
      return JSON.parse(e.stdout?.toString() || '{}')
    } catch {
      return {}
    }
  }
}

const out = []
const p = (s = '') => out.push(s)

p(`# ${pkg.name} drift audit`)
p()
p(`Version \`${pkg.version}\`.`)
p()

// --- Dependencies ---
const outdated = jsonCmd('npm outdated --json')
const names = Object.keys(outdated)
p('## Dependencies')
p()
if (names.length === 0) {
  p('All dependencies current.')
} else {
  const major = names.filter((n) => outdated[n].current?.split('.')[0] !== outdated[n].latest?.split('.')[0])
  p(`${names.length} package(s) behind latest (${major.length} major):`)
  p()
  for (const n of names) {
    const o = outdated[n]
    const isMajor = o.current?.split('.')[0] !== o.latest?.split('.')[0]
    p(`- \`${n}\` ${o.current} → ${o.latest}${isMajor ? ' **(major)**' : ''}`)
  }
}
p()

// --- Security ---
const audit = jsonCmd('npm audit --json')
const vulns = audit.metadata?.vulnerabilities ?? {}
const total = vulns.total ?? 0

// A high/critical advisory is *actionable* if npm offers a real fix that isn't a
// breaking major (major "fixes" are usually a nonsensical downgrade or a held
// upgrade). Only actionable advisories fail the run.
const actionable = []
const held = []
for (const [name, adv] of Object.entries(audit.vulnerabilities ?? {})) {
  if (adv.severity !== 'high' && adv.severity !== 'critical') continue
  const fix = adv.fixAvailable
  const isActionable = fix === true || (fix && typeof fix === 'object' && !fix.isSemVerMajor)
  ;(isActionable ? actionable : held).push(name)
}

p('## Security')
p()
if (total === 0) {
  p('No known advisories.')
} else {
  p(`${total} advisory/advisories: ` + ['critical', 'high', 'moderate', 'low', 'info'].filter((s) => vulns[s]).map((s) => `${vulns[s]} ${s}`).join(', ') + '.')
  if (actionable.length) p(`\n**${actionable.length} actionable high/critical (${actionable.join(', ')}) — this run fails.**`)
  if (held.length) p(`\n${held.length} high/critical with no non-major fix (${held.join(', ')}) — reported, not failing; held pending upstream.`)
}
p()

// --- Housekeeping ---
p('## Housekeeping')
p()
const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8')
const hasChangelog = changelog.includes(`## [${pkg.version}]`)
let hasTag = null
try {
  hasTag = execSync(`git tag -l v${pkg.version}`, { cwd: root, encoding: 'utf8' }).trim() === `v${pkg.version}`
} catch {
  hasTag = null // git/tags unavailable — don't assert
}
p(`- CHANGELOG entry for v${pkg.version}: ${hasChangelog ? '✓' : '✗ missing'}`)
p(`- git tag v${pkg.version}: ${hasTag === null ? '— (tags not available)' : hasTag ? '✓' : '✗ missing'}`)
p()

const report = out.join('\n')
console.log(report)

// Mirror to the GitHub Actions step summary when present.
if (process.env.GITHUB_STEP_SUMMARY) {
  try {
    execSync(`cat >> "${process.env.GITHUB_STEP_SUMMARY}"`, { input: report + '\n', stdio: ['pipe', 'ignore', 'ignore'] })
  } catch {
    /* best-effort */
  }
}

process.exit(actionable.length > 0 ? 1 : 0)
