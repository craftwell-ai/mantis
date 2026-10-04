import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/mantis-cn"

// Sizes, type and colors measured on the reference product (docs/inventory.md).
// Fills that failed WCAG use the owner-approved nearest passing shades.
const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border border-transparent leading-none whitespace-nowrap focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        // Lime on lime 20%: "new" and feature labels.
        new: "h-4 rounded-md bg-badge-new px-1.5 text-2xs font-bold tracking-[0.1px] text-badge-new-foreground",
        // White on white 20%: neutral counts and tiers.
        neutral: "h-3.5 rounded-sm bg-badge-neutral px-1 text-2xs font-semibold tracking-[0.2px] text-badge-neutral-foreground",
        // Solid lime uppercase tag.
        tag: "h-4.5 rounded-sm bg-brand px-1 text-2xs font-semibold tracking-[-0.3px] text-primary-foreground uppercase",
        // Pink uppercase sale tag in the grotesk face.
        sale: "h-4.5 rounded-sm bg-sale px-1.5 font-grotesk text-xs font-bold text-sale-foreground uppercase",
        // Pink gradient "hot" pill.
        hot: "h-3.5 rounded-[5px] bg-[image:var(--badge-hot)] px-[5px] text-2xs font-bold tracking-[0.1px] text-sale-foreground",
        // Blue gradient uppercase value tag.
        value: "h-4.5 rounded-sm bg-[image:var(--badge-value)] px-1.5 font-grotesk text-xs font-bold text-sale-foreground uppercase",
        // Gold gradient text with no fill.
        gold: "h-5 bg-[image:var(--text-gold)] bg-clip-text text-sm font-medium tracking-[0.1px] text-transparent",
        outline: "h-5 rounded-md border-border px-1.5 text-xs font-medium text-foreground",
        destructive: "h-5 rounded-md bg-destructive/10 px-1.5 text-xs font-medium text-destructive dark:bg-destructive/20",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

function Badge({
  className,
  variant = "neutral",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
