"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Icon } from "@/components/ui/icon"

export type PromoModalProps = {
  /** Uppercase display headline. Keep it to one promise, under ten words. */
  headline: string
  /** One sentence under the headline saying what the offer is. */
  description: string
  /** Three or four short benefits. */
  benefits: string[]
  image: { src: string; alt: string }
  /** Discounted price per period. */
  price: number
  /** Regular price per period, shown struck through. */
  originalPrice: number
  currency?: string
  /** Such as "month". */
  period?: string
  /** How long the discounted price lasts, such as "for your first year". */
  discountTerm?: string
  /** When the offer ends. The tile counts down to it and the button locks at zero. */
  deadline: Date | number
  /** Button label. Start with a verb. Defaults to "Claim {n}% off". */
  ctaLabel?: string
  /** Small print under the button: renewal price, cancellation. */
  finePrint?: string
  onClaim?: () => void
  trigger?: React.ReactElement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const pad = (value: number) => String(value).padStart(2, "0")

// Milliseconds left, ticking every second. Starts as null so the server render
// and the first client render agree; the clock only runs in the browser.
function useRemaining(deadline: Date | number) {
  const end = typeof deadline === "number" ? deadline : deadline.getTime()
  const [remaining, setRemaining] = React.useState<number | null>(null)
  React.useEffect(() => {
    const tick = () => setRemaining(Math.max(0, end - Date.now()))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [end])
  return remaining
}

// The upsell dialog: a media header, an uppercase headline, a short benefit
// list, a price tile beside a countdown tile, the lime claim button and a quiet
// dismiss. Mirrors the reference's limited-offer modal: buying is lime, and
// pink marks only the discount (the sale tag).
export function PromoModal({
  headline,
  description,
  benefits,
  image,
  price,
  originalPrice,
  currency = "USD",
  period = "month",
  discountTerm = "for your first year",
  deadline,
  ctaLabel,
  finePrint,
  onClaim,
  trigger,
  open,
  defaultOpen,
  onOpenChange,
}: PromoModalProps) {
  const remaining = useRemaining(deadline)
  const discount = Math.round((1 - price / originalPrice) * 100)
  const ended = remaining === 0

  const totalSeconds = Math.floor((remaining ?? 0) / 1000)
  const units = [
    { label: "hours", value: Math.floor(totalSeconds / 3600) },
    { label: "min", value: Math.floor((totalSeconds % 3600) / 60) },
    { label: "sec", value: totalSeconds % 60 },
  ]
  const spokenTime = `${units[0].value} hours ${units[1].value} minutes`

  return (
    <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogContent data-slot="promo-modal" showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="relative h-44 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.src} alt={image.alt} className="size-full object-cover" />
          <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-dialog via-dialog/20 to-transparent" />
          <Badge variant="sale" className="absolute top-4 left-4">
            {discount}% off
          </Badge>
          <DialogClose
            render={<Button variant="secondary" size="icon-sm" className="absolute top-3 right-3" />}
            aria-label="Close"
          >
            <Icon name="close" />
          </DialogClose>
        </div>

        <div className="flex flex-col items-center gap-5 px-6 pt-2 pb-6 text-center">
          <div className="flex flex-col gap-2">
            <DialogTitle className="pr-0 font-grotesk text-display-sm text-balance uppercase">{headline}</DialogTitle>
            <DialogDescription className="text-sm">{description}</DialogDescription>
          </div>

          <ul className="flex w-full flex-col gap-2 text-left text-sm" aria-label="What you get">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2">
                <Icon name="check" className="mt-0.5 size-4 shrink-0 text-foreground" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="grid w-full grid-cols-2 gap-2">
            <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-card px-3 py-3">
              <p className="flex items-baseline gap-1.5">
                <span className="font-grotesk text-2xl font-bold tabular-nums">{formatPrice(price, currency)}</span>
                <span className="text-xs text-muted-foreground">/ {period}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                <s>
                  <span className="sr-only">Regular price </span>
                  {formatPrice(originalPrice, currency)}
                </s>{" "}
                {discountTerm}
              </p>
            </div>

            <div
              role="timer"
              aria-label={ended ? "Offer ended" : remaining === null ? "Offer ends soon" : `Offer ends in ${spokenTime}`}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-card px-3 py-3"
            >
              {ended ? (
                <p className="text-sm font-medium">Offer ended</p>
              ) : (
                <div aria-hidden="true" className="flex items-start gap-1.5">
                  {units.map((unit, index) => (
                    <React.Fragment key={unit.label}>
                      {index > 0 ? <span className="font-grotesk text-2xl font-bold text-muted-foreground">:</span> : null}
                      <span className="flex flex-col items-center">
                        <span className="font-grotesk text-2xl font-bold tabular-nums">
                          {remaining === null ? "––" : pad(unit.value)}
                        </span>
                        <span className="text-2xs text-muted-foreground">{unit.label}</span>
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            <Button
              variant="brand"
              depth="raised"
              size="xl"
              className="w-full"
              disabled={ended}
              focusableWhenDisabled
              onClick={onClaim}
            >
              {ended ? "This offer has ended" : (ctaLabel ?? `Claim ${discount}% off`)}
            </Button>
            <DialogClose render={<Button variant="ghost" />}>Maybe later</DialogClose>
          </div>

          {finePrint ? <p className="text-xs text-muted-foreground">{finePrint}</p> : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
