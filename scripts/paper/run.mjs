// Rebuilds the pattern (◆) and template (▣) boards in the Mantis Paper file from the live Storybook.
//
//   npm run paper:boards                  every board
//   npm run paper:boards -- pricing-card  only the named boards
//
// Needs the Paper desktop app running with the Mantis Design System file open, and the patterns
// deployed (stories are read from STORYBOOK_URL, the live site by default).
import { loadBoards } from './boards.mjs'
import { buildBoard } from './build-board.mjs'
import { captureStories } from './capture.mjs'
import { ensurePages } from './pages.mjs'
import { call, FILE_ID } from './paper.mjs'

const only = process.argv.slice(2)
const allBoards = await loadBoards()
const boards = only.length ? allBoards.filter((board) => only.includes(board.slug)) : allBoards
const unknown = only.filter((slug) => !allBoards.some((board) => board.slug === slug))
if (unknown.length) throw new Error(`No such board: ${unknown.join(', ')}`)

// Paper's own token list, so boards point at tokens by name rather than raw colors.
const info = await call('get_basic_info', { fileId: FILE_ID })
const colorTokens = info.json.tokens.items.filter((token) => token.name.startsWith('--color-')).map((token) => ({ name: token.name, hex: token.value }))

const failedCaptures = await captureStories(boards.flatMap((board) => board.stories.map((story) => story.id)), colorTokens)
const pageIds = await ensurePages(allBoards)

let failures = failedCaptures.length
for (const board of boards) {
  const pageId = pageIds[board.pageName]
  // A rebuild replaces whatever board is already on the page.
  const existing = (await call('get_children', { fileId: FILE_ID, nodeId: `root_node_${pageId}` })).json.children || []
  if (existing.length) await call('delete_nodes', { fileId: FILE_ID, nodeIds: existing.map((node) => node.id) })
  try {
    const result = await buildBoard({ ...board, pageId })
    console.log(`${board.pageName}: built — ${result.report.join('; ')}`)
  } catch (error) {
    failures += 1
    console.log(`${board.pageName}: FAILED ${error.message.slice(0, 300)}`)
  }
}
console.log(failures ? `Done with ${failures} failure(s). Review the screenshots in .paper-build/boards.` : 'Done. Review the screenshots in .paper-build/boards.')
process.exitCode = failures ? 1 : 0
