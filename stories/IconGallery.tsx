import { useId, useState } from 'react'

import { Icon, type IconName } from '@/components/ui/icon'
import { icons } from '@/components/ui/icons.generated'

const ICON_NAMES = Object.keys(icons) as IconName[]

/**
 * Every icon this system ships, searchable. Selecting one shows the code to
 * paste, so nobody has to guess a name. Used by Foundations / Icons and the
 * Icon component's Gallery story. `sb-unstyled` keeps Storybook's docs
 * typography off it when it sits on an MDX page.
 */
export function IconGallery() {
  const searchId = useId()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<IconName | null>(null)
  // People type "arrow back" as often as "arrow_back"; both should match.
  const needle = query.trim().toLowerCase().replace(/[\s-]+/g, '_')
  const matches = ICON_NAMES.filter((name) => name.includes(needle))

  return (
    <div className="sb-unstyled flex w-full max-w-3xl flex-col gap-4 text-foreground">
      <div className="flex max-w-xs flex-col gap-2">
        <label htmlFor={searchId} className="text-sm font-medium">
          Search icons
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="arrow, check, close"
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {matches.length === 0 ? `No icon name contains “${query.trim()}”.` : `${matches.length} of ${ICON_NAMES.length} icons`}
      </p>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2">
        {matches.map((name) => (
          <li key={name}>
            <button
              type="button"
              aria-pressed={selected === name}
              onClick={() => setSelected(name)}
              className="flex w-full flex-col items-center gap-2 rounded-md border bg-background px-2 py-3 text-xs outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-muted"
            >
              <Icon name={name} className="size-6" />
              <span className="font-mono break-all">{name}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2" aria-live="polite">
        {selected ? (
          <>
            <p className="text-sm font-medium">Code</p>
            <code className="block rounded-md border bg-muted px-3 py-2 font-mono text-sm break-all">{`<Icon name="${selected}" />`}</code>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Select an icon to see the code for it.</p>
        )}
      </div>
    </div>
  )
}
