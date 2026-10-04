"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Button, buttonVariants } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

export interface AnnouncementBarProps extends Omit<React.ComponentProps<"section">, "children"> {
  /** One short sentence. Keep it to a single line on a laptop screen. */
  message: React.ReactNode
  /** Call-to-action label. Start with a verb. */
  actionLabel?: string
  /** Where the call to action goes. With an href it renders a link; without one, a button. */
  actionHref?: string
  /** Called when the call to action is pressed. */
  onAction?: () => void
  /** Optional element after the message, such as a small `Countdown`. */
  aside?: React.ReactNode
  /** Show the close button. Turn off only for notices people must keep seeing. */
  dismissible?: boolean
  /** Called after the bar is dismissed. Persist this if it should stay closed on the next visit. */
  onDismiss?: () => void
  /** Names the region for screen readers. */
  label?: string
}

// Focus on lime: the system ring is lime too, so on this bar it would vanish.
// The bar's own dark label color stands in for it.
const onLime = "text-brand-foreground focus-visible:ring-brand-foreground/60"

// With an href the action is a real link (Base UI's Button would announce it as a button).
const actionClass = cn(buttonVariants({ variant: "link", size: "xs" }), "h-auto px-0 font-semibold underline underline-offset-4", onLime)

// The reference's full-width lime bar: one message, one call to action, a close button.
function AnnouncementBar({
  message,
  actionLabel,
  actionHref,
  onAction,
  aside,
  dismissible = true,
  onDismiss,
  label = "Announcement",
  className,
  ...props
}: AnnouncementBarProps) {
  const [open, setOpen] = React.useState(true)
  if (!open) return null

  return (
    <section
      aria-label={label}
      data-slot="announcement-bar"
      className={cn(
        "relative flex min-h-10 w-full items-center justify-center bg-brand px-12 py-2 text-brand-foreground",
        className
      )}
      {...props}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-sm font-medium">
        <p>{message}</p>
        {aside}
        {actionLabel && actionHref ? (
          <a href={actionHref} onClick={onAction} className={actionClass}>
            {actionLabel}
            <Icon name="arrow_forward" />
          </a>
        ) : actionLabel ? (
          <Button variant="link" size="xs" className={actionClass} onClick={onAction}>
            {actionLabel}
            <Icon name="arrow_forward" />
          </Button>
        ) : null}
      </div>
      {dismissible ? (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Dismiss announcement"
          className={cn("absolute top-1/2 right-3 -translate-y-1/2 hover:bg-brand-foreground/10", onLime)}
          onClick={() => {
            setOpen(false)
            onDismiss?.()
          }}
        >
          <Icon name="close" />
        </Button>
      ) : null}
    </section>
  )
}

export { AnnouncementBar }
