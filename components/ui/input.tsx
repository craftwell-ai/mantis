import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/mantis-cn"

// Measured on the reference product: 40px (default) or 44px (lg), white 5%
// fill, no border, 14px text; focus shows the lime ring.
function Input({
  className,
  type,
  inputSize = "default",
  ...props
}: React.ComponentProps<"input"> & {
  /** Field height: default in forms, lg for a prominent single field such as a page search. */
  inputSize?: "default" | "lg"
}) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-size={inputSize}
      className={cn(
        "w-full min-w-0 bg-field px-3 py-2 text-sm text-glass-foreground transition-[box-shadow,background-color] duration-normal outline-none file:inline-flex file:h-control-xs file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-focus focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-disabled aria-invalid:ring-focus aria-invalid:ring-destructive/40 data-[size=default]:h-control-lg data-[size=default]:rounded-control data-[size=lg]:h-tap data-[size=lg]:rounded-xl",
        className
      )}
      {...props}
    />
  )
}

export { Input }
