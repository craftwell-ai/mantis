import * as React from "react"
import { cn } from "@/lib/mantis-cn"
import { Icon } from "@/components/ui/icon"

const ASPECT = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-4/5",
  landscape: "aspect-4/3",
  auto: "",
} as const

const RADIUS = { none: "rounded-none", lg: "rounded-lg", xl: "rounded-xl", "2xl": "rounded-2xl" } as const

// How far corner content sits from the edge. It grows with the tile, as in the
// reference: 4px on small reference thumbnails, 12px on big marketing cards.
const INSET = {
  xs: { start: "top-1 left-1", end: "top-1 right-1", bottom: "right-1 bottom-1" },
  sm: { start: "top-1.5 left-1.5", end: "top-1.5 right-1.5", bottom: "right-1.5 bottom-1.5" },
  md: { start: "top-2 left-2", end: "top-2 right-2", bottom: "right-2 bottom-2" },
  lg: { start: "top-3 left-3", end: "top-3 right-3", bottom: "right-3 bottom-3" },
} as const

// Shown on hover or keyboard focus, and always on touch screens, which cannot hover.
const REVEAL =
  "opacity-0 transition-opacity duration-(--duration-normal) group-focus-within/media-tile:opacity-100 group-hover/media-tile:opacity-100 pointer-coarse:opacity-100"

type MediaTileProps = Omit<React.ComponentProps<"div">, "title" | "onClick"> & {
  /** The picture. Leave it out and pass `children` for a video, a placeholder or a loading state. */
  src?: string
  /** Describes what the picture shows. Empty only when text right beside the tile already says it. */
  alt?: string
  /** Passed to the `<img>`: "lazy" for long grids. */
  loading?: "lazy" | "eager"
  /** Frame shape: square, video (16:9), portrait (4:5), landscape (4:3), a width-over-height number (a picture's own ratio), or auto (a height you set). */
  aspect?: "square" | "video" | "portrait" | "landscape" | "auto" | number
  /** Corner radius of the frame; none for edge-to-edge grids. */
  radius?: "none" | "lg" | "xl" | "2xl"
  /** Distance of corner content from the edge; grows with the tile. */
  inset?: "xs" | "sm" | "md" | "lg"
  /** An uppercase label over a dark fade at the bottom, such as a preset's name. */
  title?: React.ReactNode
  /** One short line under the title. */
  description?: React.ReactNode
  /** Top-left: a badge such as "New". Decorative; clicks pass through to the tile. */
  badge?: React.ReactNode
  /** Bottom-right: a short fact such as a clip's duration. Decorative. */
  detail?: React.ReactNode
  /** Draws the lime selection ring. On a tile that is itself a button, also sets `aria-pressed`. */
  selected?: boolean
  /** Top-right selection mark. Defaults to a lime check while selected; pass your own (a pick order number) or `false` for none. */
  indicator?: React.ReactNode
  /** Controls over the tile, such as Download or a select checkbox. Shown on hover and focus unless `actionsVisible`. */
  actions?: React.ReactNode
  /** Which top corner the actions sit in. */
  actionsAlign?: "start" | "end"
  /** Keep the actions on screen instead of revealing them on hover. */
  actionsVisible?: boolean
  /** A bottom row over a fade, shown on hover and focus, such as the author and a like button. */
  footer?: React.ReactNode
  /** Makes the tile a link to this address (a real `<a>`). */
  href?: string
  /** Makes the tile a button. */
  onClick?: React.MouseEventHandler<HTMLElement>
  /** The button or link's accessible name. Defaults to the content (or `alt` when the tile also holds actions). */
  label?: string
}

// The image or video tile the reference repeats in pickers, galleries, feeds
// and libraries: media filling a rounded frame, with optional title, badges,
// a lime selection ring and hover actions. A tile that only opens or toggles
// is one button or link. A tile that also holds its own controls is a frame
// with a full-size button or link under them, because buttons cannot nest.
function MediaTile({
  src,
  alt,
  loading,
  aspect = "square",
  radius = "xl",
  inset = "md",
  title,
  description,
  badge,
  detail,
  selected,
  indicator,
  actions,
  actionsAlign = "end",
  actionsVisible = false,
  footer,
  href,
  onClick,
  label,
  children,
  className,
  style,
  ...props
}: MediaTileProps) {
  const interactive = href !== undefined || onClick !== undefined
  // Controls cannot live inside a button or link, so they get a cover element instead.
  const covered = interactive && Boolean(actions || footer)
  const corners = INSET[inset]
  const ratio = typeof aspect === "number" ? aspect : undefined
  const mark = indicator === undefined ? (selected ? <DefaultCheck /> : null) : indicator || null

  const media = (
    <span
      data-slot="media-tile-media"
      className={cn(
        "block size-full",
        // A card that opens on click (a stretched link) marks itself group/media-card; the picture dims with it.
        // A tile that is itself the control dims as a whole instead, so its media needs no filter of its own.
        !(interactive && !covered) &&
          "transition-[filter] duration-(--duration-normal) group-hover/media-card:brightness-80 group-active/media-card:brightness-60",
        // Under a cover, only the media dims, not the controls. A hover footer is feedback enough on its own.
        covered && !footer && "group-hover/media-tile:brightness-80 group-active/media-tile:brightness-60"
      )}
    >
      {src !== undefined ? (
        // A plain <img> keeps the primitive framework-agnostic; swap in next/image in your app if you like.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? ""} loading={loading} className="size-full object-cover" />
      ) : (
        children
      )}
    </span>
  )

  const overlays = (
    <>
      {title || description ? (
        <>
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-overlay to-transparent" />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col p-3 text-left">
            {title ? <span className="font-grotesk text-label-caps text-foreground uppercase">{title}</span> : null}
            {description ? <span className="truncate text-xs text-foreground">{description}</span> : null}
          </span>
        </>
      ) : null}
      {badge ? <span className={cn("pointer-events-none absolute flex", corners.start)}>{badge}</span> : null}
      {mark ? <span className={cn("pointer-events-none absolute flex", corners.end)}>{mark}</span> : null}
      {detail ? <span className={cn("pointer-events-none absolute flex", corners.bottom)}>{detail}</span> : null}
    </>
  )

  const controls = (
    <>
      {actions ? (
        <div
          data-slot="media-tile-actions"
          className={cn("absolute flex flex-col gap-1", actionsAlign === "start" ? corners.start : corners.end, !actionsVisible && REVEAL)}
        >
          {actions}
        </div>
      ) : null}
      {footer ? (
        <div
          data-slot="media-tile-footer"
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-2 bg-linear-to-t from-overlay to-transparent p-2 pt-10 [&_a]:pointer-events-auto [&_button]:pointer-events-auto",
            REVEAL
          )}
        >
          {footer}
        </div>
      ) : null}
    </>
  )

  const frame = cn(
    "group/media-tile relative isolate block w-full overflow-hidden bg-field text-left ring-2 ring-transparent transition-[filter,box-shadow] duration-(--duration-normal) outline-none",
    typeof aspect === "string" && ASPECT[aspect],
    RADIUS[radius],
    selected && "ring-brand focus-visible:ring-brand"
  )
  const frameStyle = ratio ? { aspectRatio: ratio, ...style } : style

  if (interactive && !covered) {
    // The whole tile is one control: it dims as a unit, ring and marks included.
    const look = cn(
      frame,
      "cursor-pointer hover:brightness-80 active:brightness-60 focus-visible:ring-ring/50 aria-disabled:opacity-50",
      selected && "focus-visible:ring-brand",
      className
    )
    const content = (
      <>
        {media}
        {overlays}
      </>
    )
    return href !== undefined ? (
      <a
        data-slot="media-tile"
        href={href}
        onClick={onClick}
        aria-label={label}
        className={look}
        style={frameStyle}
        {...(props as React.ComponentProps<"a">)}
      >
        {content}
      </a>
    ) : (
      <button
        data-slot="media-tile"
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={selected}
        className={look}
        style={frameStyle}
        {...(props as React.ComponentProps<"button">)}
      >
        {content}
      </button>
    )
  }

  const coverClass =
    "absolute inset-0 rounded-[inherit] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
  const coverName = label ?? alt

  return (
    <div data-slot="media-tile" className={cn(frame, className)} style={frameStyle} {...(covered ? {} : props)}>
      {media}
      {covered ? (
        href !== undefined ? (
          <a href={href} onClick={onClick} aria-label={coverName} className={coverClass} {...(props as React.ComponentProps<"a">)} />
        ) : (
          <button type="button" onClick={onClick} aria-label={coverName} className={coverClass} {...(props as React.ComponentProps<"button">)} />
        )
      ) : null}
      {overlays}
      {controls}
    </div>
  )
}

function DefaultCheck() {
  return (
    <span className="flex size-5 items-center justify-center rounded-full bg-brand text-brand-foreground">
      <Icon name="check" className="size-3.5" />
    </span>
  )
}

export { MediaTile, type MediaTileProps }
