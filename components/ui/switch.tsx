"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/mantis-cn"

// Measured on the reference product: default track 28×16 with a 12px thumb,
// large track 36×24 with a 16px thumb; lime when on, slate when off; 0.2s.
function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  /** Track size: default in settings rows, lg for a prominent toggle such as monthly or yearly billing. */
  size?: "default" | "lg"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full outline-none transition-colors duration-(--duration-normal) after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-4 data-[size=default]:w-7 data-[size=default]:p-0.5 data-[size=lg]:h-6 data-[size=lg]:w-9 data-[size=lg]:p-1 data-checked:bg-brand data-unchecked:bg-switch-off data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-primary transition-transform duration-(--duration-normal) group-data-[size=default]/switch:size-3 group-data-[size=lg]/switch:size-4 group-data-[size=lg]/switch:shadow-thumb-lg data-checked:translate-x-3 data-unchecked:translate-x-0 group-data-[size=default]/switch:data-checked:shadow-thumb-on group-data-[size=default]/switch:data-unchecked:shadow-thumb-off"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
