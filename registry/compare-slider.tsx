"use client"

import * as React from "react"
import { HandleRoot, Item, Provider, Root } from "react-compare-slider/components"
import { useReactCompareSlider } from "react-compare-slider/hooks"

import { cn } from "@/lib/mantis-cn"
import { Icon } from "@/components/ui/icon"

/** One side of the comparison. */
export type CompareSliderImage = {
  src: string
  /** Describes the picture. Leave it empty when the label beside it already says what it is. */
  alt: string
  /** A short tag shown in the corner, such as "Before" or "4K upscale". */
  label?: string
}

export interface CompareSliderProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** The picture revealed on the left: the original. */
  before: CompareSliderImage
  /** The picture revealed on the right: the result. */
  after: CompareSliderImage
  /** Where the divider starts, as a percentage from the left. */
  defaultPosition?: number
  /** Frame shape: video (16:9), square, portrait (4:5) or landscape (4:3). */
  aspect?: "video" | "square" | "portrait" | "landscape"
  /** Names the comparison for screen readers, such as "Original and 4K upscale". */
  label?: string
}

const ASPECT = { video: "aspect-video", square: "aspect-square", portrait: "aspect-4/5", landscape: "aspect-4/3" }

function Side({ image, align }: { image: CompareSliderImage; align: "start" | "end" }) {
  return (
    <div className="relative size-full">
      {/* A plain <img> keeps the block framework-agnostic; swap in next/image in your app if you like. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.src} alt={image.alt} draggable={false} className="size-full object-cover" />
      {image.label ? (
        <span className={cn("absolute top-3 rounded-lg bg-overlay px-2 py-1 text-xs font-medium text-foreground", align === "start" ? "left-3" : "right-3")}>
          {image.label}
        </span>
      ) : null}
    </div>
  )
}

// A before and after comparison: two pictures stacked in one frame with a divider people drag, or move
// with the arrow keys, to reveal more of either. The dragging is react-compare-slider; the look is Mantis's.
function CompareSlider({ before, after, defaultPosition = 50, aspect = "video", label = "Before and after", className, ...props }: CompareSliderProps) {
  // One press of an arrow key moves the divider a twentieth of the way.
  const slider = useReactCompareSlider({ defaultPosition, keyboardIncrement: "5%" })
  return (
    <div data-slot="compare-slider" className={cn("overflow-hidden rounded-2xl bg-card", ASPECT[aspect], className)} {...props}>
      {/* Assembled from the library's parts, not its ready-made slider, so the divider can carry this
          comparison's name; the ready-made one is always called by a fixed instruction sentence. */}
      <Provider {...slider}>
        <Root className="size-full">
          <Item item="itemOne">
            <Side image={before} align="start" />
          </Item>
          <Item item="itemTwo">
            <Side image={after} align="end" />
          </Item>
          <HandleRoot aria-label={label} className="group/handle">
            <div className="flex h-full w-0.5 items-center justify-center bg-primary">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-popover group-focus-visible/handle:ring-3 group-focus-visible/handle:ring-ring/50">
                <Icon name="chevron_left" className="-mr-1.5 size-5" />
                <Icon name="chevron_right" className="-ml-1.5 size-5" />
              </span>
            </div>
          </HandleRoot>
        </Root>
      </Provider>
    </div>
  )
}

export { CompareSlider }
