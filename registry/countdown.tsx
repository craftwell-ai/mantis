"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Icon } from "@/components/ui/icon"

export interface CountdownProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** When the offer ends: a Date, a timestamp in ms, or an ISO string. */
  target: Date | number | string
  /** What is ending, such as "Launch pricing ends in". Shown above the tiles. */
  label?: string
  /** Replaces the label once the timer reaches zero. */
  expiredLabel?: string
  /** `default` is the boxed offer timer; `sm` is a compact inline row for bars and cards. */
  size?: "default" | "sm"
  /** Called once, when the timer reaches zero (or at mount if the target has already passed). */
  onExpire?: () => void
}

type Parts = { hours: number; minutes: number; seconds: number; done: boolean }

function toTime(target: CountdownProps["target"]) {
  return target instanceof Date ? target.getTime() : new Date(target).getTime()
}

function remaining(targetMs: number, nowMs: number): Parts {
  const totalSeconds = Math.max(0, Math.floor((targetMs - nowMs) / 1000))
  // Offers longer than a day still read in hours, as the reference does; 99 is
  // the most two tiles can show, and an offer that far out needs no timer.
  return {
    hours: Math.min(99, Math.floor(totalSeconds / 3600)),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: totalSeconds === 0,
  }
}

const pad = (value: number) => String(value).padStart(2, "0")

const UNITS = [
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const

// The reference's offer timer: a ticket-shaped panel with the label on top, a
// dashed tear line, then hh:mm:ss as three tiles, glass on glass exactly as the
// reference. The grey unit labels are contrast-exempt by owner decision
// (2026-10-02, see CLAUDE.md).
function Countdown({
  target,
  label = "Offer ends in",
  expiredLabel = "This offer has ended",
  size = "default",
  onExpire,
  className,
  ...props
}: CountdownProps) {
  const targetMs = toTime(target)
  const [parts, setParts] = React.useState(() => remaining(targetMs, Date.now()))
  const labelId = React.useId()
  const expireRef = React.useRef(onExpire)
  React.useEffect(() => {
    expireRef.current = onExpire
  })

  React.useEffect(() => {
    // Recompute from the clock every tick instead of decrementing, so a
    // throttled background tab never drifts behind the real deadline.
    const tick = () => {
      const next = remaining(targetMs, Date.now())
      setParts(next)
      return next.done
    }
    if (tick()) {
      expireRef.current?.()
      return
    }
    const id = window.setInterval(() => {
      if (tick()) {
        window.clearInterval(id)
        expireRef.current?.()
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [targetMs])

  const spoken = parts.done
    ? expiredLabel
    : `${parts.hours} hours, ${parts.minutes} minutes and ${parts.seconds} seconds`
  const heading = parts.done ? expiredLabel : label

  const tiles = (
    <div className={cn("flex", size === "sm" ? "items-center gap-1" : "gap-2")} aria-hidden="true">
      {UNITS.map(({ key, label: unit }, index) => (
        <React.Fragment key={key}>
          {size === "sm" && index > 0 ? <span className="font-grotesk text-sm font-bold">:</span> : null}
          <div
            className={cn(
              "flex flex-col items-center justify-center text-foreground",
              // The inline row sits on bars of any color (lime included), so its tiles stay opaque.
              size === "sm" ? "h-6 min-w-7 rounded-md bg-secondary px-1" : "min-w-20 flex-1 rounded-xl bg-glass px-3 py-2.5"
            )}
          >
            <span
              suppressHydrationWarning
              className={cn("font-grotesk font-bold tabular-nums", size === "sm" ? "text-sm" : "text-display-lg")}
            >
              {pad(parts[key])}
            </span>
            {size === "sm" ? null : (
              <span data-contrast-exempt className="text-xs text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  )

  return (
    <div
      role="timer"
      aria-labelledby={labelId}
      data-slot="countdown"
      data-size={size}
      data-expired={parts.done || undefined}
      className={cn(
        size === "sm"
          ? "inline-flex items-center gap-2"
          : "inline-flex w-full max-w-sm flex-col rounded-2xl bg-glass shadow-inset-glass",
        className
      )}
      {...props}
    >
      <p
        id={labelId}
        className={cn(
          "flex items-center gap-1.5 font-semibold",
          size === "sm" ? "text-xs" : "justify-center px-4 py-3 text-sm"
        )}
      >
        {/* Pink marks the timer as a sale; it is too dark for text, so only the icon carries it. */}
        <Icon name="hourglass_top" className={cn(parts.done ? "text-muted-foreground" : "text-sale")} />
        {heading}
      </p>
      {size === "sm" ? null : <div className="mx-3 border-t border-dashed border-glass-border" />}
      <div className={size === "sm" ? undefined : "p-2"}>{tiles}</div>
      {/* role="timer" is not announced as it ticks; this text is what a screen reader reads on demand. */}
      <span className="sr-only" suppressHydrationWarning>
        {spoken}
      </span>
      {/* Reaching zero is news, so that one change is announced. */}
      <span role="status" className="sr-only">
        {parts.done ? expiredLabel : ""}
      </span>
    </div>
  )
}

export { Countdown }
