"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/mantis-cn"

// Measured on the reference product. segment: the selected option turns white
// with dark 12px semibold text, others stay gray (32px, 10px radius). outline:
// tiles such as aspect ratios, where the chosen one gets a 2px lime outline.
const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1 whitespace-nowrap transition-[background-color,color,border-color] duration-(--duration-normal) outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        segment: "bg-transparent text-soft-foreground hover:text-foreground data-pressed:bg-primary data-pressed:text-primary-foreground",
        outline: "border-2 border-transparent bg-glass text-foreground hover:bg-glass-hover data-pressed:border-brand",
        ghost: "bg-transparent text-foreground hover:bg-glass data-pressed:bg-secondary",
      },
      size: {
        sm: "h-7 min-w-7 rounded-full px-3 text-xs font-medium",
        default: "h-8 min-w-8 rounded-control px-3.5 text-xs font-semibold",
        lg: "h-10 min-w-10 rounded-control px-2.5 text-sm font-semibold",
      },
    },
    defaultVariants: {
      variant: "segment",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "segment",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
