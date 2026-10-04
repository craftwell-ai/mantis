"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/mantis-cn"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { MediaTile } from "@/components/ui/media-tile"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

export interface MediaGridItem {
  id: string
  src: string
  /** Describes what the picture shows. */
  alt: string
  /** Intrinsic size, so each tile keeps its aspect ratio before the image loads. */
  width: number
  height: number
  author: { name: string; avatarSrc?: string }
  /** Like count, already known to the server. */
  likes?: number
  /** Whether the viewer has liked it. */
  liked?: boolean
}

export interface MediaGridProps {
  items: MediaGridItem[]
  /** Accessible name for the grid, such as "Community creations". */
  label: string
  /** First load: draws a masonry of skeleton tiles. */
  loading?: boolean
  /** More pages exist. Shows the Load more button and, with `autoLoad`, loads on scroll. */
  hasMore?: boolean
  /** A page is being fetched: skeleton tiles join the end and the button shows a spinner. */
  loadingMore?: boolean
  onLoadMore?: () => void
  /** Call `onLoadMore` when the end of the grid scrolls into view. The button stays as a fallback. */
  autoLoad?: boolean
  onOpen?: (item: MediaGridItem) => void
  onLike?: (item: MediaGridItem) => void
  onRecreate?: (item: MediaGridItem) => void
  /** Shown when loading has finished and nothing matched. */
  empty?: ReactNode
  className?: string
}

// Skeleton heights cycle through portrait, square and landscape so the loading
// masonry has the same ragged rhythm as real content.
const SKELETON_RATIOS = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-video", "aspect-[2/3]", "aspect-[4/3]"]

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

// The reference's community grid: a dense masonry with 4px gutters and no
// card chrome. The author and actions appear over the picture on hover or
// focus, and are always shown on touch screens, which cannot hover.
function MediaGrid({
  items,
  label,
  loading = false,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  autoLoad = false,
  onOpen,
  onLike,
  onRecreate,
  empty,
  className,
}: MediaGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!autoLoad || !hasMore || loadingMore || !onLoadMore) return
    const sentinel = sentinelRef.current
    if (!sentinel || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore()
      },
      // Start fetching a little before the end is visible so scrolling never stalls.
      { rootMargin: "600px 0px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [autoLoad, hasMore, loadingMore, onLoadMore])

  if (!loading && items.length === 0) {
    return (
      <div className={className}>
        {empty ?? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-glass-border px-6 py-16 text-center">
            <p className="text-sm font-medium text-foreground">No creations match yet</p>
            <p className="max-w-sm text-sm text-pretty text-muted-foreground">
              Try a broader search, or check back soon: new work is shared here every few minutes.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <section data-slot="media-grid" aria-label={label} aria-busy={loading || loadingMore || undefined} className={cn("flex flex-col gap-4", className)}>
      <ul className="columns-2 gap-1 sm:columns-3 lg:columns-4 xl:columns-5">
        {loading
          ? SKELETON_RATIOS.concat(SKELETON_RATIOS).map((ratio, index) => (
              <li key={index} className="mb-1 break-inside-avoid">
                <Skeleton className={cn("w-full rounded-none", ratio)} />
              </li>
            ))
          : items.map((item) => <Tile key={item.id} item={item} onOpen={onOpen} onLike={onLike} onRecreate={onRecreate} />)}
        {loadingMore
          ? SKELETON_RATIOS.slice(0, 4).map((ratio, index) => (
              <li key={`more-${index}`} className="mb-1 break-inside-avoid">
                <Skeleton className={cn("w-full rounded-none", ratio)} />
              </li>
            ))
          : null}
      </ul>

      <div ref={sentinelRef} className="flex justify-center">
        {hasMore && !loading ? (
          <Button variant="glass" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? (
              <>
                <Spinner label="Loading more creations" />
                Loading
              </>
            ) : (
              "Load more"
            )}
          </Button>
        ) : !loading && items.length > 0 ? (
          <p className="text-xs text-muted-foreground">You have reached the end.</p>
        ) : null}
      </div>
    </section>
  )
}

function Tile({
  item,
  onOpen,
  onLike,
  onRecreate,
}: {
  item: MediaGridItem
  onOpen?: (item: MediaGridItem) => void
  onLike?: (item: MediaGridItem) => void
  onRecreate?: (item: MediaGridItem) => void
}) {
  const initials = item.author.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)

  return (
    <li className="mb-1 break-inside-avoid">
      <MediaTile
        // The picture's own ratio, so the masonry keeps its shape before images load.
        aspect={item.width / item.height}
        radius="none"
        src={item.src}
        alt={item.alt}
        loading="lazy"
        onClick={onOpen ? () => onOpen(item) : undefined}
        label={`Open ${item.alt}, by ${item.author.name}`}
        // The hover layer: a scrim so white text stays readable on any picture.
        footer={
          <>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Avatar size="sm">
                {item.author.avatarSrc ? <AvatarImage src={item.author.avatarSrc} alt="" /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="truncate text-xs font-medium text-foreground">{item.author.name}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {onRecreate ? (
                <Button variant="glass" size="icon-sm" className="backdrop-blur-glass" aria-label={`Recreate ${item.alt}`} onClick={() => onRecreate(item)}>
                  <Icon name="autorenew" />
                </Button>
              ) : null}
              {onLike ? (
                <Button
                  variant="glass"
                  size="sm"
                  className={cn("backdrop-blur-glass", item.liked && "text-brand-text")}
                  aria-pressed={item.liked ?? false}
                  onClick={() => onLike(item)}
                >
                  <Icon name="favorite" />
                  <span className="sr-only">Like {item.alt},</span>
                  {compact.format(item.likes ?? 0)}
                </Button>
              ) : null}
            </div>
          </>
        }
      />
    </li>
  )
}

export { MediaGrid }
