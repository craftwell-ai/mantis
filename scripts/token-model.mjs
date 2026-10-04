/**
 * The two-layer token model both skills share.
 *
 * SEMANTIC LAYER — tokens.color's roles plus radius, text, spacing, shadow and
 * font: the contract components and the WCAG tests rely on. Every color and
 * shadow leaf holds one value per mode ({ light, dark, … } — see modesOf).
 *
 * SOURCE LAYER — tokens.source: every token the reference defines, under its
 * own names and groups. A leaf is { $type, $value, $modes?, $description? }:
 * `$value` is the default mode's value; `$modes` lists only the modes where it
 * differs. Its CSS name is --<system name>-<group>-…-<token> (sourceVarName).
 *
 * Any value in either layer may be a DTCG alias, '{group.token}', naming a
 * source token. CSS gets var(--…), so the brand's own names stay the source of
 * truth; anything that needs a number (contrast, derivation, Storybook's
 * chrome) resolves it with resolveValue.
 *
 * ACCENTS — tokens.accents: named variants selected with data-accent. Each is
 * a partial tree ({ source?, color? }) whose leaves replace the base system's.
 */
import { luminance } from './contrast.mjs'

export const DEFAULT_MODES = ['light', 'dark']
export const modesOf = (tokens) => (tokens.modes?.length ? tokens.modes : DEFAULT_MODES)

const REF = /^\{([^{}]+)\}$/
export const refPath = (value) => (typeof value === 'string' ? (value.match(REF)?.[1] ?? null) : null)

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
export const isSourceLeaf = (node) => isObject(node) && '$value' in node

// A semantic leaf holds one value per mode — always a string ('#fff',
// 'var(--x)', an rgba() string). A group nests further objects instead.
// Testing the VALUES' shape, not a key name, means a default mode named
// 'base' or 'card' (a Figma theme collection can name its modes anything,
// including a word a token role also uses) can never be mistaken for a leaf.
export const isSemanticLeaf = (value) =>
  isObject(value) && Object.keys(value).length > 0 && Object.values(value).every((v) => typeof v === 'string')

// Custom property names accept nearly anything, but one that survives being
// pasted into a selector, a Tailwind arbitrary value or a JS string is worth a
// rule: every character outside [A-Za-z0-9_-] becomes '-'.
const safe = (segment) => String(segment).replace(/[^A-Za-z0-9_-]/g, '-')
export const sourceVarName = (systemName, path) => '--' + [systemName, ...path].map(safe).join('-')

export function walkSource(source, fn, path = []) {
  for (const [key, node] of Object.entries(source ?? {})) {
    if (key.startsWith('$')) continue
    if (isSourceLeaf(node)) fn([...path, key], node)
    else if (isObject(node)) walkSource(node, fn, [...path, key])
  }
}

export function getSourceLeaf(tokens, dotted) {
  let node = tokens.source
  for (const segment of dotted.split('.')) {
    if (!isObject(node)) return undefined
    node = node[segment]
  }
  return isSourceLeaf(node) ? node : undefined
}

export const sourceValueIn = (leaf, mode, defaultMode) =>
  mode !== defaultMode && leaf.$modes && mode in leaf.$modes ? leaf.$modes[mode] : leaf.$value

export function resolveValue(tokens, value, mode, seen = []) {
  const path = refPath(value)
  if (path === null) return value
  if (seen.includes(path)) throw new Error(`token alias cycle: {${[...seen, path].join('} -> {')}}`)
  const leaf = getSourceLeaf(tokens, path)
  if (!leaf) throw new Error(`token alias {${path}} names nothing in tokens.source`)
  return resolveValue(tokens, sourceValueIn(leaf, mode, modesOf(tokens)[0]), mode, [...seen, path])
}

export function cssValue(tokens, value) {
  const path = refPath(value)
  return path === null ? value : `var(${sourceVarName(tokens.meta.name, path.split('.'))})`
}

// Generic families (sans-serif, system-ui) and one-word names stay bare; any
// other family name is quoted, as CSS requires for names with spaces or digits.
const family = (name) => (/^[A-Za-z-]+$/.test(name) ? name : `"${name.replace(/"/g, '\\"')}"`)

export function cssLiteral(tokens, type, value) {
  if (typeof value === 'string') return cssValue(tokens, value)
  if (typeof value === 'number') return String(value)
  if (Array.isArray(value)) {
    if (type === 'cubicBezier') return `cubic-bezier(${value.join(', ')})`
    if (type === 'fontFamily') return value.map((v) => (refPath(v) === null ? family(v) : cssValue(tokens, v))).join(', ')
    if (type === 'shadow') return value.map((layer) => shadowText(tokens, layer)).join(', ')
    if (type === 'gradient') return value.map((stop) => `${cssLiteral(tokens, 'color', stop.color)} ${stop.position * 100}%`).join(', ')
  }
  if (isObject(value) && type === 'shadow') return shadowText(tokens, value)
  throw new Error(`cannot write this ${type} value as one CSS value: ${JSON.stringify(value)}`)
}

const shadowText = (tokens, layer) =>
  [layer.inset ? 'inset' : '', layer.offsetX, layer.offsetY, layer.blur, layer.spread ?? '0px', layer.color]
    .filter((part) => part !== '')
    .map((part) => cssLiteral(tokens, 'dimension', part))
    .join(' ')

// DTCG composites with no single CSS value: one custom property per field.
const COMPOSITES = new Set(['typography', 'border', 'transition'])
const FIELD_TYPES = {
  fontFamily: 'fontFamily', fontSize: 'dimension', fontWeight: 'fontWeight', letterSpacing: 'dimension',
  lineHeight: 'number', color: 'color', width: 'dimension', style: 'strokeStyle',
  duration: 'duration', delay: 'duration', timingFunction: 'cubicBezier',
}
const kebab = (key) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

export function sourceDeclarations(tokens, path, leaf, mode) {
  const name = sourceVarName(tokens.meta.name, path)
  const value = sourceValueIn(leaf, mode, modesOf(tokens)[0])
  if (!COMPOSITES.has(leaf.$type)) return [[name, cssLiteral(tokens, leaf.$type, value)]]
  const target = refPath(value)
  if (target !== null) {
    const targetName = sourceVarName(tokens.meta.name, target.split('.'))
    return Object.keys(resolveValue(tokens, value, mode)).map((key) => [`${name}-${kebab(key)}`, `var(${targetName}-${kebab(key)})`])
  }
  return Object.entries(value).map(([key, part]) => [`${name}-${kebab(key)}`, cssLiteral(tokens, FIELD_TYPES[key], part)])
}

export function semanticLeaves(tokens) {
  const out = []
  const walk = (node, path) => {
    for (const [key, value] of Object.entries(node ?? {})) {
      if (isSemanticLeaf(value)) out.push([`--${[...path, key].join('-')}`, value])
      else if (isObject(value)) walk(value, [...path, key])
    }
  }
  walk(tokens.color, [])
  for (const [key, leaf] of Object.entries(tokens.shadow ?? {})) out.push([`--shadow-${key}`, leaf])
  return out
}

export function schemeOf(tokens, mode) {
  return luminance(resolveValue(tokens, tokens.color.ground.base[mode], mode)) < 0.2 ? 'dark' : 'light'
}

const mergeLeaves = (base, over, isLeaf) => {
  if (!over) return base
  const out = { ...base }
  for (const [key, value] of Object.entries(over)) {
    out[key] = isLeaf(value) || !isObject(base?.[key]) ? value : mergeLeaves(base[key], value, isLeaf)
  }
  return out
}

export function applyAccent(tokens, accent) {
  const spec = tokens.accents?.[accent]
  if (!spec) throw new Error(`no accent named '${accent}' in tokens.accents`)
  const modes = modesOf(tokens)
  // Color leaf overrides replace the base leaf wholesale, so they must carry
  // every mode — the source layer can fall back to $value, but color leaves
  // have no such fallback.
  const validateColorLeaves = (node, path = []) => {
    for (const [key, value] of Object.entries(node ?? {})) {
      if (isSemanticLeaf(value)) {
        for (const mode of modes) {
          if (!(mode in value)) {
            throw new Error(`accent '${accent}' overrides color.${[...path, key].join('.')} without a '${mode}' value — an accent leaf replaces the base leaf, so it needs every mode`)
          }
        }
      } else if (isObject(value)) validateColorLeaves(value, [...path, key])
    }
  }
  if (spec.color) validateColorLeaves(spec.color)
  return {
    ...tokens,
    source: mergeLeaves(tokens.source ?? {}, spec.source, isSourceLeaf),
    color: mergeLeaves(tokens.color, spec.color, isSemanticLeaf),
  }
}

const containsRef = (value) =>
  refPath(value) !== null ||
  (Array.isArray(value) ? value.some(containsRef) : isObject(value) && Object.values(value).some(containsRef))

// A custom property inherits its already-substituted value: a var() declared
// on :root keeps the default mode's answer inside a [data-theme] or
// [data-accent] island unless the island re-declares it. So every block
// re-declares the whole semantic layer and every alias-valued source token,
// plus the source tokens its own mode or accent changes.
export function themeBlocks(tokens) {
  const modes = modesOf(tokens)
  const [first] = modes
  const aliasValued = (leaf) => containsRef(leaf.$value) || Object.values(leaf.$modes ?? {}).some(containsRef)
  const block = (view, mode, accent, includes) => {
    const declarations = []
    walkSource(view.source, (path, leaf) => {
      if (includes(path, leaf)) declarations.push(...sourceDeclarations(view, path, leaf, mode))
    })
    for (const [name, leaf] of semanticLeaves(view)) {
      if (leaf[mode] === undefined) throw new Error(`${name} has no '${mode}' value — every leaf needs every mode`)
      declarations.push([name, cssValue(view, leaf[mode])])
    }
    return { mode, accent, scheme: schemeOf(view, mode), declarations }
  }
  const blocks = modes.map((mode) =>
    block(tokens, mode, null, (path, leaf) => mode === first || (leaf.$modes && mode in leaf.$modes) || aliasValued(leaf)),
  )
  for (const accent of Object.keys(tokens.accents ?? {})) {
    const view = applyAccent(tokens, accent)
    const overridden = new Set()
    walkSource(tokens.accents[accent].source, (path) => overridden.add(path.join('.')))
    for (const mode of modes) {
      blocks.push(block(view, mode, accent, (path, leaf) => overridden.has(path.join('.')) || aliasValued(leaf)))
    }
  }
  return blocks
}
