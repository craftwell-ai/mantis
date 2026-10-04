import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateDtcg } from './validate-dtcg.mjs'

test('accepts a valid DTCG file', () => {
  const result = validateDtcg({
    color: {
      brand: { $type: 'color', $value: '#3B6EA8' },
      ground: { $type: 'color', $value: '#FAFAF8' },
    },
  })
  assert.equal(result.ok, true)
  assert.equal(result.format, 'dtcg')
  assert.equal(result.tokenCount, 2)
  assert.deepEqual(result.errors, [])
})

test('rejects Style Dictionary format, identifying it by name', () => {
  const result = validateDtcg({
    color: { brand: { value: '#3B6EA8' }, ground: { value: '#FAFAF8' } },
  })
  assert.equal(result.ok, false)
  assert.equal(result.format, 'style-dictionary')
  assert.match(result.errors[0], /Style Dictionary/i)
})

test('rejects a file with no tokens at all', () => {
  const result = validateDtcg({ hello: 'world' })
  assert.equal(result.ok, false)
  assert.equal(result.format, 'unknown')
  assert.equal(result.tokenCount, 0)
})

test('flags DTCG tokens missing $type as errors but still counts them', () => {
  const result = validateDtcg({ color: { brand: { $value: '#3B6EA8' } } })
  assert.equal(result.tokenCount, 1)
  assert.ok(result.errors.some((e) => e.includes('$type')), 'expected a $type warning')
})

test('a group-level $type satisfies its children (legal DTCG, must not lint)', () => {
  const result = validateDtcg({
    color: { $type: 'color', brand: { $value: '#3B6EA8' }, ground: { $value: '#FAFAF8' } },
  })
  assert.equal(result.ok, true)
  assert.equal(result.format, 'dtcg')
  assert.equal(result.tokenCount, 2)
  assert.deepEqual(result.errors, [], 'group-level $type should suppress the missing-$type lint')
})

test('a field named `value` on a group does not make the file Style Dictionary', () => {
  const result = validateDtcg({
    meta: { value: 'a plain note, not a token', color: { $value: '#FFFFFF', $type: 'color' } },
  })
  assert.equal(result.format, 'dtcg')
  assert.equal(result.ok, true)
  assert.equal(result.tokenCount, 1)
})

test('a group literally named `value` is still traversed', () => {
  const result = validateDtcg({ opacity: { value: { $value: 0.5, $type: 'number' } } })
  assert.equal(result.format, 'dtcg')
  assert.equal(result.tokenCount, 1)
})

test('a malformed node that is both token and group drops neither', () => {
  const result = validateDtcg({
    weird: { $value: '#FFFFFF', $type: 'color', nested: { $value: '#000000', $type: 'color' } },
  })
  assert.equal(result.tokenCount, 2)
})

test('a composite $value counts once and is not walked into', () => {
  const result = validateDtcg({
    shadow: { $type: 'shadow', $value: { color: '#000000', offsetX: '0', offsetY: '2px', blur: '4px' } },
  })
  assert.equal(result.tokenCount, 1)
  assert.equal(result.format, 'dtcg')
})

test('a mixed file is rejected as unknown and counts both kinds', () => {
  const result = validateDtcg({
    color: { brand: { $value: '#3B6EA8', $type: 'color' } },
    spacing: { small: { value: '4px' } },
  })
  assert.equal(result.ok, false)
  assert.equal(result.format, 'unknown')
  assert.equal(result.tokenCount, 2)
  assert.match(result.errors[0], /Mixed/)
})

test('non-object input degrades to unknown without throwing', () => {
  for (const input of [null, [], 'string', 42]) {
    const result = validateDtcg(input)
    assert.equal(result.ok, false)
    assert.equal(result.format, 'unknown')
    assert.equal(result.tokenCount, 0)
  }
})

test('a Style Dictionary token carrying an attributes object is still detected', () => {
  const result = validateDtcg({
    color: { brand: { value: '#3B6EA8', type: 'color', attributes: { category: 'color' } } },
  })
  assert.equal(result.format, 'style-dictionary')
  assert.equal(result.tokenCount, 1)
})

test('$type inheritance survives an intermediate group that declares none', () => {
  const result = validateDtcg({
    color: { $type: 'color', brand: { primary: { $value: '#3B6EA8' } } },
  })
  assert.equal(result.ok, true)
  assert.equal(result.format, 'dtcg')
  assert.equal(result.tokenCount, 1)
  assert.deepEqual(result.errors, [], 'an ancestor $type should still count two levels down')
})

test('a Style Dictionary token whose type info lives only in attributes is still detected', () => {
  const result = validateDtcg({
    color: { brand: { value: '#3B6EA8', attributes: { category: 'color', type: 'color', item: 'brand' } } },
  })
  assert.equal(result.ok, false)
  assert.equal(result.format, 'style-dictionary')
  assert.equal(result.tokenCount, 1)
  assert.match(result.errors[0], /Style Dictionary/)
})

test('object-valued metadata siblings do not disqualify a Style Dictionary leaf', () => {
  const result = validateDtcg({ color: { brand: { value: '#3B6EA8', extensions: {} } } })
  assert.equal(result.format, 'style-dictionary')
  assert.equal(result.tokenCount, 1)
})

test('a scalar `value` beside nested tokens is reported, not silently ignored', () => {
  const result = validateDtcg({
    color: { primary: { value: '#0066CC', nested: { $value: '#000000', $type: 'color' } } },
  })
  assert.equal(result.format, 'dtcg')
  assert.equal(result.tokenCount, 1)
  assert.ok(
    result.errors.some((error) => error.includes('color.primary')),
    `expected an advisory naming color.primary, got ${JSON.stringify(result.errors)}`,
  )
})
