import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/mantis-cn"

// Measured on the reference product. `field` matches Input; the two prompt
// variants are borderless and grow with their content, as in its composers.
const textareaVariants = cva(
  "flex field-sizing-content w-full outline-none transition-[box-shadow,background-color] duration-(--duration-normal) placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 aria-invalid:ring-destructive/40",
  {
    variants: {
      /** field is the filled box for forms; prompt and prompt-lg are borderless, for writing prompts inside a composer. */
      variant: {
        field: "min-h-20 rounded-control bg-field px-3 py-2 text-sm text-glass-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        prompt: "min-h-10 resize-none bg-transparent p-0 text-sm text-foreground",
        "prompt-lg": "min-h-15 resize-none bg-transparent p-2 text-lg tracking-[-0.01em] text-glass-foreground/90",
      },
    },
    defaultVariants: { variant: "field" },
  }
)

function Textarea({
  className,
  variant = "field",
  ...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant}
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
