"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cn } from "@/lib/mantis-cn"
import { Icon } from "@/components/ui/icon"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  )
}

// Matches the checkbox: 20px, 2px control-border ring, lime when chosen.
function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-5 shrink-0 rounded-full border-2 border-input outline-none transition-[border-color,background-color] duration-(--duration-normal) after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:border-destructive data-checked:border-transparent data-checked:bg-brand",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-full items-center justify-center"
      >
        <span className="size-2 rounded-full bg-primary-foreground" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

// A whole card is the choice: lime outline and a lime corner check when
// chosen, as in the reference's onboarding and visibility pickers.
function RadioGroupCard({ className, children, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-card"
      className={cn(
        "group/radio-card relative flex flex-col items-start gap-1 rounded-xl border-2 border-transparent bg-glass p-4 text-left text-sm text-foreground outline-none transition-[border-color,filter] duration-(--duration-normal) hover:brightness-110 focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-checked:border-brand",
        className
      )}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        className="absolute top-3 right-3 flex size-4.5 items-center justify-center rounded-full border-2 border-input group-data-checked/radio-card:border-transparent group-data-checked/radio-card:bg-brand group-data-checked/radio-card:text-primary-foreground [&_svg]:size-3"
      >
        <RadioPrimitive.Indicator render={<Icon name="check" />} />
      </span>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem, RadioGroupCard }
