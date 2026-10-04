import { tokens } from '../../tokens/mantis.tokens.mjs'

type Leaf = { $type?: string; $value: unknown; $modes?: Record<string, unknown>; $description?: string }

const modes: string[] = tokens.modes ?? ['light', 'dark']
// The same naming rule as engine-core/token-model.mjs sourceVarName.
const varName = (path: string[]) => '--' + [tokens.meta.name, ...path].map((s) => String(s).replace(/[^A-Za-z0-9_-]/g, '-')).join('-')
const show = (value: unknown) => (typeof value === 'string' || typeof value === 'number' ? String(value) : JSON.stringify(value))

const REF = /^\{([^{}]+)\}$/
// engine-core/token-model.mjs's resolveValue, re-implemented locally for the
// DEFAULT mode only — see Colors.mdx for the full explanation. There is
// deliberately no `[data-theme="<default>"]` rule, so a swatch's var() for
// that column would resolve to whatever mode an ancestor (Storybook's
// preview toolbar) currently has set, not the value this column is meant to
// show. A source leaf's own `$value` is a literal in the vast majority of
// cases, but this still walks it in case one source token aliases another.
const resolveDefault = (value: unknown, seen: string[] = []): unknown => {
  const path = typeof value === 'string' ? value.match(REF)?.[1] : undefined
  if (path === undefined) return value
  if (seen.includes(path)) throw new Error(`token alias cycle: {${[...seen, path].join('} -> {')}}`)
  const leaf = path.split('.').reduce<unknown>((node, key) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[key] : undefined), tokens.source)
  if (!leaf || typeof leaf !== 'object' || !('$value' in leaf)) throw new Error(`token alias {${path}} names nothing in tokens.source`)
  return resolveDefault(leaf.$value, [...seen, path])
}

function leaves(node: Record<string, unknown>, path: string[] = []): [string[], Leaf][] {
  return Object.entries(node).flatMap(([key, child]): [string[], Leaf][] => {
    if (key.startsWith('$') || !child || typeof child !== 'object') return []
    return '$value' in child ? [[[...path, key], child as Leaf]] : leaves(child as Record<string, unknown>, [...path, key])
  })
}

export function SourceTokenTable() {
  const rows = leaves(tokens.source ?? {})
  if (!rows.length) return <p>This system has no source layer yet: every value lives in the semantic tokens.</p>
  return (
    <table>
      <thead>
        <tr>
          <th>Token</th>
          <th>Type</th>
          {modes.map((mode) => <th key={mode}>{mode}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map(([path, leaf]) => (
          <tr key={path.join('.')}>
            <td>
              <code>{varName(path)}</code>
              {leaf.$description ? <div>{leaf.$description}</div> : null}
            </td>
            <td>{leaf.$type ?? '—'}</td>
            {modes.map((mode, index) => {
              const value = index > 0 && leaf.$modes && mode in leaf.$modes ? leaf.$modes[mode] : leaf.$value
              return (
                // data-theme on the cell makes the swatch's var() resolve in that mode.
                <td key={mode} data-theme={mode}>
                  {leaf.$type === 'color' ? (
                    <span
                      aria-hidden="true"
                      style={{
                        display: 'inline-block', inlineSize: '1.25rem', blockSize: '1.25rem', marginInlineEnd: '0.5rem',
                        verticalAlign: 'middle', border: '1px solid var(--line-control)', borderRadius: '0.25rem',
                        // The default-mode column resolves to a literal (see
                        // resolveDefault above); every other mode has its own
                        // [data-theme="<mode>"] rule, so var() is safe there.
                        background: index === 0 ? String(resolveDefault(value)) : `var(${varName(path)})`,
                      }}
                    />
                  ) : null}
                  <code>{show(value)}</code>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
