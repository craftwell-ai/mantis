/**
 * Reads EVERY local variable collection and EVERY mode of a Figma file through
 * the Plugin API. The Figma MCP's get_variable_defs returns the default mode
 * only, so a dark or brand mode cannot be captured through it at all.
 *
 * SKILL.md Step 1 passes readFigmaVariables' source text to the Figma MCP's
 * `use_figma` tool, which runs it inside the file with no imports. Keep it
 * self-contained — every helper inside the function body — and on syntax the
 * sandbox has always accepted (no ??, ?. or ??=).
 */
import { modeSlug } from './dtcg-io.mjs'

export async function readFigmaVariables(figma, only) {
  // DTCG names cannot contain '.', '{' or '}'.
  const segment = (text) => String(text).trim().replace(/[.{}]/g, '_')
  const channel = (n) => Math.round(n * 255).toString(16).padStart(2, '0').toUpperCase()
  const colorText = (c) => {
    const alpha = c.a === undefined ? 1 : c.a
    if (alpha >= 1) return '#' + channel(c.r) + channel(c.g) + channel(c.b)
    return 'rgba(' + [c.r, c.g, c.b].map((n) => Math.round(n * 255)).join(', ') + ', ' + Math.round(alpha * 1000) / 1000 + ')'
  }
  // Figma FLOATs carry no unit; their scopes say what they are for. A FLOAT
  // left on ALL_SCOPES is read as px, the common case — correct a unitless one
  // (z-index, a count) at Gate G1.
  const typeFor = (variable) => {
    const scopes = variable.scopes || []
    if (variable.resolvedType === 'COLOR') return 'color'
    if (variable.resolvedType === 'BOOLEAN') return 'boolean'
    if (variable.resolvedType === 'STRING') return scopes.indexOf('FONT_FAMILY') >= 0 ? 'fontFamily' : 'string'
    if (scopes.indexOf('FONT_WEIGHT') >= 0) return 'fontWeight'
    if (scopes.indexOf('OPACITY') >= 0) return 'number'
    return 'dimension'
  }

  const warnings = []
  const all = await figma.variables.getLocalVariableCollectionsAsync()
  const collections = only && only.length ? all.filter((c) => only.indexOf(c.name) >= 0) : all
  const local = new Map(all.map((c) => [c.id, c]))
  const variables = new Map()
  for (const collection of collections) {
    for (const id of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(id)
      if (variable) variables.set(id, variable)
      else warnings.push(collection.name + ': variable ' + id + ' could not be read — not captured')
    }
  }
  const pathOf = (variable) => variable.name.split('/').map(segment)

  const valueFor = async (variable, raw, type) => {
    if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
      let target = variables.get(raw.id)
      if (!target) target = await figma.variables.getVariableByIdAsync(raw.id)
      if (!target) {
        warnings.push(variable.name + ': aliases a variable this file cannot read — left empty')
        return null
      }
      const home = local.get(target.variableCollectionId)
      if (!home) {
        warnings.push(variable.name + ": aliases library variable '" + target.name + "' — copied as its first mode's value")
        return valueFor(target, Object.values(target.valuesByMode)[0], type)
      }
      return '{' + [segment(home.name)].concat(pathOf(target)).join('.') + '}'
    }
    if (type === 'color') return colorText(raw)
    if (type === 'dimension') return raw + 'px'
    // Figma stores opacity values as 0–1 (matching node.opacity). A source
    // expressing opacity as 0–100 is corrected at Gate G1. Capture as-is.
    return raw
  }

  const result = { collections: [], warnings }
  for (const collection of collections) {
    const found = collection.modes.filter((mode) => mode.modeId === collection.defaultModeId)[0]
    const defaultMode = found ? found.name : collection.modes[0].name
    const tokens = {}
    for (const id of collection.variableIds) {
      const variable = variables.get(id)
      // Already warned about in the prefetch loop above, which reads the
      // exact same collection.variableIds — pushing again here duplicated
      // every unreadable-variable warning.
      if (!variable) continue
      const type = typeFor(variable)
      const byMode = {}
      for (const mode of collection.modes) byMode[mode.name] = await valueFor(variable, variable.valuesByMode[mode.modeId], type)
      const token = { $type: type, $value: byMode[defaultMode] }
      if (variable.description) token.$description = variable.description
      if (collection.modes.length > 1) token.$extensions = { modes: byMode }
      const path = pathOf(variable)
      let node = tokens
      for (const key of path.slice(0, -1)) {
        if (!node[key]) node[key] = {}
        node = node[key]
      }
      node[path[path.length - 1]] = token
    }
    result.collections.push({ name: segment(collection.name), modes: collection.modes.map((mode) => mode.name), defaultMode, tokens })
  }
  return result
}

// A brand collection's values replace the base system's per accent, so each of
// its modes becomes one flat tree of plain values.
function valuesForMode(tree, mode) {
  const out = {}
  for (const [key, node] of Object.entries(tree)) {
    if (node && typeof node === 'object' && '$value' in node) {
      const leaf = { $type: node.$type, $value: node.$extensions ? node.$extensions.modes[mode] : node.$value }
      if (node.$description) leaf.$description = node.$description
      out[key] = leaf
    } else if (node && typeof node === 'object') out[key] = valuesForMode(node, mode)
  }
  return out
}

/**
 * readFigmaVariables' result → what the token module holds. One collection's
 * modes are the system's themes (light/dark/…); at most one collection's modes
 * are brands, which become accents; every other collection must have a single
 * mode. Anything else is a question for the user, not a guess.
 */
export function splitFigmaCollections(result, { themeCollection, accentCollection } = {}) {
  const find = (name) => {
    const collection = result.collections.find((c) => c.name === name)
    if (!collection) throw new Error(`no collection named '${name}' — the file has: ${result.collections.map((c) => c.name).join(', ')}`)
    return collection
  }
  const theme = themeCollection ? find(themeCollection) : undefined
  const accent = accentCollection ? find(accentCollection) : undefined
  const unassigned = result.collections.filter((c) => c !== theme && c !== accent && c.modes.length > 1)
  if (unassigned.length) {
    throw new Error(
      `collections with several modes need a role: ${unassigned.map((c) => `${c.name} (${c.modes.join(', ')})`).join('; ')} — ` +
        'pass the theme one as themeCollection and a brand one as accentCollection',
    )
  }
  const defaultMode = theme ? theme.defaultMode : 'light'
  const doc = { $extensions: { modes: theme ? [theme.defaultMode, ...theme.modes.filter((m) => m !== theme.defaultMode)] : [defaultMode] } }
  for (const collection of result.collections) {
    doc[collection.name] = collection === accent ? valuesForMode(collection.tokens, collection.defaultMode) : collection.tokens
  }
  const accents = {}
  if (accent) {
    for (const mode of accent.modes) {
      if (mode !== accent.defaultMode) accents[modeSlug(mode)] = { source: { [accent.name]: valuesForMode(accent.tokens, mode) } }
    }
  }
  return { doc, accents, defaultMode }
}
