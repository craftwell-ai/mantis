"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { MediaTile } from "@/components/ui/media-tile"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type GalleryPreset = {
  value: string
  title: string
  image: string
  imageAlt: string
  /** Model values this preset works with; it shows under each of their tabs and under All. */
  models: string[]
  isNew?: boolean
}

export type GalleryModelTab = { value: string; label: string }

export type PresetGalleryProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  presets: GalleryPreset[]
  /** One tab per model; an "All" tab is added in front. */
  models: GalleryModelTab[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  defaultModel?: string
  /** True while presets load: the grid holds skeleton tiles in their place. */
  loading?: boolean
}

const ALL = "all"

// DESIGN.md › Gallery, as the preset browser: model tabs and a search field
// above a grid of media tiles, each an image with its uppercase title over it.
// The chosen preset gets the lime selection outline and a check.
export function PresetGallery({
  presets,
  models,
  value,
  defaultValue,
  onValueChange,
  defaultModel = ALL,
  loading = false,
  className,
  ...props
}: PresetGalleryProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [tab, setTab] = React.useState(defaultModel)
  const [query, setQuery] = React.useState("")
  const selected = value ?? uncontrolled

  const select = (next: string) => {
    setUncontrolled(next)
    onValueChange?.(next)
  }

  const visible = (model: string) => {
    const needle = query.trim().toLowerCase()
    return presets.filter(
      (preset) =>
        (model === ALL || preset.models.includes(model)) && (!needle || preset.title.toLowerCase().includes(needle)),
    )
  }

  const tabs = [{ value: ALL, label: "All" }, ...models]

  return (
    <div data-slot="preset-gallery" className={cn("flex flex-col gap-4", className)} {...props}>
      <Tabs value={tab} onValueChange={(next) => setTab(String(next))} className="w-full flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <TabsList aria-label="Filter presets by model" className="max-w-full overflow-x-auto">
            {tabs.map((entry) => (
              <TabsTrigger key={entry.value} value={entry.value} className="flex-none">
                {entry.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <InputGroup className="ml-auto w-full sm:w-64">
            <InputGroupAddon align="inline-start">
              <Icon name="search" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              aria-label="Search presets"
              placeholder="Search presets"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>
        </div>
        {tabs.map((entry) => {
          const items = visible(entry.value)
          return (
            <TabsContent key={entry.value} value={entry.value}>
              {loading ? (
                <div role="status" className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  <span className="sr-only">Loading presets</span>
                  {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton key={index} className="aspect-video rounded-xl" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-glass-border px-6 py-12 text-center">
                  <p className="text-sm font-medium text-foreground">
                    {query ? `No presets called "${query.trim()}"` : "No presets for this model yet"}
                  </p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    {query
                      ? "Search by a look or a camera move, such as dolly, film or neon."
                      : "Presets made for this model will appear here. Try All to see every look."}
                  </p>
                  {query ? (
                    <Button variant="secondary" size="sm" onClick={() => setQuery("")}>
                      Clear search
                    </Button>
                  ) : null}
                </div>
              ) : (
                <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {items.map((preset) => {
                    const isSelected = preset.value === selected
                    return (
                      <li key={preset.value}>
                        <MediaTile
                          aspect="video"
                          src={preset.image}
                          alt={preset.imageAlt}
                          loading="lazy"
                          title={preset.title}
                          label={preset.title}
                          selected={isSelected}
                          onClick={() => select(preset.value)}
                          badge={
                            preset.isNew ? (
                              // The badge fill is translucent, so a dark backing keeps it legible on bright frames.
                              <span className="block rounded-md bg-overlay">
                                <Badge variant="new">New</Badge>
                              </span>
                            ) : null
                          }
                        />
                      </li>
                    )
                  })}
                </ul>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
