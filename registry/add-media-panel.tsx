"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Icon, type IconName } from "@/components/ui/icon"
import { MediaTile } from "@/components/ui/media-tile"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Relative on purpose: shadcn installs both blocks side by side and leaves relative imports alone.
import { EmptyState } from "./empty-state"

export type MediaSource = "uploads" | "elements" | "generations" | "liked"

export type MediaItem = {
  id: string
  src: string
  alt: string
}

export type AddMediaPanelProps = Omit<React.ComponentProps<"section">, "onSelect"> & {
  /** Items per tab. Leave a tab out (or pass `[]`) to show its empty state. */
  items: Partial<Record<MediaSource, MediaItem[]>>
  /** Tabs still fetching: their grid shows skeleton tiles. */
  loading?: Partial<Record<MediaSource, boolean>>
  defaultTab?: MediaSource
  /** The most items someone can pick at once, such as the free reference slots. */
  maxSelected?: number
  /** Accepted file types for the upload button, as the file input's `accept`. */
  accept?: string
  title?: string
  /** Label for the confirm button, named for where the media goes, such as "Add to references". */
  confirmLabel?: string
  onUpload?: (files: File[]) => void
  onConfirm?: (items: MediaItem[]) => void
  onClose?: () => void
}

const TABS: { value: MediaSource; label: string; empty: { icon: IconName; title: string; description: string } }[] = [
  {
    value: "uploads",
    label: "Uploads",
    empty: {
      icon: "upload",
      title: "Nothing uploaded yet",
      description: "Upload photos, sketches or product shots to use them as references in any studio.",
    },
  },
  {
    value: "elements",
    label: "Elements",
    empty: {
      icon: "category",
      title: "No saved elements",
      description: "Save a character, product or place as an element and it stays consistent across every shot.",
    },
  },
  {
    value: "generations",
    label: "Generations",
    empty: {
      icon: "photo_library",
      title: "No generations yet",
      description: "Images and clips you create land here, ready to reuse as the starting point for the next one.",
    },
  },
  {
    value: "liked",
    label: "Liked",
    empty: {
      icon: "favorite",
      title: "Nothing liked yet",
      description: "Like a result from your feed or the community and it is kept here for quick reuse.",
    },
  },
]

// The add-media panel (docs/inventory.md §3): source tabs over a grid of
// media, skeleton tiles while a tab loads, an empty state per tab, and an
// upload action. People pick one or more items and confirm with a white
// button; nothing here spends credits, so nothing is lime but the selection.
export function AddMediaPanel({
  items,
  loading = {},
  defaultTab = "uploads",
  maxSelected = 4,
  accept = "image/png,image/jpeg,image/webp",
  title = "Add media",
  confirmLabel = "Add to project",
  onUpload,
  onConfirm,
  onClose,
  className,
  ...props
}: AddMediaPanelProps) {
  const [selected, setSelected] = React.useState<MediaItem[]>([])
  const fileInput = React.useRef<HTMLInputElement>(null)
  const titleId = React.useId()
  const full = selected.length >= maxSelected

  const toggle = (item: MediaItem) =>
    setSelected((current) =>
      current.some((entry) => entry.id === item.id)
        ? current.filter((entry) => entry.id !== item.id)
        : current.length >= maxSelected
          ? current
          : [...current, item],
    )

  const openFilePicker = () => fileInput.current?.click()

  const uploadTile = (
    <li className="aspect-square">
      <button
        type="button"
        onClick={openFilePicker}
        className="flex size-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-glass-border bg-glass text-sm font-medium text-foreground transition-[filter] duration-(--duration-normal) outline-none hover:brightness-80 active:brightness-60 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-secondary">
          <Icon name="add" />
        </span>
        Upload media
      </button>
    </li>
  )

  return (
    <section
      data-slot="add-media-panel"
      aria-labelledby={titleId}
      className={cn("flex w-full flex-col gap-4 rounded-2xl border border-separator bg-dialog p-4 text-foreground shadow-popover", className)}
      {...props}
    >
      <input
        ref={fileInput}
        type="file"
        accept={accept}
        multiple
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          if (files.length) onUpload?.(files)
          // Reset so picking the same file twice still fires a change.
          event.target.value = ""
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <Heading level="title-sm" id={titleId} render={<h2 />}>
          {title}
        </Heading>
        {onClose ? (
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </Button>
        ) : null}
      </div>

      <Tabs defaultValue={defaultTab} className="w-full flex-col gap-3">
        <TabsList aria-label="Media source" className="max-w-full overflow-x-auto">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-none">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => {
          const list = items[tab.value] ?? []
          const isUploads = tab.value === "uploads"
          return (
            <TabsContent key={tab.value} value={tab.value} className="min-h-72">
              {loading[tab.value] ? (
                <div role="status" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  <span className="sr-only">Loading {tab.label.toLowerCase()}</span>
                  {Array.from({ length: 8 }, (_, index) => (
                    <Skeleton key={index} className="aspect-square rounded-xl" />
                  ))}
                </div>
              ) : list.length === 0 ? (
                <EmptyState
                  className="min-h-72 py-8"
                  headingTag="h3"
                  icon={tab.empty.icon}
                  title={tab.empty.title}
                  description={tab.empty.description}
                  action={
                    isUploads ? (
                      <Button type="button" onClick={openFilePicker}>
                        <Icon name="upload" />
                        Upload media
                      </Button>
                    ) : undefined
                  }
                  hint={isUploads ? "PNG, JPG or WebP, up to 20 MB each" : undefined}
                />
              ) : (
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {isUploads ? uploadTile : null}
                  {list.map((item) => {
                    const index = selected.findIndex((entry) => entry.id === item.id)
                    const isSelected = index >= 0
                    return (
                      <li key={item.id}>
                        <MediaTile
                          src={item.src}
                          alt={item.alt}
                          loading="lazy"
                          inset="sm"
                          selected={isSelected}
                          // Unpicked tiles stay focusable but say why they do nothing once the limit is reached.
                          aria-disabled={!isSelected && full ? true : undefined}
                          onClick={() => toggle(item)}
                          // The pick order replaces the check: it is the order the references are used in.
                          indicator={
                            <span
                              aria-hidden="true"
                              className={cn(
                                "flex size-5 items-center justify-center rounded-full border text-2xs font-bold tabular-nums",
                                isSelected
                                  ? "border-transparent bg-brand text-brand-foreground"
                                  : "border-glass-border bg-overlay text-transparent",
                              )}
                            >
                              {isSelected ? index + 1 : null}
                            </span>
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

      <div className="flex items-center justify-between gap-3 border-t border-separator pt-3">
        <p role="status" className="text-sm text-muted-foreground tabular-nums">
          {selected.length} of {maxSelected} selected
        </p>
        <div className="flex items-center gap-2">
          {selected.length ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelected([])}>
              Clear
            </Button>
          ) : null}
          <Button type="button" size="sm" disabled={!selected.length} onClick={() => onConfirm?.(selected)}>
            <Icon name="add" />
            {confirmLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
