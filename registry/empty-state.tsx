import type { ReactNode } from "react"
import { cn } from "@/lib/mantis-cn"

import { Heading } from "@/components/ui/heading"
import { Icon, type IconName } from "@/components/ui/icon"

export interface EmptyStateProps {
  /** Material Symbols name drawn in the round badge above the title. */
  icon?: IconName
  /** Says what this space is for, such as "Your asset library is empty". */
  title: ReactNode
  /** One sentence on what goes here and why it is worth adding. */
  description: ReactNode
  /** The single button that starts the first item, such as Upload image. */
  action?: ReactNode
  /** Small print under the action, such as the accepted file types. */
  hint?: ReactNode
  /** Heading element for the title; match the page outline (h2 under a page h1). */
  headingTag?: "h2" | "h3" | "h4"
  className?: string
}

// DESIGN.md's empty-state recipe: a dashed placeholder, one sentence saying
// what goes here, and one button to start. The dashed edge outlines the area
// the content will fill, so the page reads as "waiting", not "broken".
export function EmptyState({
  icon = "image",
  title,
  description,
  action,
  hint,
  headingTag: HeadingTag = "h2",
  className,
}: EmptyStateProps) {
  return (
    <section
      data-slot="empty-state"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-glass-border px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-glass text-2xl text-muted-foreground">
        <Icon name={icon} />
      </div>
      <div className="flex max-w-sm flex-col gap-1.5">
        <Heading level="title-sm" render={<HeadingTag />}>
          {title}
        </Heading>
        <p className="text-sm text-pretty text-muted-foreground">{description}</p>
      </div>
      {action}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </section>
  )
}
