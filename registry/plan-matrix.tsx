"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Badge } from "@/components/ui/badge"
import { Heading } from "@/components/ui/heading"
import { Icon } from "@/components/ui/icon"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PricingCard, type BillingPeriod } from "./pricing-card"

export type PlanMatrixPlan = {
  /** Stable key, also used to match comparison values to a column. */
  id: string
  name: string
  description?: string
  monthlyPrice: number
  yearlyPrice: number
  /** Three to six highlights for the card; the full list lives in the comparison table. */
  features: string[]
  ctaLabel?: string
}

/** `true` = included, `false` = not included, a string = included with a limit ("4K", "3 seats"). */
export type PlanMatrixValue = boolean | string

export type PlanMatrixSection = {
  title: string
  rows: { feature: string; values: Record<string, PlanMatrixValue> }[]
}

export interface PlanMatrixProps {
  plans: PlanMatrixPlan[]
  sections: PlanMatrixSection[]
  /** The one plan to frame and label, by id. */
  highlightedPlanId?: string
  /** Text on the highlighted plan's label. */
  highlightLabel?: string
  currency?: string
  billing?: BillingPeriod
  defaultBilling?: BillingPeriod
  onBillingChange?: (billing: BillingPeriod) => void
  onSubscribe?: (planId: string, billing: BillingPeriod) => void
  /** Heading above the comparison table. */
  comparisonTitle?: string
  className?: string
}

function PlanMatrix({
  plans,
  sections,
  highlightedPlanId,
  highlightLabel = "Most popular",
  currency = "USD",
  billing: billingProp,
  defaultBilling = "yearly",
  onBillingChange,
  onSubscribe,
  comparisonTitle = "Compare every plan",
  className,
}: PlanMatrixProps) {
  const [billingState, setBillingState] = React.useState<BillingPeriod>(defaultBilling)
  const billing = billingProp ?? billingState
  const comparisonId = React.useId()

  const handleBillingChange = (next: unknown[]) => {
    // Pressing the selected segment would clear the group; every price needs a period.
    const period = next[0] as BillingPeriod | undefined
    if (!period || period === billing) return
    if (billingProp === undefined) setBillingState(period)
    onBillingChange?.(period)
  }

  // The toggle advertises the best saving on the page, so it never overstates any one plan.
  const bestSaving = Math.max(
    0,
    ...plans.map((plan) => Math.round((1 - plan.yearlyPrice / plan.monthlyPrice) * 100))
  )

  return (
    <section data-slot="plan-matrix" className={cn("flex w-full flex-col items-center gap-10", className)}>
      <ToggleGroup value={[billing]} onValueChange={handleBillingChange} aria-label="Billing period">
        <ToggleGroupItem value="monthly" className="px-4">
          Monthly
        </ToggleGroupItem>
        <ToggleGroupItem value="yearly" className="px-4">
          Yearly
          {bestSaving > 0 ? <Badge variant="sale">Save up to {bestSaving}%</Badge> : null}
        </ToggleGroupItem>
      </ToggleGroup>

      <div
        className="grid w-full items-stretch gap-4 md:grid-cols-(--plan-columns)"
        style={{ "--plan-columns": `repeat(${plans.length}, minmax(0, 1fr))` } as React.CSSProperties}
      >
        {plans.map((plan) => {
          const highlighted = plan.id === highlightedPlanId
          const card = (
            <PricingCard
              planName={plan.name}
              description={plan.description}
              monthlyPrice={plan.monthlyPrice}
              yearlyPrice={plan.yearlyPrice}
              currency={currency}
              features={plan.features}
              ctaLabel={plan.ctaLabel ?? `Choose ${plan.name}`}
              billing={billing}
              hideBillingToggle
              onSubscribe={(period) => onSubscribe?.(plan.id, period)}
              className={cn("h-full max-w-none", highlighted && "rounded-xl")}
            />
          )
          if (!highlighted) {
            // The highlighted card's label pushes it down; this spacer keeps every card top-aligned.
            return (
              <div key={plan.id} className="flex flex-col pt-7">
                {card}
              </div>
            )
          }
          return (
            <div key={plan.id} className="flex flex-col rounded-2xl bg-commerce-pink p-0.5">
              <p className="flex h-6.5 items-center justify-center gap-1 font-grotesk text-label-caps text-commerce-pink-foreground uppercase">
                <Icon name="star_shine-fill" className="size-3.5" />
                {highlightLabel}
              </p>
              {card}
            </div>
          )
        })}
      </div>

      <div className="flex w-full flex-col gap-4">
        <Heading id={comparisonId} level="sub" render={<h2 />}>
          {comparisonTitle}
        </Heading>
        <div className="rounded-2xl bg-card px-4 py-2">
          <Table aria-labelledby={comparisonId}>
            <TableCaption className="sr-only">
              What each plan includes. A check means included, a dash means not included.
            </TableCaption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col" className="w-2/5">
                  Feature
                </TableHead>
                {plans.map((plan) => (
                  <TableHead key={plan.id} scope="col" className="text-center text-sm text-foreground">
                    {plan.name}
                    {plan.id === highlightedPlanId ? <span className="sr-only"> ({highlightLabel})</span> : null}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            {sections.map((section) => (
              <TableBody key={section.title}>
                <TableRow className="border-b-0 hover:bg-transparent">
                  <TableHead
                    scope="colgroup"
                    colSpan={plans.length + 1}
                    className="h-12 pt-4 align-bottom font-grotesk text-label-caps text-foreground uppercase"
                  >
                    {section.title}
                  </TableHead>
                </TableRow>
                {section.rows.map((row) => (
                  <TableRow key={row.feature}>
                    <TableHead scope="row" className="h-11 text-sm font-normal whitespace-normal text-foreground">
                      {row.feature}
                    </TableHead>
                    {plans.map((plan) => (
                      <TableCell key={plan.id} className="text-center">
                        <MatrixValue value={row.values[plan.id] ?? false} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            ))}
          </Table>
        </div>
      </div>
    </section>
  )
}

function MatrixValue({ value }: { value: PlanMatrixValue }) {
  if (typeof value === "string") return <span className="text-sm">{value}</span>
  // The icons are decorative; the hidden words carry the meaning for screen readers.
  return value ? (
    <span className="inline-flex text-foreground">
      <Icon name="check" className="size-4.5" />
      <span className="sr-only">Included</span>
    </span>
  ) : (
    <span className="inline-flex text-muted-foreground">
      <Icon name="remove" className="size-4.5" />
      <span className="sr-only">Not included</span>
    </span>
  )
}

export { PlanMatrix }
