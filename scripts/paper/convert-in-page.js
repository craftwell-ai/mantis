// Runs inside the story page. Turns the rendered DOM into Paper-friendly HTML:
// inline styles, flex-only layout derived from measured geometry, icons as files.
// Loaded as text by capture.mjs and evaluated in the page, so nothing here imports it.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function convertStory(options) {
  const EPS = 0.75
  const svgs = {}
  const notes = []
  const round = (value) => Math.round(value * 100) / 100
  const px = (value) => `${round(value)}px`
  const num = (value) => parseFloat(value) || 0

  // ---------- colors ----------
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context2d = canvas.getContext('2d', { willReadFrequently: true })
  const colorCache = new Map()
  function parseColor(input) {
    if (!input) return null
    if (colorCache.has(input)) return colorCache.get(input)
    let result = null
    let match = input.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/)
    if (match) {
      const alpha = match[4] === undefined ? 1 : match[4].endsWith('%') ? parseFloat(match[4]) / 100 : parseFloat(match[4])
      result = { r: Math.round(+match[1]), g: Math.round(+match[2]), b: Math.round(+match[3]), a: alpha }
    } else if ((match = input.match(/^color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.]+%?))?\)$/))) {
      const alpha = match[4] === undefined ? 1 : match[4].endsWith('%') ? parseFloat(match[4]) / 100 : parseFloat(match[4])
      result = { r: Math.round(+match[1] * 255), g: Math.round(+match[2] * 255), b: Math.round(+match[3] * 255), a: alpha }
    } else if (input !== 'transparent') {
      // Other color spaces: paint one pixel and read it back.
      context2d.clearRect(0, 0, 1, 1)
      context2d.fillStyle = '#000'
      context2d.fillStyle = input
      context2d.fillRect(0, 0, 1, 1)
      const [r, g, b, a] = context2d.getImageData(0, 0, 1, 1).data
      result = { r, g, b, a: a / 255, approximate: true }
    } else {
      result = { r: 0, g: 0, b: 0, a: 0 }
    }
    colorCache.set(input, result)
    return result
  }
  const hex2 = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0').toUpperCase()
  function toHex(color) {
    const base = `#${hex2(color.r)}${hex2(color.g)}${hex2(color.b)}`
    return color.a >= 0.999 ? base : `${base}${hex2(color.a * 255)}`
  }
  // Paper's color tokens, so measured colors map back to token names.
  const tokens = options.colorTokens.map(({ name, hex }) => {
    const digits = hex.replace('#', '')
    return {
      name,
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
      a: digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1,
      isText: /foreground|-text$/.test(name),
    }
  })
  function colorOut(input, usage) {
    const color = parseColor(input)
    if (!color || color.a <= 0.003) return null
    const tolerance = color.approximate ? Math.max(2, Math.round(6 / Math.max(color.a, 0.02))) : 0
    const candidates = tokens.filter(
      (token) =>
        Math.abs(token.a - color.a) <= 0.006 &&
        Math.abs(token.r - color.r) <= tolerance &&
        Math.abs(token.g - color.g) <= tolerance &&
        Math.abs(token.b - color.b) <= tolerance,
    )
    if (candidates.length) {
      const preferred = candidates.find((token) => (usage === 'text') === token.isText) || candidates[0]
      return `var(${preferred.name})`
    }
    return toHex(color)
  }
  const hasPaint = (input) => {
    const color = parseColor(input)
    return !!color && color.a > 0.003
  }

  // ---------- helpers ----------
  const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const escapeAttr = (text) => escapeHtml(text).replace(/"/g, '&quot;')
  const kebab = (name) => (name.startsWith('Webkit') ? '-' : '') + name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
  function hashString(text) {
    let h1 = 0xdeadbeef
    let h2 = 0x41c6ce57
    for (let index = 0; index < text.length; index++) {
      const code = text.charCodeAt(index)
      h1 = Math.imul(h1 ^ code, 2654435761)
      h2 = Math.imul(h2 ^ code, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
    return ((h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0')).slice(0, 12)
  }
  const radiusTokens = { 2: 'xs', 4: 'sm', 6: 'md', 8: 'lg', 10: 'control', 12: 'xl', 16: '2xl', 20: '3xl', 24: '4xl' }
  function radiusOut(value, box) {
    const first = num(value.split(' ')[0])
    if (!first) return null
    // Pills come through as huge radii; clamp to half the short side.
    const clamped = Math.min(first, Math.min(box.width, box.height) / 2)
    if (clamped !== first) return px(clamped)
    return radiusTokens[first] ? `var(--radius-${radiusTokens[first]})` : px(first)
  }
  function fontFamilyOut(family) {
    if (/Space Grotesk/i.test(family)) return 'var(--font-grotesk)'
    if (/IBM Plex Mono|monospace/i.test(family)) return 'var(--font-mono)'
    return 'var(--font-sans)'
  }
  function lineHeightOf(cs) {
    const value = parseFloat(cs.lineHeight)
    return Number.isFinite(value) ? value : num(cs.fontSize) * 1.2
  }
  function textStyles(cs) {
    const styles = {}
    const gradientText = cs.webkitBackgroundClip === 'text' && cs.backgroundImage !== 'none'
    if (gradientText) {
      // Paper has no gradient text; take the first stop.
      const stop = cs.backgroundImage.match(/(rgba?\([^)]*\)|color\([^)]*\)|oklab\([^)]*\)|oklch\([^)]*\)|#[0-9a-f]{3,8})/i)
      styles.color = (stop && colorOut(stop[1], 'text')) || 'var(--color-foreground)'
    } else {
      styles.color = colorOut(cs.color, 'text') || 'var(--color-foreground)'
    }
    styles.fontFamily = fontFamilyOut(cs.fontFamily)
    styles.fontSize = px(num(cs.fontSize))
    if (cs.fontWeight !== '400') styles.fontWeight = cs.fontWeight
    if (cs.fontStyle === 'italic') styles.fontStyle = 'italic'
    styles.lineHeight = px(lineHeightOf(cs))
    if (cs.letterSpacing !== 'normal' && num(cs.letterSpacing)) {
      styles.letterSpacing = `${Math.round((num(cs.letterSpacing) / num(cs.fontSize)) * 1000) / 1000}em`
    }
    if (cs.textTransform !== 'none') styles.textTransform = cs.textTransform
    if (/underline|line-through/.test(cs.textDecorationLine)) styles.textDecoration = cs.textDecorationLine
    if (cs.fontVariantNumeric && cs.fontVariantNumeric !== 'normal') styles.fontVariantNumeric = cs.fontVariantNumeric
    return styles
  }
  function isHidden(element, cs, rect) {
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') return true
    if (num(cs.opacity) <= 0.01) return true
    if (rect.width <= 1.5 && rect.height <= 1.5 && cs.overflow !== 'visible') return true // sr-only
    if (element.classList && element.classList.contains('sr-only')) return true
    return false
  }
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'LINK', 'META', 'TITLE', 'BR', 'WBR', 'OPTION', 'HEAD'])

  // ---------- node model ----------
  // { tag, attrs, style, children: Node[] | null, text: string | null, rect }
  function serialize(node) {
    const style = Object.entries(node.style)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${kebab(key)}:${value}`)
      .join(';')
    const attrs = Object.entries(node.attrs || {})
      .map(([key, value]) => ` ${key}="${escapeAttr(String(value))}"`)
      .join('')
    if (node.tag === 'img') return `<img${attrs} style="${style}" />`
    const inner = node.text !== null && node.text !== undefined ? escapeHtml(node.text) : (node.children || []).map(serialize).join('')
    return `<div${attrs} style="${style}">${inner}</div>`
  }
  const spacer = (style) => ({ tag: 'div', attrs: { 'layer-name': 'spacer' }, style: { flexShrink: 0, ...style }, children: [], rect: null })

  // ---------- geometry-driven layout ----------
  // Arrange kids (each with .rect) inside box along an axis. Returns { style, children } or null when
  // the geometry is not a clean row/column (overlaps), so the caller can fall back to absolute.
  function arrange(kids, box, axis, sourceJustify) {
    const main = axis === 'row' ? ['left', 'right', 'width'] : ['top', 'bottom', 'height']
    const cross = axis === 'row' ? ['top', 'bottom'] : ['left', 'right']
    const ordered = [...kids].sort((a, b) => a.rect[main[0]] - b.rect[main[0]])
    const gaps = []
    for (let index = 0; index < ordered.length - 1; index++) {
      const gap = ordered[index + 1].rect[main[0]] - ordered[index].rect[main[1]]
      if (gap < -EPS) return null
      gaps.push(Math.max(0, gap))
    }
    const startOffset = ordered[0].rect[main[0]] - box[main[0]]
    const endOffset = box[main[1]] - ordered[ordered.length - 1].rect[main[1]]
    if (startOffset < -EPS) return null
    const style = { display: 'flex', flexDirection: axis }
    const children = []
    const uniform = gaps.length === 0 || Math.max(...gaps) - Math.min(...gaps) <= EPS * 2
    const between = sourceJustify === 'space-between' && gaps.length > 0 && startOffset <= EPS && endOffset <= EPS
    let extraStart = 0
    if (between) {
      style.justifyContent = 'space-between'
    } else {
      if (uniform && gaps.length && gaps[0] > EPS) style.gap = px(gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length)
      if (startOffset > EPS) {
        if (Math.abs(startOffset - endOffset) <= 1) style.justifyContent = 'center'
        else if (endOffset <= EPS) style.justifyContent = 'flex-end'
        else extraStart = startOffset
      }
    }
    // Cross-axis alignment per kid.
    const alignments = ordered.map((kid) => {
      const before = kid.rect[cross[0]] - box[cross[0]]
      const after = box[cross[1]] - kid.rect[cross[1]]
      if (Math.abs(before) <= EPS) return { align: 'flex-start' }
      if (Math.abs(before - after) <= 1) return { align: 'center' }
      if (Math.abs(after) <= EPS) return { align: 'flex-end' }
      return { align: 'flex-start', offset: before }
    })
    const counts = {}
    for (const { align } of alignments) counts[align] = (counts[align] || 0) + 1
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    style.alignItems = dominant
    ordered.forEach((kid, index) => {
      let node = kid.node
      const { align, offset } = alignments[index]
      if (offset && offset > EPS) {
        // Odd cross-axis offset: wrap the kid so padding places it.
        node = {
          tag: 'div',
          attrs: {},
          style: { display: 'flex', flexShrink: 0, [axis === 'row' ? 'paddingTop' : 'paddingLeft']: px(offset) },
          children: [kid.node],
          rect: null,
        }
        if (dominant !== 'flex-start') node.style.alignSelf = 'flex-start'
      } else if (align !== dominant) {
        node.style.alignSelf = align
      }
      children.push(node)
      if (!between && !uniform && index < gaps.length && gaps[index] > EPS) {
        children.push(spacer(axis === 'row' ? { width: px(gaps[index]), height: '1px' } : { height: px(gaps[index]), width: '1px' }))
      }
    })
    return { style, children, extraStart }
  }

  function layoutKids(kids, box, cs) {
    // Returns { style, children, extraLeft, extraTop } or null (use absolute).
    if (kids.length === 1) {
      const result = arrange(kids, box, cs.display.includes('flex') && cs.flexDirection.startsWith('row') ? 'row' : 'column', cs.justifyContent)
      if (!result) return null
      const axis = result.style.flexDirection
      return { ...result, extraLeft: axis === 'row' ? result.extraStart : 0, extraTop: axis === 'column' ? result.extraStart : 0 }
    }
    // Group into visual rows.
    const byTop = [...kids].sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left)
    const rows = []
    for (const kid of byTop) {
      const row = rows[rows.length - 1]
      if (row && kid.rect.top < row.bottom - EPS) {
        row.kids.push(kid)
        row.bottom = Math.max(row.bottom, kid.rect.bottom)
        row.top = Math.min(row.top, kid.rect.top)
      } else {
        rows.push({ kids: [kid], top: kid.rect.top, bottom: kid.rect.bottom })
      }
    }
    if (rows.length === 1) {
      const result = arrange(kids, box, 'row', cs.justifyContent)
      return result && { ...result, extraLeft: result.extraStart, extraTop: 0 }
    }
    if (rows.every((row) => row.kids.length === 1)) {
      const result = arrange(kids, box, 'column', cs.justifyContent)
      return result && { ...result, extraLeft: 0, extraTop: result.extraStart }
    }
    // Several rows of several items (wrapping flex or grid): one row frame per visual row.
    const rowKids = []
    for (const row of rows) {
      const rowBox = { left: box.left, right: box.right, top: row.top, bottom: row.bottom, width: box.width, height: row.bottom - row.top }
      const arranged = arrange(row.kids, rowBox, 'row', 'normal')
      if (!arranged) return null
      const node = {
        tag: 'div',
        attrs: { 'layer-name': 'row' },
        style: { ...arranged.style, flexShrink: 0, width: px(box.width) },
        children: arranged.children,
        rect: rowBox,
      }
      if (arranged.extraStart > EPS) node.style.paddingLeft = px(arranged.extraStart)
      rowKids.push({ node, rect: rowBox })
    }
    const result = arrange(rowKids, box, 'column', 'normal')
    return result && { ...result, extraLeft: 0, extraTop: result.extraStart }
  }

  // ---------- element conversion ----------
  function boxStyles(element, cs, rect) {
    const style = { boxSizing: 'border-box', flexShrink: 0, width: px(rect.width) }
    const background = colorOut(cs.backgroundColor, 'fill')
    if (background && cs.webkitBackgroundClip !== 'text') style.backgroundColor = background
    if (cs.backgroundImage !== 'none' && cs.webkitBackgroundClip !== 'text') {
      style.backgroundImage = cs.backgroundImage.replace(/url\("([^"]+)"\)/g, 'url($1)')
      if (/url\(/.test(cs.backgroundImage)) {
        style.backgroundSize = cs.backgroundSize
        style.backgroundPosition = cs.backgroundPosition
        style.backgroundRepeat = cs.backgroundRepeat
      }
    }
    const sides = ['Top', 'Right', 'Bottom', 'Left']
    const borders = sides.map((side) => ({
      side,
      width: num(cs[`border${side}Width`]),
      style: cs[`border${side}Style`],
      color: colorOut(cs[`border${side}Color`], 'fill'),
    }))
    const visibleBorders = borders.filter((border) => border.width > 0 && border.style !== 'none' && border.color)
    if (visibleBorders.length === 4 && visibleBorders.every((border) => border.width === visibleBorders[0].width && border.color === visibleBorders[0].color)) {
      style.border = `${px(visibleBorders[0].width)} ${visibleBorders[0].style} ${visibleBorders[0].color}`
    } else {
      for (const border of visibleBorders) style[`border${border.side}`] = `${px(border.width)} ${border.style} ${border.color}`
    }
    const corners = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map((corner) => radiusOut(cs[`border${corner}Radius`], rect))
    if (corners.some(Boolean)) {
      if (corners.every((corner) => corner === corners[0])) style.borderRadius = corners[0]
      else {
        ;['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].forEach((corner, index) => {
          if (corners[index]) style[`border${corner}Radius`] = corners[index]
        })
      }
    }
    if (cs.boxShadow !== 'none') {
      // Drop fully transparent layers (Tailwind's ring/shadow placeholders).
      const layers = cs.boxShadow.split(/,(?![^(]*\))/).map((layer) => layer.trim())
      const kept = layers.filter((layer) => {
        const colorMatch = layer.match(/^(rgba?\([^)]*\)|color\([^)]*\)|oklab\([^)]*\)|oklch\([^)]*\))/)
        return !colorMatch || hasPaint(colorMatch[1])
      })
      if (kept.length) style.boxShadow = kept.join(', ')
    }
    if (num(cs.opacity) < 0.995) style.opacity = round(num(cs.opacity))
    if (/hidden|clip|auto|scroll/.test(`${cs.overflowX} ${cs.overflowY}`)) style.overflow = 'clip'
    if (cs.backdropFilter && cs.backdropFilter !== 'none') style.backdropFilter = cs.backdropFilter
    return style
  }

  function saveSvg(element, cs, rect) {
    const clone = element.cloneNode(true)
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    clone.setAttribute('width', String(round(rect.width)))
    clone.setAttribute('height', String(round(rect.height)))
    clone.removeAttribute('class')
    clone.removeAttribute('style')
    const color = parseColor(cs.color)
    const fill = color ? toHex(color) : '#FFFFFF'
    // Presentation values that depend on the page (currentColor, CSS-set fill/stroke) get baked in.
    const originals = [element, ...element.querySelectorAll('*')]
    const copies = [clone, ...clone.querySelectorAll('*')]
    originals.forEach((original, index) => {
      const copy = copies[index]
      if (!(original instanceof SVGElement) || original.tagName === 'svg') return
      const style = getComputedStyle(original)
      for (const property of ['fill', 'stroke']) {
        const value = style[property]
        if (value && value !== 'none') {
          const parsed = parseColor(value)
          if (parsed) copy.setAttribute(property, toHex(parsed))
        } else if (value === 'none') copy.setAttribute(property, 'none')
      }
      if (style.strokeWidth && copy.getAttribute('stroke') && copy.getAttribute('stroke') !== 'none') copy.setAttribute('stroke-width', style.strokeWidth)
      if (num(style.opacity) < 1) copy.setAttribute('opacity', style.opacity)
      copy.removeAttribute('class')
    })
    const rootStyle = getComputedStyle(element)
    const rootFill = rootStyle.fill && rootStyle.fill !== 'none' ? toHex(parseColor(rootStyle.fill) || color) : null
    if (clone.getAttribute('fill') === 'currentColor' || (!clone.getAttribute('fill') && rootFill)) clone.setAttribute('fill', rootFill || fill)
    const markup = new XMLSerializer().serializeToString(clone).replace(/currentColor/g, fill)
    const name = hashString(markup)
    svgs[name] = markup
    return name
  }

  function textNode(text, cs, rect, extra = {}) {
    const lineHeight = lineHeightOf(cs)
    const lines = Math.max(1, Math.round(rect.height / lineHeight))
    const { keepEdges, ...extraStyles } = extra
    const style = { ...textStyles(cs), flexShrink: 0, ...extraStyles }
    const preserved = /pre/.test(cs.whiteSpace)
    const collapsed = text.replace(/\s+/g, ' ')
    const content = preserved ? text : extra.keepEdges ? collapsed : collapsed.trim()
    if (lines > 1 || /\n/.test(content)) {
      style.width = px(Math.ceil(rect.width * 100) / 100 + 0.5)
      if (cs.textAlign === 'center' || cs.textAlign === 'right' || cs.textAlign === 'end') style.textAlign = cs.textAlign === 'end' ? 'right' : cs.textAlign
      if (preserved || /\n/.test(content)) style.whiteSpace = 'pre-wrap'
    } else {
      style.width = 'max-content'
      style.whiteSpace = keepEdges ? 'pre' : 'nowrap'
    }
    return { tag: 'div', attrs: {}, style, children: null, text: content, rect }
  }

  function layerName(element) {
    const slot = element.getAttribute && element.getAttribute('data-slot')
    if (slot) return slot
    const role = element.getAttribute && element.getAttribute('role')
    if (role && role !== 'presentation' && role !== 'none') return role
    const tag = element.tagName.toLowerCase()
    return ['div', 'span'].includes(tag) ? null : tag
  }

  function pseudoNodes(element) {
    const nodes = []
    for (const which of ['::before', '::after']) {
      const cs = getComputedStyle(element, which)
      if (!cs.content || cs.content === 'none' || cs.content === 'normal') continue
      if (cs.display === 'none' || cs.position !== 'absolute' || num(cs.opacity) <= 0.01 || cs.visibility === 'hidden') continue
      const width = num(cs.width)
      const height = num(cs.height)
      if (width <= 0 || height <= 0) continue
      const painted =
        hasPaint(cs.backgroundColor) ||
        cs.backgroundImage !== 'none' ||
        ['Top', 'Right', 'Bottom', 'Left'].some((side) => num(cs[`border${side}Width`]) > 0 && hasPaint(cs[`border${side}Color`]))
      if (!painted) continue
      const rect = { width, height }
      const style = boxStyles(element, cs, rect)
      style.height = px(height)
      style.position = 'absolute'
      style.left = px(num(cs.left))
      style.top = px(num(cs.top))
      nodes.push({ tag: 'div', attrs: { 'layer-name': which.replace('::', '') }, style, children: [], rect: null })
    }
    return nodes
  }

  function childEntries(element) {
    // Flatten display:contents and collect visible child nodes with their rects.
    const entries = []
    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        if (!child.textContent.trim()) continue
        const range = document.createRange()
        range.selectNodeContents(child)
        const rects = range.getClientRects()
        if (!rects.length) continue
        entries.push({ kind: 'text', node: child, range })
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (SKIP_TAGS.has(child.tagName)) continue
        const cs = getComputedStyle(child)
        if (cs.display === 'contents') {
          entries.push(...childEntries(child))
          continue
        }
        const rect = child.getBoundingClientRect()
        if (isHidden(child, cs, rect)) continue
        entries.push({ kind: 'element', node: child, cs, rect })
      }
    }
    return entries
  }

  // A span that only styles a run of text (no box of its own, no nested elements).
  function isPlainInline(entry) {
    if (entry.kind !== 'element' || entry.cs.display !== 'inline') return false
    if (entry.node.children.length > 0 || !entry.node.textContent.trim()) return false
    const cs = entry.cs
    if (hasPaint(cs.backgroundColor) || cs.backgroundImage !== 'none') return false
    return ['Top', 'Right', 'Bottom', 'Left'].every((side) => num(cs[`padding${side}`]) === 0 && num(cs[`border${side}Width`]) === 0)
  }
  const lineCountOf = (entry) => {
    const range = entry.kind === 'text' ? entry.range : (() => { const r = document.createRange(); r.selectNodeContents(entry.node); return r })()
    return new Set([...range.getClientRects()].filter((box) => box.width > 0).map((box) => Math.round(box.bottom))).size
  }

  function convert(element, cs, rect, isTop) {
    const tag = element.tagName
    if (tag === 'svg' || tag === 'SVG') {
      if (rect.width < 1 || rect.height < 1) return null
      const name = saveSvg(element, cs, rect)
      const node = {
        tag: 'img',
        attrs: { 'layer-name': 'icon', src: `paper-asset://${options.svgDir}/${name}.svg` },
        style: { width: px(rect.width), height: px(rect.height), flexShrink: 0 },
        rect,
      }
      if (num(cs.opacity) < 0.995) node.style.opacity = round(num(cs.opacity))
      return node
    }
    if (tag === 'IMG') {
      if (rect.width < 1 || rect.height < 1) return null
      const style = { width: px(rect.width), height: px(rect.height), flexShrink: 0, objectFit: cs.objectFit === 'fill' ? 'cover' : cs.objectFit }
      const radius = radiusOut(cs.borderTopLeftRadius, rect)
      if (radius) style.borderRadius = radius
      if (num(cs.opacity) < 0.995) style.opacity = round(num(cs.opacity))
      return { tag: 'img', attrs: { 'layer-name': element.alt || 'image', src: element.currentSrc || element.src }, style, rect }
    }
    if (rect.width <= 0 || rect.height <= 0) {
      // Zero-size wrappers can still hold absolutely positioned content; keep that content.
      const kids = childEntries(element).filter((entry) => entry.kind === 'element')
      if (!kids.length) return null
      notes.push(`zero-size wrapper <${tag.toLowerCase()}> with ${kids.length} children flattened away`)
      return null
    }

    const style = boxStyles(element, cs, rect)
    const attrs = {}
    const name = layerName(element)
    if (name) attrs['layer-name'] = name
    const node = { tag: 'div', attrs, style, children: [], text: null, rect }

    const borderLeft = num(cs.borderLeftWidth)
    const borderTop = num(cs.borderTopWidth)
    const padding = { left: num(cs.paddingLeft), right: num(cs.paddingRight), top: num(cs.paddingTop), bottom: num(cs.paddingBottom) }
    const contentBox = {
      left: rect.left + borderLeft + padding.left,
      right: rect.right - num(cs.borderRightWidth) - padding.right,
      top: rect.top + borderTop + padding.top,
      bottom: rect.bottom - num(cs.borderBottomWidth) - padding.bottom,
    }
    contentBox.width = contentBox.right - contentBox.left
    contentBox.height = contentBox.bottom - contentBox.top

    // Form controls: show the value or the placeholder as text.
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      const type = (element.getAttribute('type') || 'text').toLowerCase()
      if (['checkbox', 'radio', 'range', 'file', 'hidden'].includes(type)) return null
      const value = tag === 'SELECT' ? element.selectedOptions[0]?.textContent || '' : element.value
      const shown = value || element.getAttribute('placeholder') || ''
      const textCs = value ? cs : getComputedStyle(element, '::placeholder')
      node.style.height = px(rect.height)
      node.style.display = 'flex'
      node.style.alignItems = tag === 'TEXTAREA' ? 'flex-start' : 'center'
      node.style.overflow = 'clip'
      for (const side of ['Left', 'Right', 'Top', 'Bottom']) if (padding[side.toLowerCase()]) node.style[`padding${side}`] = px(padding[side.toLowerCase()])
      if (shown) {
        const styles = textStyles(cs)
        styles.color = colorOut(textCs.color, 'text') || styles.color
        const wraps = tag === 'TEXTAREA'
        node.children.push({
          tag: 'div',
          attrs: {},
          style: { ...styles, flexShrink: 0, width: wraps ? px(contentBox.width) : 'max-content', whiteSpace: wraps ? 'pre-wrap' : 'nowrap' },
          text: shown,
          children: null,
          rect: null,
        })
      }
      return node
    }

    const entries = childEntries(element)
    const flow = []
    const floating = []
    for (const entry of entries) {
      if (entry.kind === 'element' && (entry.cs.position === 'absolute' || entry.cs.position === 'fixed')) floating.push(entry)
      else flow.push(entry)
    }

    const applyPadding = (extraLeft = 0, extraTop = 0) => {
      const values = { Left: padding.left + extraLeft, Right: padding.right, Top: padding.top + extraTop, Bottom: padding.bottom }
      for (const [side, value] of Object.entries(values)) if (value > 0.01) node.style[`padding${side}`] = px(value)
    }

    const isFlexOrGrid = /flex|grid/.test(cs.display)
    const onlyText = flow.length > 0 && flow.every((entry) => entry.kind === 'text')
    // Inline content that wraps over several lines cannot be rebuilt from boxes; flatten it to one text.
    // A run of text and styling spans where one piece wraps over several lines cannot be rebuilt
    // from boxes, so it becomes one text (the spans' own styling is lost).
    const wrapsInline =
      !isFlexOrGrid && !onlyText &&
      flow.every((entry) => entry.kind === 'text' || isPlainInline(entry)) &&
      flow.some((entry) => lineCountOf(entry) > 1)

    let naturalHeight = null
    if (!flow.length) {
      node.style.height = px(rect.height)
    } else if (onlyText || wrapsInline) {
      const text = wrapsInline ? element.innerText : flow.map((entry) => entry.node.textContent).join('')
      const range = document.createRange()
      range.selectNodeContents(element)
      const lineRects = [...range.getClientRects()].filter((lineRect) => lineRect.width > 0)
      const textRect = lineRects.length
        ? {
            left: Math.min(...lineRects.map((r) => r.left)),
            right: Math.max(...lineRects.map((r) => r.right)),
            top: Math.min(...lineRects.map((r) => r.top)),
            bottom: Math.max(...lineRects.map((r) => r.bottom)),
          }
        : contentBox
      const lineHeight = lineHeightOf(cs)
      const tops = [...new Set(lineRects.map((r) => Math.round(r.top)))]
      const lineCount = Math.max(1, tops.length)
      const textHeight = lineCount * lineHeight
      const textWidth = textRect.right - textRect.left
      const truncated = cs.textOverflow === 'ellipsis' && element.scrollWidth > element.clientWidth + 1
      let shownText = text
      if (truncated && lineCount === 1 && onlyText && flow.length === 1) {
        // Paper has no text-overflow, so cut the string where the browser did and add the ellipsis.
        context2d.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
        const available = contentBox.width - context2d.measureText('…').width
        const source = flow[0].node
        const full = source.textContent
        let low = 0
        let high = full.length
        const probe = document.createRange()
        while (low < high) {
          const middle = Math.ceil((low + high) / 2)
          probe.setStart(source, 0)
          probe.setEnd(source, middle)
          if (probe.getBoundingClientRect().width <= available) low = middle
          else high = middle - 1
        }
        shownText = `${full.slice(0, low).trimEnd()}…`
      }
      const child = textNode(shownText, cs, { width: lineCount > 1 ? contentBox.width : Math.min(textWidth, contentBox.width), height: textHeight })
      const decorated =
        node.style.backgroundColor || node.style.backgroundImage || node.style.border || node.style.boxShadow ||
        Object.keys(node.style).some((key) => /^border(Top|Right|Bottom|Left)$/.test(key)) ||
        padding.left + padding.right + padding.top + padding.bottom > 0.5 || floating.length > 0 || truncated ||
        Math.abs(rect.height - textHeight) > 1.5 || isTop ||
        // Paper sizes single-line text to its content, so a wider box needs a frame to keep its alignment.
        (lineCount === 1 && rect.width - textWidth > 1.5)
      if (!decorated && !cs.display.includes('flex')) {
        // Plain text element: emit the text itself.
        child.attrs = attrs
        child.rect = rect
        if (lineCount === 1 && rect.width - textWidth > 1.5) {
          // Text narrower than its box: keep the box width so alignment survives.
          child.style.width = px(rect.width)
          child.style.whiteSpace = 'nowrap'
          if (['center', 'right', 'end'].includes(cs.textAlign)) child.style.textAlign = cs.textAlign === 'end' ? 'right' : cs.textAlign
        }
        if (num(cs.opacity) < 0.995) child.style.opacity = round(num(cs.opacity))
        return child
      }
      node.style.display = 'flex'
      // Place the text inside its box from the measured offsets.
      const centerLineTop = textRect.top - (textHeight - (textRect.bottom - textRect.top)) / 2
      const before = { x: textRect.left - contentBox.left, y: centerLineTop - contentBox.top }
      const after = { x: contentBox.right - textRect.right, y: contentBox.bottom - (centerLineTop + textHeight) }
      node.style.justifyContent = lineCount > 1 || before.x <= 1 ? 'flex-start' : Math.abs(before.x - after.x) <= 1.5 ? 'center' : after.x <= 1 ? 'flex-end' : 'flex-start'
      node.style.alignItems = Math.abs(before.y) <= 1 ? 'flex-start' : Math.abs(before.y - after.y) <= 1.5 ? 'center' : Math.abs(after.y) <= 1 ? 'flex-end' : 'flex-start'
      applyPadding(node.style.justifyContent === 'flex-start' && lineCount === 1 && before.x > 1 ? before.x : 0, node.style.alignItems === 'flex-start' && before.y > 1 ? before.y : 0)
      if (truncated) node.style.overflow = 'clip'
      node.children.push(child)
      naturalHeight = textHeight + padding.top + padding.bottom + borderTop + num(cs.borderBottomWidth)
    } else {
      const kids = []
      for (const entry of flow) {
        if (entry.kind === 'text' || (!isFlexOrGrid && isPlainInline(entry))) {
          // Styling spans are measured like text nodes so every piece sits on the same line boxes.
          const ownCs = entry.kind === 'text' ? cs : entry.cs
          const ownRange = entry.kind === 'text' ? entry.range : (() => { const r = document.createRange(); r.selectNodeContents(entry.node); return r })()
          const lineRects = [...ownRange.getClientRects()].filter((lineRect) => lineRect.width > 0)
          if (!lineRects.length) continue
          const first = lineRects[0]
          const lineHeight = lineHeightOf(cs)
          const top = first.top - (lineHeight - first.height) / 2
          const right = Math.max(...lineRects.map((r) => r.right))
          const left = Math.min(...lineRects.map((r) => r.left))
          const lineCount = new Set(lineRects.map((r) => Math.round(r.top))).size
          const textRect = { left, right, top, bottom: top + lineCount * lineHeight, width: right - left, height: lineCount * lineHeight }
          const piece = textNode(entry.node.textContent, ownCs, textRect, { keepEdges: !isFlexOrGrid })
          // The line box comes from the parent, whatever the span's own line height says.
          piece.style.lineHeight = px(lineHeight)
          kids.push({ node: piece, rect: textRect })
        } else {
          const converted = convert(entry.node, entry.cs, entry.rect, false)
          if (converted) kids.push({ node: converted, rect: entry.rect })
        }
      }
      if (kids.length) {
        const layout = layoutKids(kids, contentBox, cs)
        if (layout) {
          Object.assign(node.style, layout.style)
          node.children.push(...layout.children)
          applyPadding(layout.extraLeft, layout.extraTop)
          const axis = layout.style.flexDirection
          const first = Math.min(...kids.map((kid) => kid.rect.top))
          const last = Math.max(...kids.map((kid) => kid.rect.bottom))
          naturalHeight =
            axis === 'column' && layout.style.justifyContent === undefined
              ? last - rect.top + padding.bottom + num(cs.borderBottomWidth)
              : axis === 'row' && layout.style.alignItems === 'flex-start'
                ? last - first + padding.top + padding.bottom + borderTop + num(cs.borderBottomWidth)
                : null
          if (axis === 'row' && Math.abs(first - contentBox.top) > EPS) naturalHeight = null
        } else {
          // Overlapping or irregular children: pin each one where it was measured.
          notes.push(`absolute fallback in <${tag.toLowerCase()}${name ? ` ${name}` : ''}> (${kids.length} children)`)
          node.style.position = 'relative'
          node.style.height = px(rect.height)
          for (const kid of kids) {
            kid.node.style.position = 'absolute'
            kid.node.style.left = px(kid.rect.left - rect.left - borderLeft)
            kid.node.style.top = px(kid.rect.top - rect.top - borderTop)
            node.children.push(kid.node)
          }
          naturalHeight = rect.height
        }
      } else {
        node.style.height = px(rect.height)
        applyPadding()
      }
    }
    if (naturalHeight === null || Math.abs(naturalHeight - rect.height) > 1) node.style.height = px(rect.height)

    // Absolutely positioned children and painted pseudo-elements sit on top.
    const pseudos = pseudoNodes(element)
    if (floating.length || pseudos.length) {
      node.style.position = node.style.position || 'relative'
      for (const entry of floating) {
        const converted = convert(entry.node, entry.cs, entry.rect, false)
        if (!converted) continue
        converted.style.position = 'absolute'
        converted.style.left = px(entry.rect.left - rect.left - borderLeft)
        converted.style.top = px(entry.rect.top - rect.top - borderTop)
        if (entry.cs.zIndex !== 'auto' && num(entry.cs.zIndex) < 0) node.children.unshift(converted)
        else node.children.push(converted)
      }
      node.children.push(...pseudos)
    }
    return node
  }

  // ---------- entry ----------
  const out = []
  const root = document.querySelector(options.rootSelector)
  const rootKids = root ? childEntries(root).filter((entry) => entry.kind === 'element') : []
  // Story decorators wrap the pattern in plain padding boxes; step inside them to the pattern itself.
  function unwrap(entry) {
    let current = entry
    for (;;) {
      const kids = childEntries(current.node)
      if (kids.length !== 1 || kids[0].kind !== 'element') return current
      const cs = current.cs
      const pageColor = getComputedStyle(document.body).backgroundColor
      const plain =
        (!hasPaint(cs.backgroundColor) || cs.backgroundColor === pageColor || colorOut(cs.backgroundColor, 'fill') === 'var(--color-background)') &&
        cs.backgroundImage === 'none' &&
        cs.boxShadow === 'none' &&
        ['Top', 'Right', 'Bottom', 'Left'].every((side) => num(cs[`border${side}Width`]) === 0) &&
        !/hidden|clip|auto|scroll/.test(`${cs.overflowX} ${cs.overflowY}`)
      if (!plain) return current
      if (['svg', 'IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(kids[0].node.tagName)) return current
      current = kids[0]
    }
  }
  for (const rawEntry of rootKids) {
    const entry = unwrap(rawEntry)
    const node = convert(entry.node, entry.cs, entry.rect, true)
    if (node) out.push({ where: 'root', node, rect: entry.rect })
  }
  // Overlays (dialogs, menus, popovers) are portaled outside the story root.
  const seen = new Set()
  // A dimmed full-screen layer behind the overlay means the overlay is a modal, not an anchored popover.
  const hasBackdrop = [...document.body.querySelectorAll('*')].some((candidate) => {
    if (root && root.contains(candidate)) return false
    const style = getComputedStyle(candidate)
    if (style.position !== 'fixed' || style.display === 'none' || style.visibility === 'hidden') return false
    const box = candidate.getBoundingClientRect()
    if (box.width < innerWidth * 0.95 || box.height < innerHeight * 0.95) return false
    const color = parseColor(style.backgroundColor)
    return !!color && color.a > 0.2 && candidate.children.length === 0
  })
  const overlaySelector = '[role="dialog"],[role="alertdialog"],[role="menu"],[role="listbox"],[role="tooltip"],[data-slot$="-content"],[data-sonner-toast]'
  for (const candidate of document.querySelectorAll(overlaySelector)) {
    if (root && root.contains(candidate)) continue
    if ([...seen].some((other) => other.contains(candidate))) continue
    const cs = getComputedStyle(candidate)
    const rect = candidate.getBoundingClientRect()
    if (isHidden(candidate, cs, rect) || rect.width < 2 || rect.height < 2) continue
    seen.add(candidate)
    const node = convert(candidate, cs, rect, true)
    if (node) out.push({ where: 'overlay', node, rect, role: candidate.getAttribute('role') || candidate.getAttribute('data-slot') || '',
        modal:
          hasBackdrop ||
          candidate.getAttribute('role') === 'alertdialog' ||
          candidate.getAttribute('aria-modal') === 'true' ||
          /^(dialog|alert-dialog|sheet)-content$/.test(candidate.getAttribute('data-slot') || ''),
      })
  }
  return {
    pieces: out.map((piece) => ({
      where: piece.where,
      role: piece.role || '',
      modal: !!piece.modal,
      html: serialize(piece.node),
      width: round(piece.rect.width),
      height: round(piece.rect.height),
      left: round(piece.rect.left),
      top: round(piece.rect.top),
    })),
    svgs,
    notes,
  }
}
