import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Button, buttonVariants } from "@/components/ui/button"
import { Heading, HeadingAccent } from "@/components/ui/heading"
import { Icon } from "@/components/ui/icon"

export type HeroMedia = { src: string; alt: string }
export type HeroAction = { label: string; href?: string; onClick?: () => void }

export interface MarketingHeroProps {
  /** Small caps line above the headline, such as the product area. */
  eyebrow?: string
  /** The headline, written in sentence case; it renders uppercase. */
  headline: string
  /** One word (or short phrase) of the headline to set in lime. Must appear in `headline`. */
  accent?: string
  /** One or two sentences under the headline. */
  description: string
  primaryAction: HeroAction
  secondaryAction?: HeroAction
  /** One to three images. The first is the large frame; the rest stack beside it on wide screens. */
  media?: HeroMedia[]
  className?: string
}

// The primary action is the section's one lime call to action; the secondary is glass.
function HeroButton({ action, variant }: { action: HeroAction; variant: "brand" | "glass" }) {
  const style = { variant, size: "xl", className: "min-w-40" } as const
  if (action.href) {
    return (
      // A real link styled as a button: Button with render={<a>} would announce it as a button.
      <a href={action.href} className={buttonVariants({ ...style, depth: variant === "brand" ? "raised" : "flat" })}>
        {action.label}
        {variant === "brand" ? <Icon name="arrow_forward" /> : null}
      </a>
    )
  }
  return (
    <Button {...style} depth={variant === "brand" ? "raised" : "flat"} onClick={action.onClick}>
      {action.label}
      {variant === "brand" ? <Icon name="arrow_forward" /> : null}
    </Button>
  )
}

function MarketingHero({
  eyebrow,
  headline,
  accent,
  description,
  primaryAction,
  secondaryAction,
  media = [],
  className,
}: MarketingHeroProps) {
  // Split around the accent so the lime word stays inside one heading element.
  const accentAt = accent ? headline.indexOf(accent) : -1
  const title =
    accent && accentAt >= 0 ? (
      <>
        {headline.slice(0, accentAt)}
        <HeadingAccent>{accent}</HeadingAccent>
        {headline.slice(accentAt + accent.length)}
      </>
    ) : (
      headline
    )
  const [main, ...side] = media.slice(0, 3)

  return (
    <section data-slot="marketing-hero" className={cn("flex w-full flex-col items-center gap-12 px-4 pt-16 pb-8", className)}>
      <div className="flex max-w-4xl flex-col items-center gap-5 text-center">
        {eyebrow ? <p className="font-grotesk text-label-caps text-muted-foreground uppercase">{eyebrow}</p> : null}
        <Heading level="hero">{title}</Heading>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">{description}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <HeroButton action={primaryAction} variant="brand" />
          {secondaryAction ? <HeroButton action={secondaryAction} variant="glass" /> : null}
        </div>
      </div>

      {main ? (
        <div className={cn("grid w-full max-w-6xl gap-3", side.length > 0 && "md:grid-cols-3 md:grid-rows-2")}>
          <figure className={cn("overflow-hidden rounded-3xl bg-field", side.length > 0 && "md:col-span-2 md:row-span-2")}>
            {/* A plain <img> keeps the block framework-agnostic; swap in next/image in your app if you like. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={main.src} alt={main.alt} className="aspect-video size-full object-cover" />
          </figure>
          {side.map((item) => (
            <figure key={item.src} className="hidden overflow-hidden rounded-3xl bg-field md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt={item.alt} className="size-full object-cover" />
            </figure>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export { MarketingHero }
