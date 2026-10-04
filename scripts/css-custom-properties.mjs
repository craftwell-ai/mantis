/**
 * Custom properties out of CSS text, grouped by the selector (and @media,
 * @supports or @container condition) that declares them — that grouping is
 * where a site keeps its themes. For stylesheets a page script may not read
 * (cross-origin) and for any .css file a client hands over; the in-browser
 * harvest in references/ingestion.md §3 returns the same { groups } shape.
 *
 * Deliberately small: comments are dropped, at-statements (@import, @charset)
 * skipped, @layer blocks read through, and declarations inside nested rules
 * (CSS nesting) left out.
 */

function topLevelDeclarations(block) {
  const out = []
  let depth = 0
  let i = 0
  let current = ''
  let quote = null
  let parenDepth = 0
  while (i < block.length) {
    const ch = block[i]
    const prevCh = i > 0 ? block[i - 1] : ''
    // Handle quote entry/exit with backslash escapes
    if ((ch === '"' || ch === "'") && prevCh !== '\\') {
      if (quote === ch) quote = null
      else if (!quote) quote = ch
    } else if (!quote) {
      if (ch === '(') parenDepth++
      else if (ch === ')') parenDepth--
      // Agree with findCloseBrace below: a brace inside parentheses (a data
      // URI's braces, say, or any value inside a function call) is not a
      // block delimiter — only bare braces open or close a nested rule.
      else if (ch === '{' && parenDepth === 0) { depth++; current = ''; i++; continue }
      else if (ch === '}' && parenDepth === 0) { depth--; current = ''; i++; continue }
    }
    if (depth > 0) {
      i++
      continue
    }
    if (!quote && parenDepth === 0 && ch === ';') {
      out.push(current)
      current = ''
    } else {
      current += ch
    }
    i++
  }
  if (current.trim()) out.push(current)
  return out
}

function findCloseBrace(text, openPos) {
  // Find the matching close brace for the brace at openPos,
  // respecting quotes and parentheses
  let depth = 1
  let i = openPos + 1
  let quote = null
  let parenDepth = 0
  while (i < text.length && depth > 0) {
    const ch = text[i]
    const prevCh = i > 0 ? text[i - 1] : ''
    // Handle quote entry/exit with backslash escapes
    if ((ch === '"' || ch === "'") && prevCh !== '\\') {
      if (quote === ch) quote = null
      else if (!quote) quote = ch
    } else if (!quote) {
      if (ch === '(') parenDepth++
      else if (ch === ')') parenDepth--
      else if (ch === '{' && parenDepth === 0) depth++
      else if (ch === '}' && parenDepth === 0) depth--
    }
    i++
  }
  return i
}

export function harvestCss(cssText) {
  const groups = {}
  const walk = (body, condition) => {
    let index = 0
    while (index < body.length) {
      // Find next brace, skipping quotes and parentheses
      let open = index
      let quote = null
      let parenDepth = 0
      while (open < body.length) {
        const ch = body[open]
        const prevCh = open > 0 ? body[open - 1] : ''
        if ((ch === '"' || ch === "'") && prevCh !== '\\') {
          if (quote === ch) quote = null
          else if (!quote) quote = ch
        } else if (!quote) {
          if (ch === '(') parenDepth++
          else if (ch === ')') parenDepth--
          else if (ch === '{' && parenDepth === 0) break
        }
        open++
      }
      if (open === body.length) break
      const close = findCloseBrace(body, open)
      const raw = body.slice(index, open)
      // Extract prelude (after last semicolon outside quotes/parens)
      let lastSemiPos = -1
      let quote2 = null
      let parenDepth2 = 0
      for (let i = 0; i < raw.length; i++) {
        const ch = raw[i]
        const prevCh = i > 0 ? raw[i - 1] : ''
        if ((ch === '"' || ch === "'") && prevCh !== '\\') {
          if (quote2 === ch) quote2 = null
          else if (!quote2) quote2 = ch
        } else if (!quote2) {
          if (ch === '(') parenDepth2++
          else if (ch === ')') parenDepth2--
          else if (ch === ';' && parenDepth2 === 0) lastSemiPos = i
        }
      }
      const prelude = raw.slice(lastSemiPos + 1).trim().replace(/\s+/g, ' ')
      const inner = body.slice(open + 1, close - 1)
      if (/^@layer\b/.test(prelude)) walk(inner, condition)
      else if (/^@(media|supports|container)\b/.test(prelude)) walk(inner, [condition, prelude].filter(Boolean).join(' '))
      else if (!prelude.startsWith('@')) {
        const key = condition ? `${condition} ${prelude}` : prelude
        for (const declaration of topLevelDeclarations(inner)) {
          const match = declaration.match(/^\s*(--[A-Za-z0-9_-]+)\s*:\s*([\s\S]+?)\s*$/)
          if (!match) continue
          if (!groups[key]) groups[key] = {}
          groups[key][match[1]] = match[2]
        }
      }
      index = close
    }
  }
  walk(cssText.replace(/\/\*[\s\S]*?\*\//g, ''), '')
  return groups
}

const VAR = /^var\(\s*--([A-Za-z0-9_-]+)\s*\)$/

function typeOf(value, props, seen = []) {
  const alias = value.match(VAR)
  if (alias) {
    const target = props[`--${alias[1]}`]
    return target === undefined || seen.includes(alias[1]) ? 'string' : typeOf(target, props, [...seen, alias[1]])
  }
  if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) || /^(rgba?|hsla?|oklch|oklab|lab|lch|color)\(/i.test(value)) return 'color'
  if (/^-?\d*\.?\d+(px|rem|em|%|vh|vw|vmin|vmax|ch|ex|pt)$/.test(value)) return 'dimension'
  if (/^\d*\.?\d+m?s$/.test(value)) return 'duration'
  if (/^cubic-bezier\(/.test(value)) return 'cubicBezier'
  if (/^-?\d*\.?\d+$/.test(value)) return 'number'
  if (/,/.test(value) && /(serif|sans-serif|monospace|system-ui|cursive|fantasy)\s*$/.test(value)) return 'fontFamily'
  if (/-?\d+(px)?\s+-?\d+(px)?\s+\d+(px)?/.test(value)) return 'shadow'
  return 'string'
}

function tokenFor(value, props) {
  const alias = value.match(VAR)
  const $type = typeOf(value, props)
  if (alias) return { $type, $value: `{${alias[1]}}` }
  if ($type === 'cubicBezier') return { $type, $value: value.slice(value.indexOf('(') + 1, -1).split(',').map(Number) }
  return { $type, $value: value }
}

/**
 * Harvested groups → one DTCG document per mode, for importDtcg. Which
 * selectors hold each mode is a decision shown to the user at Gate G1:
 *   groupsToDocs(groups, { light: [':root'], dark: [':root', '[data-theme="dark"]'] })
 * Later selectors in a mode's list win; a property a mode lacks keeps the
 * default mode's value; `var(--x)` becomes the alias `{x}`.
 */
export function groupsToDocs(groups, selectorsByMode) {
  const pick = (selector) => {
    if (!groups[selector]) throw new Error(`no selector '${selector}' in the harvest — it has: ${Object.keys(groups).join(' | ')}`)
    return groups[selector]
  }
  const modes = Object.keys(selectorsByMode)
  const merged = Object.fromEntries(modes.map((mode) => [mode, Object.assign({}, ...selectorsByMode[mode].map(pick))]))
  const docs = {}
  for (const mode of modes) {
    const props = { ...merged[modes[0]], ...merged[mode] }
    docs[mode] = Object.fromEntries(Object.entries(props).map(([name, value]) => [name.slice(2), tokenFor(value, props)]))
  }
  return docs
}
