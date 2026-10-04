"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

// The composer's batch-count control ("− 1/4 +"): two quiet icon buttons around
// a tabular value, in a 40px composer chip.
function Stepper({
  value,
  defaultValue = 1,
  min = 1,
  max = 4,
  onValueChange,
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  onValueChange?: (value: number) => void
  label: string
}) {
  const [inner, setInner] = React.useState(defaultValue)
  const current = value ?? inner
  const set = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next))
    if (value === undefined) setInner(clamped)
    onValueChange?.(clamped)
  }
  return (
    <div
      data-slot="stepper"
      role="group"
      aria-label={label}
      className={cn("inline-flex h-10 items-center gap-1 rounded-xl border border-chip-border bg-chip px-1 text-sm text-foreground", className)}
      {...props}
    >
      <Button variant="ghost" size="icon-sm" aria-label={`Decrease ${label}`} disabled={current <= min} onClick={() => set(current - 1)}>
        <Icon name="remove" />
      </Button>
      <output aria-live="polite" className="min-w-8 text-center font-medium tabular-nums">
        {current}
        <span className="text-chip-foreground">/{max}</span>
      </output>
      <Button variant="ghost" size="icon-sm" aria-label={`Increase ${label}`} disabled={current >= max} onClick={() => set(current + 1)}>
        <Icon name="add" />
      </Button>
    </div>
  )
}

export { Stepper }
