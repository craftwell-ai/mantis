// Makes sure every board has its own page, in library order: Foundations, components A-Z,
// patterns A-Z, templates A-Z. Paper cannot reorder pages and adds new ones after whichever page
// is open, so names are assigned to page slots in order and existing boards are moved to the slot
// that now carries their name.
import { call, FILE_ID } from './paper.mjs'

const listPages = async () => (await call('get_basic_info', { fileId: FILE_ID })).json.pages

// Returns { pageName: pageId }.
export async function ensurePages(boards) {
  let pages = await listPages()
  const wanted = boards.map((board) => board.pageName)
  const missing = wanted.filter((name) => !pages.some((page) => page.name === name))
  for (const name of missing) await call('create_page', { fileId: FILE_ID, name })
  pages = await listPages()

  const byName = (a, b) => a.localeCompare(b)
  const names = (prefix) => pages.filter((page) => page.name.startsWith(prefix)).map((page) => page.name).sort(byName)
  const desired = [...pages.filter((page) => !/^[❖◆▣]/.test(page.name)).map((page) => page.name), ...names('❖'), ...names('◆'), ...names('▣')]
  if (desired.some((name, index) => name !== pages[index].name)) {
    const moves = []
    for (const [index, slot] of pages.entries()) {
      const source = pages.find((page) => page.name === desired[index])
      if (source.id === slot.id) continue
      const children = (await call('get_children', { fileId: FILE_ID, nodeId: `root_node_${source.id}` })).json.children || []
      for (const child of children) moves.push({ nodeId: child.id, parentId: `root_node_${slot.id}` })
    }
    for (const move of moves) {
      await call('move_nodes', { fileId: FILE_ID, moves: [move] })
      // A moved artboard keeps its old canvas position; put it back at the origin.
      await call('update_styles', { fileId: FILE_ID, updates: [{ nodeIds: [move.nodeId], styles: { left: '0px', top: '0px' } }] })
    }
    await call('rename_pages', { fileId: FILE_ID, updates: pages.map((slot, index) => ({ pageId: slot.id, name: desired[index] })) })
    console.log(`reordered pages (${moves.length} board(s) moved)`)
    pages = await listPages()
  }
  return Object.fromEntries(pages.map((page) => [page.name, page.id]))
}
