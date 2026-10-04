/**
 * DTCG import gate (spec § Error handling): the engine only consumes W3C Design
 * Tokens Community Group format ($value/$type markers). Style Dictionary files
 * (bare `value`) are the most common near-miss in the wild — they are named
 * explicitly so the user gets a conversion pointer instead of a silent misread.
 *
 * The walk never stops early. A node that is both a token and a group is malformed,
 * but dropping its children would undercount, and an undercount here becomes a
 * silently incomplete design system.
 */
const isPlainObject = (value) => value !== null && typeof value === 'object'
const isScalar = (value) => value !== null && value !== undefined && typeof value !== 'object'

/**
 * Does this subtree contain anything that looks like a token? Used to tell a token's
 * metadata (attributes, extensions, description) from a genuine group of child tokens.
 */
const containsTokenMarker = (node) => {
  if (!isPlainObject(node)) return false
  if ('$value' in node) return true
  if (isScalar(node.value)) return true
  return Object.values(node).some((child) => containsTokenMarker(child))
}

/**
 * A Style Dictionary leaf is `{value: <scalar>, ...}`. Object-valued siblings are
 * metadata unless they contain tokens themselves — in which case this node is a GROUP
 * that merely has a field named `value`, and counting it as a token would drop the
 * real tokens underneath it. Both directions matter: misreading a group as a token
 * rejects valid DTCG, and misreading a token as a group loses the file entirely.
 */
const looksLikeStyleDictionaryLeaf = (node) => {
  if (!isScalar(node.value)) return false
  return !Object.entries(node).some(
    ([key, child]) => key !== 'value' && isPlainObject(child) && containsTokenMarker(child),
  )
}

export function validateDtcg(json) {
  let dtcgCount = 0
  let styleDictionaryCount = 0
  const errors = []

  const walk = (node, path, inheritedType) => {
    if (!isPlainObject(node)) return
    const groupType = '$type' in node && isScalar(node.$type) ? node.$type : inheritedType

    if ('$value' in node) {
      dtcgCount++
      if (!('$type' in node) && groupType === undefined) {
        errors.push(`token '${path}' has $value but no $type, and no ancestor group declares one`)
      }
    } else if (looksLikeStyleDictionaryLeaf(node)) {
      styleDictionaryCount++
    } else if (isScalar(node.value)) {
      // Ambiguous: a scalar `value` sitting beside nested tokens. The nested tokens are
      // real, so this is a group and the field is ignored — but say so out loud. A
      // legitimate group with an incidental `value` field and a malformed token with a
      // stray child are structurally identical, and guessing between them by sniffing
      // the value's contents would be worse than reporting the ambiguity.
      errors.push(
        `'${path}' has a scalar \`value\` field but also contains nested tokens, so it is treated as a group and that field is ignored — rename it if it was meant to be a token`,
      )
    }

    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) continue
      if (!isPlainObject(child)) continue
      walk(child, path ? `${path}.${key}` : key, groupType)
    }
  }

  walk(json, '', undefined)

  if (dtcgCount > 0 && styleDictionaryCount === 0) {
    // A missing $type is a lint, not a rejection: group-level $type is legal DTCG
    // and common, so the file is still usable — the error is advisory.
    return { ok: true, format: 'dtcg', tokenCount: dtcgCount, errors }
  }
  if (styleDictionaryCount > 0 && dtcgCount === 0) {
    return {
      ok: false,
      format: 'style-dictionary',
      tokenCount: styleDictionaryCount,
      errors: [
        'This is a Style Dictionary file (bare `value` keys), not DTCG (`$value`/`$type`). Convert it first — e.g. Style Dictionary v4 can emit DTCG, or rename keys to $value/$type.',
      ],
    }
  }
  if (styleDictionaryCount > 0 && dtcgCount > 0) {
    return {
      ok: false,
      format: 'unknown',
      tokenCount: dtcgCount + styleDictionaryCount,
      errors: ['Mixed $value and bare-value tokens — normalize to DTCG before import.'],
    }
  }
  return { ok: false, format: 'unknown', tokenCount: 0, errors: ['No design tokens found in this file.'] }
}
