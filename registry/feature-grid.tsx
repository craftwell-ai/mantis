import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Heading, HeadingAccent } from "@/components/ui/heading"
import { MediaTile } from "@/components/ui/media-tile"

export type Feature = {
  title: string
  /** One line on what it does for the person. */
  description: string
  image: { src: string; alt: string }
  /** Makes the whole card a link to the feature. */
  href?: string
  /** A short "New" style marker, at most one per card. */
  badge?: string
}

export interface FeatureGridProps {
  title: string
  /** One word of the title to set in lime. Must appear in `title`. */
  accent?: string
  description?: string
  features: Feature[]
  /** Columns on wide screens. */
  columns?: 2 | 3 | 4
  className?: string
}

const COLUMN_CLASS = { 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" } as const

function FeatureGrid({ title, accent, description, features, columns = 3, className }: FeatureGridProps) {
  const headingId = React.useId()
  const accentAt = accent ? title.indexOf(accent) : -1

  return (
    <section data-slot="feature-grid" aria-labelledby={headingId} className={cn("flex w-full flex-col gap-6", className)}>
      <div className="flex flex-col gap-2">
        <Heading id={headingId} level="sub" render={<h2 />}>
          {accent && accentAt >= 0 ? (
            <>
              {title.slice(0, accentAt)}
              <HeadingAccent>{accent}</HeadingAccent>
              {title.slice(accentAt + accent.length)}
            </>
          ) : (
            title
          )}
        </Heading>
        {description ? <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>

      <ul className={cn("grid grid-cols-1 gap-4", COLUMN_CLASS[columns])}>
        {features.map((feature) => (
          <li key={feature.title}>
            {/* group/media-card: the picture dims with the card when its stretched link is hovered. */}
            <Card variant="media" className={cn("relative h-full gap-3 py-0", feature.href && "group/media-card")}>
              <MediaTile
                aspect="landscape"
                radius="2xl"
                inset="lg"
                src={feature.image.src}
                alt={feature.image.alt}
                badge={feature.badge ? <Badge variant="tag">{feature.badge}</Badge> : null}
              />
              <div className="flex flex-col gap-1 px-1">
                <Heading level="label" render={<h3 />}>
                  {feature.href ? (
                    // The link's ::after covers the card, so the image opens the feature too.
                    <a
                      href={feature.href}
                      className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
                    >
                      {feature.title}
                    </a>
                  ) : (
                    feature.title
                  )}
                </Heading>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}

export { FeatureGrid }
