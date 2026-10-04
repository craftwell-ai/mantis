// Builds one Paper board (header + one labelled example per story) from captured story HTML.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { call, FILE_ID } from './paper.mjs'
import { CAPTURE_DIR, SHOT_DIR } from './paths.mjs'

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const created = (result, name) => (result.json.createdNodes || []).find((node) => node.name === name)

// A story with an open overlay renders in two places: the page and a portal. Modal dialogs are shown
// on their own; anchored overlays (menus, popovers, lists) are pinned where they opened over the page.
function compose(pieces) {
  const overlays = pieces.filter((piece) => piece.where === 'overlay')
  if (!overlays.length) return pieces.map((piece) => piece.html)
  const modal = overlays.some((piece) => piece.modal)
  const shown = modal ? overlays : pieces
  if (shown.length === 1) return [shown[0].html]
  const left = Math.min(...shown.map((piece) => piece.left))
  const top = Math.min(...shown.map((piece) => piece.top))
  const right = Math.max(...shown.map((piece) => piece.left + piece.width))
  const bottom = Math.max(...shown.map((piece) => piece.top + piece.height))
  const inner = shown
    .map((piece) => `<div layer-name="${piece.where === 'overlay' ? 'overlay' : 'page'}" style="position:absolute;left:${(piece.left - left).toFixed(2)}px;top:${(piece.top - top).toFixed(2)}px;display:flex">${piece.html}</div>`)
    .join('')
  return [`<div layer-name="open state" style="position:relative;flex-shrink:0;width:${(right - left).toFixed(2)}px;height:${(bottom - top).toFixed(2)}px">${inner}</div>`]
}

export async function buildBoard({ pageId, kind, title, description, stories, slug }) {
  mkdirSync(SHOT_DIR, { recursive: true })
  const artboard = await call('create_artboard', {
    fileId: FILE_ID,
    pageId,
    name: title,
    styles: {
      display: 'flex',
      flexDirection: 'column',
      width: '1440px',
      height: '900px',
      padding: '80px',
      gap: '56px',
      backgroundColor: 'var(--color-background)',
      overflow: 'clip',
    },
  })
  const boardId = artboard.json.id || artboard.json.nodeId || artboard.json.artboardId
  if (!boardId) throw new Error(`create_artboard returned no id: ${JSON.stringify(artboard.json)}`)

  await call('write_html', {
    fileId: FILE_ID,
    targetNodeId: boardId,
    mode: 'insert-children',
    html:
      `<div layer-name="Header" style="display:flex;flex-direction:column;gap:12px">` +
      `<div style="color:var(--color-muted-foreground);font-family:var(--font-sans);font-size:12px;font-weight:600;letter-spacing:0.08em;line-height:16px;text-transform:uppercase;width:max-content">Mantis · ${kind}</div>` +
      `<div style="color:var(--color-foreground);font-family:var(--font-grotesk);font-size:48px;font-weight:700;letter-spacing:-0.02em;line-height:56px;text-transform:uppercase;width:max-content">${escapeHtml(title)}</div>` +
      `<div style="color:var(--color-muted-foreground);font-family:var(--font-sans);font-size:16px;line-height:24px;width:720px">${escapeHtml(description)}</div>` +
      `</div>`,
  })

  const section = await call('write_html', {
    fileId: FILE_ID,
    targetNodeId: boardId,
    mode: 'insert-children',
    html:
      `<div layer-name="Examples" style="display:flex;flex-direction:column;gap:16px">` +
      `<div style="color:var(--color-foreground);font-family:var(--font-sans);font-size:14px;font-weight:600;line-height:20px;width:max-content">${kind === 'Template' ? 'Page' : 'Examples'}</div>` +
      `<div layer-name="examples-wrap" style="display:flex;flex-wrap:wrap;align-items:flex-start;gap:40px 32px;width:1280px"></div>` +
      `</div>`,
  })
  const wrap = created(section, 'examples-wrap')
  if (!wrap) throw new Error(`could not find examples-wrap in ${JSON.stringify(section.json).slice(0, 400)}`)

  const report = []
  for (const story of stories) {
    const file = join(CAPTURE_DIR, `${story.id}.json`)
    if (!existsSync(file)) {
      report.push(`${story.id}: no capture`)
      continue
    }
    const capture = JSON.parse(readFileSync(file, 'utf8'))
    if (!capture.pieces.length) {
      report.push(`${story.id}: empty`)
      continue
    }
    const label = `<div style="color:var(--color-muted-foreground);font-family:var(--font-mono);font-size:12px;line-height:16px;width:max-content">${escapeHtml(story.label)}</div>`
    const group = await call('write_html', {
      fileId: FILE_ID,
      targetNodeId: wrap.id,
      mode: 'insert-children',
      html: `<div layer-name="${escapeHtml(story.label)}" style="display:flex;flex-direction:column;align-items:flex-start;gap:10px">${label}</div>`,
    })
    const groupNode = created(group, story.label)
    for (const html of compose(capture.pieces)) {
      await call('write_html', { fileId: FILE_ID, targetNodeId: groupNode.id, mode: 'insert-children', html })
    }
    report.push(`${story.id}: ${capture.pieces.length} piece(s)${capture.notes.length ? `, ${capture.notes.length} note(s)` : ''}`)
  }

  await call('update_styles', { fileId: FILE_ID, updates: [{ nodeIds: [boardId], styles: { height: 'fit-content' } }] })
  await call('finish_working_on_nodes', { fileId: FILE_ID, nodeIds: [boardId] })
  // A screenshot of the finished board, for reviewing without opening Paper.
  const shot = await call('get_screenshot', { fileId: FILE_ID, nodeId: boardId })
  if (shot.images[0]) writeFileSync(join(SHOT_DIR, `${slug}.${shot.images[0].mimeType.includes('png') ? 'png' : 'jpg'}`), Buffer.from(shot.images[0].data, 'base64'))
  return { boardId, report }
}
