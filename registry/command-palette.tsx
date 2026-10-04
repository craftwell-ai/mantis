"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Icon, type IconName } from "@/components/ui/icon"
import { IconTile } from "@/components/ui/icon-tile"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type CommandPaletteCategory = {
  value: string
  label: string
  icon?: IconName
}

export type CommandPaletteItem = {
  id: string
  title: string
  description?: string
  icon: IconName
  /** Matches a `CommandPaletteCategory.value`; drives the filter chips and result groups. */
  category: string
  /** A short "new" or "hot" marker beside the title. */
  badge?: { label: string; variant: "new" | "hot" }
}

export type CommandPaletteFeatured = {
  id: string
  title: string
  description: string
  /** Small label on the image, such as the item's category. */
  tag: string
  image: string
  alt: string
  badge?: { label: string; variant: "new" | "hot" }
}

export type CommandPaletteProps = {
  categories: CommandPaletteCategory[]
  /** Every searchable destination. Typing filters this list by title and description. */
  items: CommandPaletteItem[]
  recents?: CommandPaletteItem[]
  featured?: CommandPaletteFeatured[]
  trending?: CommandPaletteItem[]
  /** Called with the chosen item; the palette closes itself afterwards. */
  onSelect?: (item: CommandPaletteItem | CommandPaletteFeatured) => void
  /** Element that opens the palette, such as the ⌘K search pill. Rendered through DialogTrigger. */
  trigger?: React.ReactElement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Listen for ⌘K / Ctrl+K anywhere on the page. */
  hotkey?: boolean
  placeholder?: string
}

const ALL = "all"

type Entry = { key: string; item: CommandPaletteItem | CommandPaletteFeatured }
type Section = { id: string; label: string; layout: "list" | "cards" | "columns"; entries: Entry[] }

function matches(item: CommandPaletteItem, query: string) {
  const haystack = `${item.title} ${item.description ?? ""}`.toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
}

// The ⌘K search: a glass dialog with a search field, filter chips, then recents,
// featured cards and a two-column trending list. Typing swaps the browse view for
// results grouped by category. The field keeps focus; arrow keys move a highlight
// through every row and card (aria-activedescendant), Enter opens it.
export function CommandPalette({
  categories,
  items,
  recents = [],
  featured = [],
  trending = [],
  onSelect,
  trigger,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  hotkey = true,
  placeholder = "Search tools, models and presets",
}: CommandPaletteProps) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState(ALL)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const baseId = React.useId()
  const listId = `${baseId}-list`

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next)
      onOpenChange?.(next)
      if (!next) {
        setQuery("")
        setCategory(ALL)
      }
    },
    [openProp, onOpenChange]
  )

  React.useEffect(() => {
    if (!hotkey) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen(!open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [hotkey, open, setOpen])

  const trimmed = query.trim()
  const categoryLabel = (value: string) => categories.find((entry) => entry.value === value)?.label ?? value

  const sections = React.useMemo<Section[]>(() => {
    const toEntries = (prefix: string, list: (CommandPaletteItem | CommandPaletteFeatured)[]) =>
      list.map((item) => ({ key: `${prefix}-${item.id}`, item }))

    // Searching or filtering shows plain results grouped by category, like the reference.
    if (trimmed || category !== ALL) {
      const found = items.filter(
        (item) => (category === ALL || item.category === category) && (!trimmed || matches(item, trimmed))
      )
      const groups = new Map<string, CommandPaletteItem[]>()
      for (const item of found) groups.set(item.category, [...(groups.get(item.category) ?? []), item])
      return [...groups].map(([value, list]) => ({
        id: `result-${value}`,
        label: categoryLabel(value),
        layout: "list" as const,
        entries: toEntries(`result-${value}`, list),
      }))
    }
    return [
      { id: "recents", label: "Recent", layout: "list" as const, entries: toEntries("recent", recents) },
      { id: "featured", label: "Featured", layout: "cards" as const, entries: toEntries("featured", featured) },
      { id: "trending", label: "Trending", layout: "columns" as const, entries: toEntries("trending", trending) },
    ].filter((section) => section.entries.length > 0)
    // categoryLabel only reads `categories`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed, category, items, recents, featured, trending, categories])

  const flat = sections.flatMap((section) => section.entries)
  const active = flat[Math.min(activeIndex, flat.length - 1)]
  const optionId = (key: string) => `${baseId}-${key}`

  // A new query or filter starts the highlight at the top again.
  React.useEffect(() => setActiveIndex(0), [trimmed, category])

  React.useEffect(() => {
    if (!active) return
    document.getElementById(optionId(active.key))?.scrollIntoView({ block: "nearest" })
    // optionId is derived from the stable baseId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const choose = (entry: Entry | undefined) => {
    if (!entry) return
    onSelect?.(entry.item)
    setOpen(false)
  }

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!flat.length) return
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % flat.length)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + flat.length) % flat.length)
    } else if (event.key === "Enter") {
      event.preventDefault()
      choose(active)
    }
  }

  const optionProps = (entry: Entry) => {
    const index = flat.indexOf(entry)
    return {
      id: optionId(entry.key),
      role: "option" as const,
      "aria-selected": active?.key === entry.key,
      "data-active": active?.key === entry.key ? "" : undefined,
      onMouseMove: () => index !== activeIndex && setActiveIndex(index),
      onClick: () => choose(entry),
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogContent
        showCloseButton={false}
        data-slot="command-palette"
        className="top-[12vh] flex max-h-[76vh] translate-y-0 flex-col gap-0 overflow-hidden border-glass-border bg-glass-panel p-0 backdrop-blur-dialog sm:max-w-180"
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">
          Type to search, use the arrow keys to move through results and press Enter to open one.
        </DialogDescription>

        <div className="flex flex-col gap-3 p-3 pb-2">
          <InputGroup className="h-11 rounded-xl">
            <InputGroupAddon>
              <Icon name="search" className="size-5" />
            </InputGroupAddon>
            <InputGroupInput
              autoFocus
              role="combobox"
              aria-label="Search"
              aria-expanded={flat.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={active ? optionId(active.key) : undefined}
              placeholder={placeholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
              className="text-base"
            />
            {query ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setQuery("")}>
                  <Icon name="close" />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>

          {trimmed ? null : (
            <ToggleGroup
              aria-label="Filter by"
              variant="ghost"
              size="sm"
              spacing={1.5}
              value={[category]}
              onValueChange={(next: unknown[]) => {
                // Pressing the chosen chip again would leave nothing selected; fall back to All.
                setCategory((next[0] as string | undefined) ?? ALL)
              }}
              className="no-scrollbar w-full overflow-x-auto"
            >
              <ToggleGroupItem value={ALL} className="border border-separator">
                All
              </ToggleGroupItem>
              {categories.map((entry) => (
                <ToggleGroupItem key={entry.value} value={entry.value} className="border border-separator">
                  {entry.icon ? <Icon name={entry.icon} className="size-3.5" /> : null}
                  {entry.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </div>

        {/* The message sits outside the listbox, which may only hold groups and options. */}
        {sections.length === 0 ? (
          <p role="status" className="px-5 py-10 text-center text-sm text-muted-foreground">
            {trimmed
              ? `Nothing matches “${trimmed}”. Try a shorter word or another filter.`
              : "Nothing here yet. Pick another filter or start typing."}
          </p>
        ) : null}
        <div
          id={listId}
          role="listbox"
          aria-label={trimmed ? `Results for ${trimmed}` : "Suggestions"}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3"
        >
          {sections.map((section) => {
            const labelId = `${baseId}-${section.id}-label`
            return (
              <div key={section.id} role="group" aria-labelledby={labelId} className="flex flex-col gap-1 pt-2">
                <div id={labelId} className="px-2 py-1 text-xs text-muted-foreground">
                  {section.label}
                </div>

                {section.layout === "cards" ? (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {section.entries.map((entry) => {
                      const card = entry.item as CommandPaletteFeatured
                      return (
                        <div
                          key={entry.key}
                          {...optionProps(entry)}
                          className="group/card relative isolate flex h-28 cursor-pointer flex-col justify-end overflow-hidden rounded-xl p-3 outline-2 -outline-offset-2 outline-transparent transition-[filter,outline-color] duration-(--duration-normal) hover:brightness-110 data-active:outline-foreground/60"
                        >
                          {/* A plain <img> keeps the block framework-agnostic; swap in next/image in your app if you like. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={card.image} alt={card.alt} className="absolute inset-0 -z-10 size-full object-cover" />
                          {/* Scrim keeps the title readable on any photo. */}
                          <span aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-background via-background/80 to-background/20" />
                          <span className="absolute top-2.5 left-2.5 rounded-md bg-background/70 px-1.5 py-0.5 text-2xs font-medium text-foreground backdrop-blur-chip">
                            {card.tag}
                          </span>
                          {card.badge ? (
                            <Badge variant={card.badge.variant} className="absolute top-2.5 right-2.5">
                              {card.badge.label}
                            </Badge>
                          ) : null}
                          <span className="flex items-center gap-1 font-grotesk text-sm font-bold text-foreground uppercase">
                            {card.title}
                            <Icon name="north_east" className="size-3.5" />
                          </span>
                          <span className="line-clamp-1 text-xs text-foreground">{card.description}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className={cn("grid gap-0.5", section.layout === "columns" && "sm:grid-cols-2")}>
                    {section.entries.map((entry) => {
                      const item = entry.item as CommandPaletteItem
                      return (
                        <div
                          key={entry.key}
                          {...optionProps(entry)}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-(--duration-normal) data-active:bg-secondary"
                        >
                          <IconTile name={item.icon} size="lg" />
                          <span className="flex min-w-0 flex-col">
                            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                              <span className="truncate">{item.title}</span>
                              {item.badge ? <Badge variant={item.badge.variant}>{item.badge.label}</Badge> : null}
                            </span>
                            {item.description ? (
                              <span className="truncate text-xs text-muted-foreground">{item.description}</span>
                            ) : null}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
