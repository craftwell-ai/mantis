// Minimal client for Paper's local MCP server, so large HTML goes straight from disk to Paper.
const ENDPOINT = process.env.PAPER_MCP_URL || 'http://127.0.0.1:29979/mcp'
// The "Mantis Design System" file in Paper. Paper must be running with this file open.
export const FILE_ID = process.env.PAPER_FILE_ID || '01M3Z313QR6C3F2F87B6QM3YQ9'

let sessionId = null
let nextId = 1

async function post(body) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' }
  if (sessionId) headers['mcp-session-id'] = sessionId
  const response = await fetch(ENDPOINT, { method: 'POST', headers, body: JSON.stringify(body) })
  if (response.headers.get('mcp-session-id')) sessionId = response.headers.get('mcp-session-id')
  const text = await response.text()
  if (!text.trim()) return null
  if ((response.headers.get('content-type') || '').includes('text/event-stream')) {
    const dataLines = text.split('\n').filter((line) => line.startsWith('data:'))
    const last = dataLines[dataLines.length - 1]
    return last ? JSON.parse(last.slice(5)) : null
  }
  return JSON.parse(text)
}

export async function connect() {
  if (sessionId) return
  await post({
    jsonrpc: '2.0',
    id: nextId++,
    method: 'initialize',
    params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'mantis-board-builder', version: '0.0.1' } },
  })
  await post({ jsonrpc: '2.0', method: 'notifications/initialized' })
}

// Returns { json, images, raw }: the parsed JSON payload (last JSON text block), any images, and raw content.
export async function call(name, args = {}) {
  await connect()
  const message = await post({ jsonrpc: '2.0', id: nextId++, method: 'tools/call', params: { name, arguments: args } })
  if (!message) throw new Error(`${name}: empty response`)
  if (message.error) throw new Error(`${name}: ${JSON.stringify(message.error)}`)
  const content = message.result?.content || []
  if (message.result?.isError) throw new Error(`${name}: ${content.map((part) => part.text).join(' ')}`)
  let json = null
  for (const part of content) {
    if (part.type !== 'text') continue
    try {
      const parsed = JSON.parse(part.text)
      // The first block is the file header; keep the last non-header payload.
      if (!(parsed && parsed.file && parsed.contentHash && Object.keys(parsed).length === 2)) json = parsed
    } catch {
      if (json === null) json = part.text
    }
  }
  return { json, images: content.filter((part) => part.type === 'image'), raw: content }
}
