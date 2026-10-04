"use client"

import { useState, type CSSProperties, type ReactNode } from "react"
import { cn } from "@/lib/mantis-cn"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { MediaTile } from "@/components/ui/media-tile"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export interface GenerationFeedItem {
  id: string
  /** The finished image or a video poster. Leave it out while `status` is "generating". */
  src?: string
  /** Describes what the picture shows; the prompt is often too long to read as alt text. */
  alt: string
  /** The full prompt. Grid tiles hide it; the list view shows an excerpt. */
  prompt: string
  /** The model's display name in your product. */
  model: string
  /** Short setting values, already formatted: "16:9", "1080p", "4 images". */
  settings?: string[]
  /** When it was made, written for people: "2 min ago", "Sep 30". */
  createdAt: string
  /** The same moment as an ISO date. */
  createdAtDateTime?: string
  /** Width over height of the media, such as 16 / 9. Defaults to square. */
  aspectRatio?: number
  /** "generating" draws a shimmering placeholder with a status word instead of media. */
  status?: "ready" | "generating"
}

export type GenerationFeedView = "grid" | "list"

export interface GenerationFeedProps {
  items: GenerationFeedItem[]
  /** True on first load: draws skeleton tiles in the current view instead of items. */
  loading?: boolean
  /** Controlled view. Pair with `onViewChange`. */
  view?: GenerationFeedView
  defaultView?: GenerationFeedView
  onViewChange?: (view: GenerationFeedView) => void
  /** Smallest tile width in px for the grid. The zoom slider drives it between 120 and 400. */
  tileSize?: number
  defaultTileSize?: number
  onTileSizeChange?: (size: number) => void
  /** Opens one generation, usually in the lightbox inspector. */
  onOpen?: (item: GenerationFeedItem) => void
  onDownload?: (item: GenerationFeedItem) => void
  /** Puts the prompt and settings back in the composer. */
  onReuse?: (item: GenerationFeedItem) => void
  /** Shown when loading has finished and there are no items. Defaults to a dashed placeholder. */
  empty?: ReactNode
  /** Visible heading above the toolbar. Omit it when the page already titles the feed. */
  title?: ReactNode
  className?: string
}

const MIN_TILE = 120
const MAX_TILE = 400
const SKELETON_COUNT = 8

// The reference's history: an edge-to-edge grid with 2px gutters and a small
// zoom slider in the toolbar, plus a list view that puts each result beside
// its prompt and settings. Media is the brightest thing; chrome stays quiet.
function GenerationFeed({
  items,
  loading = false,
  view: viewProp,
  defaultView = "grid",
  onViewChange,
  tileSize: tileSizeProp,
  defaultTileSize = 220,
  onTileSizeChange,
  onOpen,
  onDownload,
  onReuse,
  empty,
  title,
  className,
}: GenerationFeedProps) {
  const [viewState, setViewState] = useState(defaultView)
  const [tileState, setTileState] = useState(defaultTileSize)
  const view = viewProp ?? viewState
  const tileSize = tileSizeProp ?? tileState

  function changeView(next: GenerationFeedView) {
    if (viewProp === undefined) setViewState(next)
    onViewChange?.(next)
  }

  function changeTileSize(next: number) {
    if (tileSizeProp === undefined) setTileState(next)
    onTileSizeChange?.(next)
  }

  const isEmpty = !loading && items.length === 0

  return (
    <section
      data-slot="generation-feed"
      aria-busy={loading || undefined}
      className={cn("flex w-full flex-col gap-3", className)}
    >
      <div className="flex flex-wrap items-center gap-3">
        {title ? <h2 className="text-title-sm text-foreground">{title}</h2> : null}
        <div className="ml-auto flex items-center gap-4">
          {view === "grid" ? (
            <div className="flex w-36 items-center gap-2 text-muted-foreground">
              <Icon name="zoom_out" />
              <Slider
                className="flex-1"
                aria-label="Tile size"
                min={MIN_TILE}
                max={MAX_TILE}
                step={20}
                value={[tileSize]}
                onValueChange={(value) => changeTileSize(Array.isArray(value) ? value[0] : value)}
                disabled={isEmpty}
              />
              <Icon name="zoom_in" />
            </div>
          ) : null}
          <ToggleGroup
            aria-label="Layout"
            size="sm"
            value={[view]}
            onValueChange={(value) => {
              // A segmented control always has one choice; ignore the click that would clear it.
              const next = value[0] as GenerationFeedView | undefined
              if (next) changeView(next)
            }}
          >
            <ToggleGroupItem value="grid" aria-label="Grid">
              <Icon name="grid_view" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List">
              <Icon name="view_agenda" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {isEmpty ? (
        (empty ?? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-glass-border px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-glass text-2xl text-muted-foreground">
              <Icon name="image" />
            </div>
            <p className="text-sm font-medium text-foreground">Nothing generated yet</p>
            <p className="max-w-sm text-sm text-pretty text-muted-foreground">
              Write a prompt in the composer and your images and clips will collect here, newest first.
            </p>
          </div>
        ))
      ) : view === "grid" ? (
        <ul
          aria-label={loading ? "Loading generations" : "Generations"}
          className="grid grid-cols-[repeat(auto-fill,minmax(min(var(--tile-size),100%),1fr))] gap-0.5"
          style={{ "--tile-size": `${tileSize}px` } as CSSProperties}
        >
          {loading
            ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <li key={index}>
                  <Skeleton className="aspect-square rounded-none" />
                </li>
              ))
            : items.map((item) => (
                <GridTile key={item.id} item={item} onOpen={onOpen} onDownload={onDownload} onReuse={onReuse} />
              ))}
        </ul>
      ) : (
        <ul aria-label={loading ? "Loading generations" : "Generations"} className="flex flex-col divide-y divide-separator">
          {loading
            ? Array.from({ length: 3 }, (_, index) => (
                <li key={index} className="flex flex-col gap-4 py-4 first:pt-0 md:flex-row">
                  <Skeleton className="aspect-video w-full rounded-xl md:w-72" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </li>
              ))
            : items.map((item) => (
                <ListEntry key={item.id} item={item} onOpen={onOpen} onDownload={onDownload} onReuse={onReuse} />
              ))}
        </ul>
      )}
    </section>
  )
}

type EntryProps = {
  item: GenerationFeedItem
  onOpen?: (item: GenerationFeedItem) => void
  onDownload?: (item: GenerationFeedItem) => void
  onReuse?: (item: GenerationFeedItem) => void
}

// Shown in place of the media while a generation is still running.
function Generating() {
  return (
    <div className="relative size-full">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="relative flex size-full items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
        <Spinner label="Generating" />
        <span aria-hidden="true">Generating</span>
      </div>
    </div>
  )
}

// The same inset focus ring whether the tile is one button or a frame with actions.
const TILE_FOCUS = "focus-visible:ring-3 focus-visible:ring-inset"

function GridTile({ item, onOpen, onDownload, onReuse }: EntryProps) {
  const ready = item.status !== "generating" && Boolean(item.src)
  return (
    <li>
      <MediaTile
        aspect={item.aspectRatio ?? 1}
        radius="none"
        src={ready ? item.src : undefined}
        alt={item.alt}
        // A full-tile button opens the generation; the action column sits above it.
        onClick={ready && onOpen ? () => onOpen(item) : undefined}
        label={`Open: ${item.alt}`}
        className={TILE_FOCUS}
        actions={
          ready && (onDownload || onReuse) ? (
            <>
              {onDownload ? (
                <Button variant="glass" size="icon-sm" className="backdrop-blur-glass" aria-label={`Download: ${item.alt}`} onClick={() => onDownload(item)}>
                  <Icon name="download" />
                </Button>
              ) : null}
              {onReuse ? (
                <Button variant="glass" size="icon-sm" className="backdrop-blur-glass" aria-label={`Reuse prompt: ${item.alt}`} onClick={() => onReuse(item)}>
                  <Icon name="autorenew" />
                </Button>
              ) : null}
            </>
          ) : undefined
        }
      >
        {ready ? null : <Generating />}
      </MediaTile>
    </li>
  )
}

function ListEntry({ item, onOpen, onDownload, onReuse }: EntryProps) {
  const ready = item.status !== "generating" && Boolean(item.src)
  return (
    <li className="py-4 first:pt-0">
      <article className="flex flex-col gap-4 md:flex-row" aria-label={item.alt}>
        <MediaTile
          aspect={item.aspectRatio ?? 1}
          src={ready ? item.src : undefined}
          alt={item.alt}
          onClick={ready && onOpen ? () => onOpen(item) : undefined}
          label={`Open: ${item.alt}`}
          className={cn("shrink-0 md:w-72", TILE_FOCUS)}
        >
          {ready ? null : <Generating />}
        </MediaTile>

        {/* The metadata rail: what was asked, with what, and when. */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="line-clamp-4 text-sm text-pretty text-foreground">{item.prompt}</p>
          <dl className="flex flex-wrap items-center gap-1.5 text-xs">
            <dt className="sr-only">Model</dt>
            <dd className="inline-flex h-6 items-center gap-1 rounded-lg bg-chip px-2 font-medium text-chip-foreground">
              <Icon name="star_shine-fill" className="text-muted-foreground" />
              {item.model}
            </dd>
            {item.settings?.length ? <dt className="sr-only">Settings</dt> : null}
            {item.settings?.map((setting) => (
              <dd key={setting} className="inline-flex h-6 items-center rounded-lg bg-chip px-2 font-medium text-chip-foreground">
                {setting}
              </dd>
            ))}
          </dl>
          <p className="text-xs text-muted-foreground">
            <time dateTime={item.createdAtDateTime}>{item.createdAt}</time>
          </p>
          {ready && (onReuse || onDownload) ? (
            <div className="flex flex-wrap gap-2">
              {onReuse ? (
                <Button variant="glass" size="sm" onClick={() => onReuse(item)}>
                  <Icon name="autorenew" />
                  Reuse prompt
                </Button>
              ) : null}
              {onDownload ? (
                <Button variant="ghost" size="sm" onClick={() => onDownload(item)}>
                  <Icon name="download" />
                  Download
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>
    </li>
  )
}

export { GenerationFeed }
