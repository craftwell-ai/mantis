"use client"

import { useId, useState, type ReactNode } from "react"
import { cn } from "@/lib/mantis-cn"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Heading, HeadingAccent } from "@/components/ui/heading"
import { AnnouncementBar } from "./announcement-bar"
import { Countdown } from "./countdown"
import { PlanMatrix, type PlanMatrixPlan, type PlanMatrixSection } from "./plan-matrix"
import { type BillingPeriod } from "./pricing-card"
import { SAMPLE_BRAND_NAME, SAMPLE_FOOTER, sampleNavigationWithoutBrand } from "./sample-content"
import { SiteFooter, type SiteFooterProps } from "./site-footer"
import { TopNavigation, type TopNavigationProps } from "./top-navigation"

export type PricingFaq = { question: string; answer: ReactNode }

export type PricingOffer = {
  /** One short sentence for the lime bar. */
  message: ReactNode
  actionLabel?: string
  actionHref?: string
  /** When the offer ends: a Date, a timestamp in ms, or an ISO string. Leave out to hide the timer. */
  endsAt?: Date | number | string
  /** Words beside the timer, such as "Ends in". */
  countdownLabel?: string
}

export interface PricingPageProps {
  brandName?: string
  /** Everything the top bar needs except the brand name. Pass `null` to leave the bar out. */
  navigation?: Omit<TopNavigationProps, "brandName"> | null
  /** A time-limited offer shown in the lime bar on top. Pass `null` when there is none. */
  offer?: PricingOffer | null
  /** The page headline, written in sentence case; it renders uppercase. */
  title?: string
  /** One word of `title` to set in lime. */
  accent?: string
  description?: ReactNode
  plans?: PlanMatrixPlan[]
  sections?: PlanMatrixSection[]
  highlightedPlanId?: string
  currency?: string
  defaultBilling?: BillingPeriod
  onSubscribe?: (planId: string, billing: BillingPeriod) => void
  faqTitle?: string
  faqs?: PricingFaq[]
  /** The footer's content; its brand name comes from `brandName`. */
  footer?: Omit<SiteFooterProps, "brandName">
  className?: string
}

const DEFAULT_PLANS: PlanMatrixPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For trying ideas out on weekends.",
    monthlyPrice: 12,
    yearlyPrice: 10,
    features: ["800 credits every month", "One generation at a time", "HD exports"],
  },
  {
    id: "creator",
    name: "Creator",
    description: "For people publishing new images and clips every week.",
    monthlyPrice: 29,
    yearlyPrice: 24,
    features: ["3,000 credits every month", "Four generations at once", "4K upscaling on every export", "Commercial use"],
  },
  {
    id: "studio",
    name: "Studio",
    description: "For small teams sharing one library and one credit pool.",
    monthlyPrice: 79,
    yearlyPrice: 64,
    features: ["10,000 pooled credits", "Three seats included", "Shared brand kits", "Priority queue"],
  },
]

const DEFAULT_SECTIONS: PlanMatrixSection[] = [
  {
    title: "Generation",
    rows: [
      { feature: "Monthly credits", values: { starter: "800", creator: "3,000", studio: "10,000" } },
      { feature: "Generations running at once", values: { starter: "1", creator: "4", studio: "8" } },
      { feature: "Video up to 10 seconds", values: { starter: false, creator: true, studio: true } },
      { feature: "Priority queue at busy hours", values: { starter: false, creator: false, studio: true } },
    ],
  },
  {
    title: "Exports",
    rows: [
      { feature: "Maximum resolution", values: { starter: "HD", creator: "4K", studio: "4K" } },
      { feature: "No watermark", values: { starter: false, creator: true, studio: true } },
      { feature: "Commercial use", values: { starter: false, creator: true, studio: true } },
    ],
  },
]

const DEFAULT_FAQS: PricingFaq[] = [
  {
    question: "What does one credit buy?",
    answer: "A standard image costs 2 credits and a five-second clip costs 20. Every tool shows its price on the Generate button before you spend anything.",
  },
  {
    question: "Do unused credits roll over?",
    answer: "Monthly credits reset at the start of each billing period. Credits you buy as a top-up never expire while your plan is active.",
  },
  {
    question: "Can I switch plans later?",
    answer: "Yes. Upgrades take effect at once and you pay only the difference for the rest of the period. Downgrades start at your next renewal.",
  },
  {
    question: "Can I use what I make commercially?",
    answer: "On Creator and Studio, yes: you own your generations and can use them in client work, ads and products. Starter is for personal projects.",
  },
  {
    question: "How do I cancel?",
    answer: "Open Settings, then Subscription, and choose Cancel plan. You keep your plan and credits until the end of the period you paid for.",
  },
]

// The shared sample bar, minus its Pricing link: this page is where that link goes.
const DEFAULT_NAVIGATION: Omit<TopNavigationProps, "brandName"> = { ...sampleNavigationWithoutBrand(), pricing: undefined }

// About a day and a half out, so the sample timer has hours on it.
const SAMPLE_OFFER_HOURS = 36

// The plans page: a lime offer bar with a live timer, the headline, one
// billing switch over every plan card and the comparison table, the
// questions people ask before paying, and the lime marketing footer.
function PricingPage({
  brandName = SAMPLE_BRAND_NAME,
  navigation = DEFAULT_NAVIGATION,
  offer,
  title = "Pick the plan that fits your output",
  accent = "output",
  description = "Every plan includes every tool. You are choosing how many credits arrive each month and how many things you can make at once.",
  plans = DEFAULT_PLANS,
  sections = DEFAULT_SECTIONS,
  highlightedPlanId = "creator",
  currency,
  defaultBilling,
  onSubscribe,
  faqTitle = "Questions before you subscribe",
  faqs = DEFAULT_FAQS,
  footer = SAMPLE_FOOTER,
  className,
}: PricingPageProps) {
  // The sample offer's deadline is fixed once, at mount, so the timer counts down instead of resetting.
  const [sampleEnd] = useState(() => Date.now() + SAMPLE_OFFER_HOURS * 3600 * 1000)
  const shownOffer: PricingOffer | null =
    offer === undefined
      ? {
          message: "Yearly plans are 20% off this week",
          actionLabel: "See yearly prices",
          actionHref: "#plans",
          endsAt: sampleEnd,
          countdownLabel: "Ends in",
        }
      : offer
  const accentAt = accent ? title.indexOf(accent) : -1
  const faqId = useId()

  return (
    <div data-slot="pricing-page" className={cn("flex min-h-dvh w-full flex-col bg-background", className)}>
      {shownOffer ? (
        <AnnouncementBar
          label="Offer"
          message={shownOffer.message}
          actionLabel={shownOffer.actionLabel}
          actionHref={shownOffer.actionHref}
          aside={
            shownOffer.endsAt !== undefined ? (
              <Countdown size="sm" target={shownOffer.endsAt} label={shownOffer.countdownLabel ?? "Ends in"} />
            ) : null
          }
        />
      ) : null}
      {navigation ? <TopNavigation brandName={brandName} {...navigation} className="sticky top-0 z-20" /> : null}

      <main className="flex flex-1 flex-col items-center gap-16 px-4 pt-12 pb-20 md:pt-16">
        <header className="flex max-w-3xl flex-col items-center gap-4 text-center">
          <Heading level="section" render={<h1 />}>
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
          {description ? <p className="max-w-xl text-base text-pretty text-muted-foreground">{description}</p> : null}
        </header>

        <section id="plans" aria-label="Plans" className="w-full max-w-6xl scroll-mt-20">
          {/* Plan cards title themselves with h3s; this keeps the outline in order under the page h1. */}
          <h2 className="sr-only">Plans</h2>
          <PlanMatrix
            plans={plans}
            sections={sections}
            highlightedPlanId={highlightedPlanId}
            currency={currency}
            defaultBilling={defaultBilling}
            onSubscribe={onSubscribe}
          />
        </section>

        {faqs.length ? (
          <section aria-labelledby={faqId} className="flex w-full max-w-3xl flex-col gap-6">
            <Heading id={faqId} level="sub" render={<h2 />} className="text-center">
              {faqTitle}
            </Heading>
            <Accordion className="rounded-2xl bg-card px-5">
              {faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="py-4 text-base">{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <div className="pb-2 text-pretty text-muted-foreground">{faq.answer}</div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ) : null}
      </main>

      <SiteFooter brandName={brandName} {...footer} />
    </div>
  )
}

export { PricingPage }
