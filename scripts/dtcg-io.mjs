/**
 * DTCG in and out of the source layer.
 *
 *   importDtcg({ light: doc, dark: doc, dim: doc })  one document per mode
 *   importDtcg({ light: doc })                        one document; any token may
 *                                                     carry $extensions.modes
 *
 * Key each document by its mode's name, default mode first. The single-document
 * form is what exportDtcg writes and what figma-variables.mjs and
 * css-custom-properties.mjs produce.
 *
 * Values are normalized so everything downstream reads CSS-ready text: DTCG
 * color objects become hex (rgba() when translucent, the CSS color function for
 * other color spaces); dimension and duration objects become '16px' / '200ms'.
 * Aliases stay '{group.token}'. With `root: 'source'`, only that subtree is read
 * and the 'source.' prefix is dropped from aliases — the round trip of our own
 * export.
 *
 * KNOWN ASYMMETRY: exportDtcg writes accents to `$extensions.accents`, but
 * importDtcg never reads that key back — accents do not survive a round trip
 * through this module. No generated file claims otherwise; this is a known
 * limitation, not a bug, and nothing here should be changed to assume
 * symmetry without also adding the read side.
 */
import { modesOf, refPath, walkSource, isSemanticLeaf } from './token-model.mjs'

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// data-theme values: lowercase, and nothing a selector would need to escape.
export const modeSlug = (mode) => String(mode).trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-')

const channel = (c) => Math.round(c * 255).toString(16).padStart(2, '0').toUpperCase()

function colorText({ colorSpace, components, alpha = 1, hex }) {
  if (!colorSpace || colorSpace === 'srgb') {
    if (alpha >= 1) return hex ? hex.toUpperCase() : `#${components.map(channel).join('')}`
    const [r, g, b] = components.map((c) => Math.round(c * 255))
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  const tail = alpha < 1 ? ` / ${alpha}` : ''
  if (colorSpace === 'oklch' || colorSpace === 'oklab') return `${colorSpace}(${components.join(' ')}${tail})`
  return `color(${colorSpace} ${components.join(' ')}${tail})`
}

export function normalizeValue(value) {
  if (Array.isArray(value)) return value.map(normalizeValue)
  if (!isObject(value)) return value
  if ('colorSpace' in value && 'components' in value) return colorText(value)
  const keys = Object.keys(value)
  if (keys.length === 2 && 'value' in value && 'unit' in value) return `${value.value}${value.unit}`
  return Object.fromEntries(Object.entries(value).map(([key, part]) => [key, normalizeValue(part)]))
}

function stripRoot(value, root) {
  if (!root) return value
  if (typeof value === 'string') {
    const path = refPath(value)
    return path?.startsWith(`${root}.`) ? `{${path.slice(root.length + 1)}}` : value
  }
  if (Array.isArray(value)) return value.map((part) => stripRoot(part, root))
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([key, part]) => [key, stripRoot(part, root)]))
  return value
}

function collect(node, root, inheritedType, path, out) {
  for (const [key, child] of Object.entries(node ?? {})) {
    if (key.startsWith('$') || !isObject(child)) continue
    const type = child.$type ?? inheritedType
    const childPath = [...path, key]
    if (!('$value' in child)) {
      collect(child, root, type, childPath, out)
      continue
    }
    const token = { path: childPath, $type: type, value: stripRoot(normalizeValue(child.$value), root) }
    const modes = child.$extensions?.modes
    if (isObject(modes)) {
      token.modes = Object.fromEntries(Object.entries(modes).map(([mode, value]) => [modeSlug(mode), stripRoot(normalizeValue(value), root)]))
    }
    if (child.$description) token.$description = child.$description
    out.set(childPath.join('.'), token)
  }
  return out
}

function setLeaf(tree, path, leaf) {
  let node = tree
  for (const key of path.slice(0, -1)) node = node[key] ??= {}
  node[path[path.length - 1]] = leaf
}

export function importDtcg(docsByMode, { root } = {}) {
  const entries = Object.entries(docsByMode)
  if (!entries.length) throw new Error('importDtcg: pass at least one document, keyed by its mode name')
  const warnings = []
  const perMode = entries.map(([mode, doc]) => [modeSlug(mode), collect(root ? doc?.[root] : doc, root, undefined, [], new Map())])
  const [defaultMode, defaults] = perMode[0]

  const modes = perMode.map(([mode]) => mode)
  const addMode = (mode) => { if (!modes.includes(mode)) modes.push(mode) }
  const declared = entries.length === 1 ? entries[0][1]?.$extensions?.modes : undefined
  if (Array.isArray(declared)) declared.map(modeSlug).forEach(addMode)
  for (const token of defaults.values()) Object.keys(token.modes ?? {}).forEach(addMode)

  const source = {}
  for (const [key, token] of defaults) {
    const values = { ...token.modes }
    for (const [mode, tokensInMode] of perMode.slice(1)) {
      const other = tokensInMode.get(key)
      if (other) values[mode] = other.value
      else warnings.push(`${key} is missing from the '${mode}' document — it keeps its '${defaultMode}' value there`)
    }
    const leaf = {}
    if (token.$type) leaf.$type = token.$type
    leaf.$value = defaultMode in values ? values[defaultMode] : token.value
    const differing = Object.entries(values).filter(([mode, value]) => mode !== defaultMode && !same(value, leaf.$value))
    if (differing.length) leaf.$modes = Object.fromEntries(differing)
    if (token.$description) leaf.$description = token.$description
    setLeaf(source, token.path, leaf)
  }
  for (const [mode, tokensInMode] of perMode.slice(1)) {
    for (const key of tokensInMode.keys()) {
      if (!defaults.has(key)) warnings.push(`${key} exists only in the '${mode}' document — add it to the '${defaultMode}' document to import it`)
    }
  }
  return { modes, source, tokenCount: defaults.size, warnings }
}

export function exportDtcg(tokens) {
  const modes = modesOf(tokens)
  const [first] = modes
  // Token-module aliases are relative to tokens.source; DTCG aliases are
  // document-absolute, and the source layer lives under `source` here.
  const absolute = (value) => {
    if (typeof value === 'string') return refPath(value) === null ? value : `{source.${refPath(value)}}`
    if (Array.isArray(value)) return value.map(absolute)
    if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([key, part]) => [key, absolute(part)]))
    return value
  }
  const perMode = (type, leaf) => ({
    $type: type,
    $value: absolute(leaf[first]),
    $extensions: { modes: Object.fromEntries(modes.map((mode) => [mode, absolute(leaf[mode])])) },
  })
  // Same defect this engine's leaf detection had everywhere else: `first in
  // value` reads a GROUP as a leaf whenever a nested role key (ground.base,
  // accent.base, ...) happens to share the default mode's name. isSemanticLeaf
  // tests the value's shape (all-string vs. nested objects) instead.
  const colors = (node) =>
    Object.fromEntries(Object.entries(node).map(([key, value]) => [key, isSemanticLeaf(value) ? perMode('color', value) : colors(value)]))
  const scalars = (group, type) =>
    Object.fromEntries(Object.entries(group ?? {}).map(([key, value]) => [key, { $type: type, $value: absolute(value) }]))

  const source = {}
  walkSource(tokens.source, (path, leaf) => {
    const token = {}
    if (leaf.$type) token.$type = leaf.$type
    token.$value = absolute(leaf.$value)
    if (leaf.$modes) token.$extensions = { modes: { [first]: absolute(leaf.$value), ...absolute(leaf.$modes) } }
    if (leaf.$description) token.$description = leaf.$description
    setLeaf(source, path, token)
  })

  const doc = {
    $description: `${tokens.meta.name} design tokens (DTCG). Colors and shadows carry every mode in $extensions.modes; \`source\` holds the reference's own tokens under their own names.`,
    $extensions: { modes },
    color: colors(tokens.color),
    radius: scalars(tokens.radius, 'dimension'),
    text: scalars(tokens.text, 'dimension'),
    font: scalars(tokens.font, 'fontFamily'),
    shadow: Object.fromEntries(Object.entries(tokens.shadow ?? {}).map(([key, leaf]) => [key, perMode('shadow', leaf)])),
  }
  if (Object.keys(tokens.spacing ?? {}).length) doc.spacing = scalars(tokens.spacing, 'dimension')
  if (Object.keys(tokens.accents ?? {}).length) doc.$extensions.accents = absolute(tokens.accents)
  if (Object.keys(source).length) doc.source = source
  return doc
}
