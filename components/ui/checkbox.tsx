"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/mantis-cn"
import { Icon } from "@/components/ui/icon"

// From the reference's own .checkbox definition: 6px radius, 2px border,
// sizes 16/18/20/24, lime (brand) or white (primary) when checked with a
// #131517 mark. The unchecked border uses the approved control-border role
// (3:1); the reference's white 8% border fails WCAG 1.4.11.
const checkboxVariants = cva(
  "peer relative flex shrink-0 items-center justify-center rounded-md border-2 border-input transition-[border-color,background-color,color] duration-(--duration-normal) outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:border-transparent data-disabled:bg-separator aria-invalid:border-destructive data-checked:border-transparent data-checked:text-primary-foreground data-indeterminate:border-transparent",
  {
    variants: {
      /** Checked color: brand (lime) when picking items, primary (white) where lime already marks the main action. */
      variant: {
        brand: "data-checked:bg-brand data-indeterminate:bg-brand-tint data-indeterminate:text-brand",
        primary: "data-checked:bg-primary data-indeterminate:bg-secondary data-indeterminate:text-primary",
      },
      /** Box size: xs 16px, sm 18px, md 20px, lg 24px. Match the text beside it. */
      size: {
        xs: "size-4 [&_svg]:size-2.5",
        sm: "size-4.5 [&_svg]:size-3",
        md: "size-5 [&_svg]:size-3.5",
        lg: "size-6 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "brand", size: "md" },
  }
)

function Checkbox({
  className,
  variant = "brand",
  size = "md",
  ...props
}: CheckboxPrimitive.Root.Props & VariantProps<typeof checkboxVariants>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(checkboxVariants({ variant, size }), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <Icon name={props.indeterminate ? "remove" : "check"} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, checkboxVariants }
