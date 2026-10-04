import type { ReactNode } from 'react'

type Rule = { id: string; do: string; dont: string }

/**
 * Side-by-side Do / Don't frame. The captions come from the usage guide by rule
 * id, so an example can never drift from its written rule —
 * scripts/usage-coverage.test.mjs requires one per visual rule.
 */
export function DoDontPair({ usage, id, doExample, dontExample }: { usage: { name: string; rules: Rule[] }; id: string; doExample: ReactNode; dontExample: ReactNode }) {
  const rule = usage.rules.find((r) => r.id === id)
  if (!rule) throw new Error(`No rule '${id}' in the usage guide for '${usage.name}'`)
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <figure className="flex flex-col gap-3 rounded-lg border border-t-4 border-t-primary bg-card p-4">
        <div>{doExample}</div>
        <figcaption className="text-sm"><strong>Do.</strong> {rule.do}</figcaption>
      </figure>
      <figure className="flex flex-col gap-3 rounded-lg border border-t-4 border-t-destructive bg-card p-4">
        <div>{dontExample}</div>
        <figcaption className="text-sm"><strong>Don&apos;t.</strong> {rule.dont}</figcaption>
      </figure>
    </div>
  )
}
