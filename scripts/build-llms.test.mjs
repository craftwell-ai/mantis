import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { renderLlms, renderLlmsTokens, renderLlmsComponents, LLMS_PATH, LLMS_TOKENS_PATH, LLMS_COMPONENTS_PATH } from './build-llms.mjs'
import { INTENT_TAG_NAMES } from './registry-intent-tags.mjs'
import { ALL_USAGE } from '../usage/index.mjs'
import { tokens } from '../tokens/mantis.tokens.mjs'

test('rendered llms.txt follows the llmstxt.org shape', () => {
  const txt = renderLlms()
  assert.match(txt, /^# /, 'must start with H1')
  assert.match(txt, /\n> /, 'must carry the blockquote summary')
  assert.match(txt, /\n## Docs\n/)
  assert.ok(txt.includes('/llms-tokens.txt') && txt.includes('/llms-components.txt'), 'the index links both catalogs')
  for (const part of [renderLlmsTokens(), renderLlmsComponents()]) {
    assert.match(part, /^# /, 'each catalog starts with H1')
    assert.match(part, /\n> /, 'each catalog carries a summary')
  }
})

test('every registry block, primitive and intent tag appears', () => {
  const txt = renderLlms()
  const registry = JSON.parse(readFileSync(new URL('../registry.json', import.meta.url), 'utf8'))
  for (const b of registry.items.filter((i) => i.type === 'registry:block')) {
    assert.ok(txt.includes(`/r/${b.name}.json`), `missing block '${b.name}'`)
  }
  for (const u of registry.items.filter((i) => i.type === 'registry:ui')) {
    assert.ok(txt.includes(`/r/${u.name}.json`), `missing primitive '${u.name}'`)
  }
  for (const g of ALL_USAGE) assert.ok(txt.includes(`/usage/${g.name}.md`), `missing usage guide '${g.name}'`)
  const components = renderLlmsComponents()
  for (const u of registry.items.filter((i) => i.type !== 'registry:base')) {
    assert.ok(components.includes(`/r/${u.name}.json`), `llms-components.txt is missing '${u.name}'`)
  }
  for (const tag of INTENT_TAG_NAMES) assert.ok(components.includes(`\`${tag}\``), `missing tag '${tag}'`)
})

test('states the differentiated WCAG contract, no Quill residue', () => {
  const txt = renderLlms() + renderLlmsTokens()
  assert.match(txt, /4\.5:1/)
  assert.match(txt, /3:1/)
  assert.ok(!/quill|Dawn|Dusk/i.test(txt), 'Quill residue leaked into the template')
})

test('names every theme and accent, and the source layer when there is one', () => {
  const multi = {
    ...tokens,
    modes: ['light', 'dark', 'dim'],
    accents: { sunset: {} },
    source: { palette: { blue: { $type: 'color', $value: '#1F5FAD' } } },
  }
  const txt = renderLlms(multi) + renderLlmsTokens(multi)
  for (const mode of multi.modes) assert.ok(txt.includes(`\`${mode}\``), `theme '${mode}' is not named`)
  assert.ok(txt.includes('`sunset`') && txt.includes('data-accent'), 'the accent and how to select it are not named')
  assert.ok(txt.includes(`--${tokens.meta.name}-<group>-<token>`), 'the source layer naming rule is not stated')
})

test('public/llms.txt exists and is in sync (byte equality)', () => {
  // Ported from Skill 2 (design-system-bespoke), where a final review measured
  // the hole. The existence half is a gate in its own right: this test used to
  // open with `if (!existsSync(LLMS_PATH)) return`, which made an ABSENT
  // llms.txt pass silently. In THIS package the guard is dead code (the file
  // is committed), but in a GENERATED CLIENT REPO it was live and pointing the
  // wrong way — SKILL.md Step 4 deliberately does not copy the template's
  // llms.txt, so between Step 4 and Step 4e a client repo has no
  // `public/llms.txt` at all and the full suite reported all-pass over that
  // hole. SKILL.md Step 4e and the error table both already name this exact
  // failure mode ("build-llms.test.mjs skips its byte-equality check when
  // public/llms.txt is absent — so a repo with no llms.txt passes both"); this
  // closes it in the test rather than leaving it to a documented warning. The
  // only window where it now fails is Steps 4–4d, where SKILL.md Step 4b and
  // references/ingestion.md §6f both already say not to run the full suite.
  assert.ok(
    existsSync(LLMS_PATH),
    'public/llms.txt does not exist — run node scripts/build-llms.mjs (SKILL.md Step 4e). It is a CORE artifact: it is the file that tells a consuming agent how this registry works.',
  )
  assert.equal(readFileSync(LLMS_PATH, 'utf8'), renderLlms(), 'public/llms.txt is stale — run node scripts/build-llms.mjs')
  assert.equal(readFileSync(LLMS_TOKENS_PATH, 'utf8'), renderLlmsTokens(), 'public/llms-tokens.txt is stale — run node scripts/build-llms.mjs')
  assert.equal(readFileSync(LLMS_COMPONENTS_PATH, 'utf8'), renderLlmsComponents(), 'public/llms-components.txt is stale — run node scripts/build-llms.mjs')
})

test('a single-theme system says so instead of describing islands', () => {
  const txt = renderLlms({ ...tokens, modes: ['dark'] })
  assert.match(txt, /One theme: `dark`/)
  assert.ok(!/Islands of a non-default theme/.test(txt), 'islands only make sense with two or more themes')
  assert.ok(!/light block/i.test(txt), 'there is no light block to describe')
})
