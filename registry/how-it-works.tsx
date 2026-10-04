import type { ReactNode } from "react"
import { cn } from "@/lib/mantis-cn"

import { Heading } from "@/components/ui/heading"

export interface HowItWorksStep {
  /** A short uppercase title, two or three words: "Pick a still". */
  title: string
  /** One sentence on what the person does in this step. */
  description: string
  /** A still or poster that shows the step. */
  media: { src: string; alt: string }
}

export interface HowItWorksProps {
  /** The section headline. Wrap one word in `HeadingAccent` to set it in lime. */
  title: ReactNode
  /** One line under the headline. */
  description?: ReactNode
  /** Three steps reads best; the row wraps on narrow screens. */
  steps: HowItWorksStep[]
  className?: string
}

// The reference's tool-page explainer: an uppercase grotesk headline over a
// row of equal steps. Each step leads with its picture on a card surface, then
// a numbered uppercase title and one muted sentence.
function HowItWorks({ title, description, steps, className }: HowItWorksProps) {
  return (
    <section data-slot="how-it-works" className={cn("flex w-full flex-col gap-6", className)}>
      <div className="flex flex-col gap-2">
        <Heading level="sub" render={<h2 />}>
          {title}
        </Heading>
        {description ? <p className="max-w-2xl text-sm text-pretty text-muted-foreground">{description}</p> : null}
      </div>
      <ol className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex flex-col gap-3">
            <div className="aspect-video overflow-hidden rounded-2xl bg-card">
              {/* A plain <img> keeps the block framework-agnostic; swap in next/image in your app if you like. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={step.media.src} alt={step.media.alt} className="size-full object-cover" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Heading level="label" render={<h3 />} className="flex items-center gap-2">
                {/* The list already numbers the steps for screen readers. */}
                <span
                  aria-hidden="true"
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-glass font-sans text-xs font-semibold"
                >
                  {index + 1}
                </span>
                {step.title}
              </Heading>
              <p className="text-sm text-pretty text-muted-foreground">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export { HowItWorks }
