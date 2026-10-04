"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Icon } from "@/components/ui/icon"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type BillingPeriod = "monthly" | "yearly"

export interface PricingCardProps extends Omit<React.ComponentProps<typeof Card>, "children"> {
  /** Plan name, such as "Creator". Rendered as an uppercase grotesk heading. */
  planName: string
  /** One sentence on who the plan is for. */
  description?: string
  /** Price per month when billed monthly. */
  monthlyPrice: number
  /** Price per month when billed yearly (the yearly total is this × 12). */
  yearlyPrice: number
  /** ISO 4217 code used to format prices. */
  currency?: string
  /** What the plan includes. Keep it to a short list. */
  features: string[]
  /** A short commerce tag beside the plan name, such as "Best value". */
  badge?: string
  /** Button label. Start with a verb. */
  ctaLabel?: string
  /** Controlled billing period. */
  billing?: BillingPeriod
  /** Starting billing period when uncontrolled. */
  defaultBilling?: BillingPeriod
  onBillingChange?: (billing: BillingPeriod) => void
  /** Hide the card's own billing switch, when one page-level switch (as in plan-matrix) drives every card. */
  hideBillingToggle?: boolean
  /** Called with the chosen period when the subscribe button is pressed. */
  onSubscribe?: (billing: BillingPeriod) => void
}

function formatPrice(amount: number, currency: string) {
  // Whole prices read cleaner ("$24"); keep cents only when there are some.
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function PricingCard({
  planName,
  description,
  monthlyPrice,
  yearlyPrice,
  currency = "USD",
  features,
  badge,
  ctaLabel = "Subscribe",
  billing: billingProp,
  defaultBilling = "yearly",
  onBillingChange,
  hideBillingToggle = false,
  onSubscribe,
  className,
  ...props
}: PricingCardProps) {
  const [billingState, setBillingState] = React.useState<BillingPeriod>(defaultBilling)
  const billing = billingProp ?? billingState
  const headingId = React.useId()

  const handleBillingChange = (next: unknown[]) => {
    // Pressing the already-selected segment would empty the group; a price
    // always needs a period, so ignore that instead of clearing it.
    const period = next[0] as BillingPeriod | undefined
    if (!period || period === billing) return
    if (billingProp === undefined) setBillingState(period)
    onBillingChange?.(period)
  }

  const isYearly = billing === "yearly"
  const shownPrice = isYearly ? yearlyPrice : monthlyPrice
  const yearlySavings = (monthlyPrice - yearlyPrice) * 12
  const savingsPercent = Math.round((1 - yearlyPrice / monthlyPrice) * 100)

  return (
    <Card
      data-slot="pricing-card"
      aria-labelledby={headingId}
      className={cn("w-full max-w-sm gap-6 py-6", className)}
      {...props}
    >
      <CardHeader className="gap-2 px-6">
        <div className="flex items-center gap-2">
          <Heading id={headingId} level="label" render={<h3 />}>
            {planName}
          </Heading>
          {badge ? <Badge variant="value">{badge}</Badge> : null}
        </div>
        {/* Two lines reserved so toggles and prices line up across a row of plans */}
        {description ? <p className="min-h-10 text-sm text-muted-foreground">{description}</p> : null}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-6 px-6">
        {hideBillingToggle ? null : (
          <ToggleGroup
            value={[billing]}
            onValueChange={handleBillingChange}
            aria-label="Billing period"
            className="w-full"
          >
            <ToggleGroupItem value="monthly" className="flex-1">
              Monthly
            </ToggleGroupItem>
            <ToggleGroupItem value="yearly" className="flex-1">
              Yearly
              {savingsPercent > 0 ? <span className="font-medium">· save {savingsPercent}%</span> : null}
            </ToggleGroupItem>
          </ToggleGroup>
        )}

        {/* Polite live region so a screen reader hears the new price after the toggle. */}
        <div aria-live="polite" className="flex flex-col gap-1">
          <p className="flex items-baseline gap-1">
            <span className="font-grotesk text-display-md tabular-nums">{formatPrice(shownPrice, currency)}</span>
            <span className="text-sm text-muted-foreground">/ month</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {isYearly
              ? `${formatPrice(yearlyPrice * 12, currency)} billed once a year${
                  yearlySavings > 0 ? `, saving ${formatPrice(yearlySavings, currency)}` : ""
                }`
              : "Billed every month. Cancel any time."}
          </p>
        </div>

        <ul className="flex flex-col gap-3 text-sm" aria-label={`${planName} plan includes`}>
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Icon name="check" className="mt-0.5 size-4 text-foreground" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      {/* The card's footer tint is for toolbars; a plan's buy button sits on the card itself.
          Buying a plan is the card's one main call to action, so it is lime, as on the reference. */}
      {/* Card drops its own bottom padding when a footer exists, so the footer supplies it. */}
      <CardFooter className="border-t-0 bg-transparent px-6 pt-0 pb-6">
        <Button
          variant="brand"
          depth="raised"
          size="xl"
          className="w-full"
          onClick={() => onSubscribe?.(billing)}
        >
          {ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  )
}

export { PricingCard }
