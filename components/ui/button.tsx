import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/mantis-cn"

// Every value below was measured on the reference product (docs/inventory.md).
// Interaction is the reference's own: hover dims to 80% brightness, press to
// 60%, over a 0.2s standard ease, on every variant.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 border border-transparent bg-clip-padding font-medium whitespace-nowrap outline-none select-none transition-[filter,background-color,color,box-shadow] duration-(--duration-normal) ease-in-out hover:brightness-80 active:brightness-60 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      /** Visual weight: default (white) for everyday actions, brand (lime) for the one main call to action, destructive for irreversible ones; the rest are quieter secondary styles. */
      variant: {
        // White: the everyday action (save, continue, invite).
        default: "bg-primary text-primary-foreground",
        // Lime: the one main call to action on a screen (generate, sign up, buy a plan).
        brand: "bg-brand text-brand-foreground",
        "brand-tint": "bg-brand-tint text-brand-tint-foreground shadow-inset-tint",
        secondary: "bg-secondary text-secondary-foreground",
        glass: "bg-glass text-glass-foreground shadow-inset-glass",
        soft: "bg-soft text-soft-foreground",
        outline: "border-border bg-transparent text-foreground hover:bg-glass",
        ghost: "bg-transparent text-foreground hover:bg-glass",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20",
        "commerce-pink": "bg-commerce-pink text-commerce-pink-foreground",
        "commerce-blue": "bg-commerce-blue text-commerce-blue-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      /** Elevation: flat for most buttons, raised for a chunky page-level call to action, glossy for the lime Generate button. */
      depth: {
        flat: "",
        // The chunky CTA: 1px top highlight, 3px darker bottom edge, soft drop.
        raised: "",
        // The generate button's lime glow with a dark bottom edge.
        glossy: "",
      },
      /** Height and padding from 2xs (16px) to 3xl (64px). The icon-* sizes are square, for icon-only buttons, which also need an aria-label. */
      size: {
        "2xs": "h-4 gap-1 rounded-xs px-1 text-2xs font-semibold [&_svg:not([class*='size-'])]:size-3",
        xs: "h-6 gap-1 rounded-lg px-2.5 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 rounded-lg px-3 text-sm",
        default: "h-9 rounded-control px-3 text-sm",
        lg: "h-10 rounded-control px-4 text-sm font-semibold",
        xl: "h-12 rounded-xl px-4 text-base font-semibold",
        cta: "h-13 rounded-xl px-6 text-sm font-semibold",
        "2xl": "h-14 gap-2 rounded-xl px-3.5 text-lg font-semibold",
        "3xl": "h-16 gap-2 rounded-xl px-4 text-lg font-semibold",
        "icon-xs": "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 rounded-lg",
        icon: "size-9 rounded-control",
        "icon-lg": "size-10 rounded-control",
      },
    },
    compoundVariants: [
      { depth: "raised", variant: "default", className: "shadow-cta-light" },
      { depth: "raised", variant: "brand", className: "shadow-cta-brand" },
      { depth: "raised", variant: "commerce-pink", className: "shadow-cta-pink" },
      { depth: "raised", variant: "commerce-blue", className: "shadow-cta-blue" },
      // The edge sits inside the bottom padding, so the label stays optically centered.
      { depth: "glossy", variant: "brand", className: "bg-[image:var(--brand-gloss)] pb-0.5 shadow-gloss-edge" },
    ],
    defaultVariants: {
      variant: "default",
      depth: "flat",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  depth = "flat",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      className={cn(buttonVariants({ variant, depth, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
