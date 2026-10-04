"use client"

import { useId, type ReactNode } from "react"
import { cn } from "@/lib/mantis-cn"

import { buttonVariants } from "@/components/ui/button"
import { Heading, HeadingAccent } from "@/components/ui/heading"
import { Icon } from "@/components/ui/icon"
import { FeatureGrid, type FeatureGridProps } from "./feature-grid"
import { HowItWorks, type HowItWorksProps } from "./how-it-works"
import { MarketingHero, type MarketingHeroProps } from "./marketing-hero"
import { SAMPLE_BRAND_NAME, SAMPLE_FOOTER, SAMPLE_NAV_LINKS } from "./sample-content"
import { SiteFooter, type SiteFooterProps } from "./site-footer"
import { TopNavigation, type TopNavigationProps } from "./top-navigation"

export type LandingCta = {
  /** Written in sentence case; it renders uppercase. */
  title: string
  /** One word of `title` to set in lime. */
  accent?: string
  description?: ReactNode
  action: { label: string; href: string }
  /** Small print under the button, such as "No card needed". */
  note?: string
}

export interface LandingPageProps {
  brandName?: string
  /** Everything the top bar needs except the brand name. Signed out by default: a lime Sign in link sits where the avatar would. */
  navigation?: Omit<TopNavigationProps, "brandName">
  hero?: MarketingHeroProps
  features?: FeatureGridProps
  howItWorks?: HowItWorksProps
  cta?: LandingCta
  /** The footer's content; its brand name comes from `brandName`. */
  footer?: Omit<SiteFooterProps, "brandName">
  className?: string
}

const DEFAULT_NAVIGATION: Omit<TopNavigationProps, "brandName"> = {
  // The shared sample links, less Projects: a signed-out visitor has none yet.
  links: SAMPLE_NAV_LINKS.filter((link) => link.href !== "/projects"),
  pricing: { label: "Pricing", href: "/pricing" },
  // The signed-out bar's one call to action is lime, as on the reference.
  account: (
    <a href="/sign-in" className={cn(buttonVariants({ variant: "brand", size: "sm" }), "hover:brightness-80 active:brightness-60")}>
      Sign in
    </a>
  ),
}

const DEFAULT_HERO: MarketingHeroProps = {
  eyebrow: "Video studio",
  headline: "Direct every shot from one sentence",
  accent: "one sentence",
  description: "Describe the scene, pick a camera move and get a ten-second clip you can cut straight into your edit.",
  primaryAction: { label: "Start for free", href: "/sign-up" },
  secondaryAction: { label: "See examples", href: "/explore" },
  media: [
    { src: "https://picsum.photos/seed/hero/1280/720", alt: "Placeholder for a wide generated film still, the main showcase image" },
    { src: "https://picsum.photos/seed/hero-portrait/640/360", alt: "Placeholder for a generated portrait example" },
    { src: "https://picsum.photos/seed/hero-product/640/360", alt: "Placeholder for a generated product shot example" },
  ],
}

const DEFAULT_FEATURES: FeatureGridProps = {
  title: "Everything you need to finish the film",
  accent: "finish",
  description: "Each tool works on its own or as a step in the same project.",
  features: [
    {
      title: "Camera moves",
      description: "Dolly, orbit or crane through a scene with one setting.",
      image: { src: "https://picsum.photos/seed/camera/800/600", alt: "Placeholder for a clip made with a camera move" },
      href: "/motion",
      badge: "New",
    },
    {
      title: "Relight",
      description: "Change the time of day on a photo without reshooting it.",
      image: { src: "https://picsum.photos/seed/relight/800/600", alt: "Placeholder for a relit photograph" },
      href: "/relight",
    },
    {
      title: "Consistent characters",
      description: "Keep one face and outfit across every shot in a story.",
      image: { src: "https://picsum.photos/seed/character/800/600", alt: "Placeholder for a character shown in several scenes" },
      href: "/characters",
    },
    {
      title: "Upscale to 4K",
      description: "Sharpen any generation for print or a big screen.",
      image: { src: "https://picsum.photos/seed/upscale/800/600", alt: "Placeholder for an upscaled detail shot" },
      href: "/upscale",
    },
    {
      title: "Lip sync",
      description: "Match a voiceover to a face in any clip.",
      image: { src: "https://picsum.photos/seed/lipsync/800/600", alt: "Placeholder for a speaking portrait" },
      href: "/lip-sync",
    },
    {
      title: "Storyboards",
      description: "Turn a script into a frame-by-frame plan in minutes.",
      image: { src: "https://picsum.photos/seed/storyboard/800/600", alt: "Placeholder for a storyboard frame" },
      href: "/storyboards",
    },
  ],
}

const DEFAULT_HOW_IT_WORKS: HowItWorksProps = {
  title: (
    <>
      Turn a photo into <HeadingAccent>motion</HeadingAccent>
    </>
  ),
  description: "Three steps from a single image to a shareable clip. No timeline, no keyframes.",
  steps: [
    {
      title: "Drop in a still",
      description: "Upload a photo or pick one from your generations to set the first frame.",
      media: { src: "https://picsum.photos/seed/upload/800/450", alt: "A still photo of a coastline ready to upload" },
    },
    {
      title: "Choose a motion",
      description: "Pick a camera move such as a slow push-in or orbit, or describe your own.",
      media: { src: "https://picsum.photos/seed/motion/800/450", alt: "Camera motion presets shown as small previews" },
    },
    {
      title: "Get your clip",
      description: "Generate and download a six-second clip in 1080p, ready to cut into your edit.",
      media: { src: "https://picsum.photos/seed/clip/800/450", alt: "The finished video clip playing in a frame" },
    },
  ],
}

const DEFAULT_CTA: LandingCta = {
  title: "Your next scene is one sentence away",
  accent: "one sentence",
  description: "Start with 150 free credits. That is enough for a short storyboard and a few test clips.",
  action: { label: "Create a free account", href: "/sign-up" },
  note: "No card needed. Cancel paid plans any time.",
}

// A public product or tool page: the top bar (signed out), the hero, what the
// tools do, three steps to a first result, one closing call to action, and
// the lime footer. Sign-up is the lime call to action in the bar, the hero and the closing band. Sections sit on the page ground, separated by space, not lines.
function LandingPage({
  brandName = SAMPLE_BRAND_NAME,
  navigation = DEFAULT_NAVIGATION,
  hero = DEFAULT_HERO,
  features = DEFAULT_FEATURES,
  howItWorks = DEFAULT_HOW_IT_WORKS,
  cta = DEFAULT_CTA,
  footer = SAMPLE_FOOTER,
  className,
}: LandingPageProps) {
  const ctaId = useId()
  const accentAt = cta.accent ? cta.title.indexOf(cta.accent) : -1

  return (
    <div data-slot="landing-page" className={cn("flex min-h-dvh w-full flex-col bg-background", className)}>
      <TopNavigation brandName={brandName} {...navigation} className="sticky top-0 z-20" />

      <main className="flex flex-1 flex-col items-center gap-24 pb-24">
        <MarketingHero {...hero} />
        <FeatureGrid {...features} className={cn("max-w-6xl px-4", features.className)} />
        <HowItWorks {...howItWorks} className={cn("max-w-6xl px-4", howItWorks.className)} />

        <section aria-labelledby={ctaId} className="w-full max-w-6xl px-4">
          <div className="flex flex-col items-center gap-5 rounded-3xl bg-card px-6 py-16 text-center shadow-card-inset md:py-20">
            <Heading id={ctaId} level="section" render={<h2 />} className="max-w-3xl">
              {cta.accent && accentAt >= 0 ? (
                <>
                  {cta.title.slice(0, accentAt)}
                  <HeadingAccent>{cta.accent}</HeadingAccent>
                  {cta.title.slice(accentAt + cta.accent.length)}
                </>
              ) : (
                cta.title
              )}
            </Heading>
            {cta.description ? (
              <p className="max-w-xl text-base text-pretty text-muted-foreground">{cta.description}</p>
            ) : null}
            <a
              href={cta.action.href}
              className={cn(
                buttonVariants({ variant: "brand", size: "xl", depth: "raised" }),
                "mt-2 min-w-40 hover:brightness-80 active:brightness-60"
              )}
            >
              {cta.action.label}
              <Icon name="arrow_forward" />
            </a>
            {cta.note ? <p className="text-xs text-muted-foreground">{cta.note}</p> : null}
          </div>
        </section>
      </main>

      <SiteFooter brandName={brandName} {...footer} />
    </div>
  )
}

export { LandingPage }
