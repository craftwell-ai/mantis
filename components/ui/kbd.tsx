import { cn } from "@/lib/mantis-cn"

// Measured on the reference's search pill: 18px, 4px radius, white 5% fill,
// white 50% semibold text.
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-4.5 w-fit min-w-4.5 items-center justify-center gap-1 rounded-sm bg-kbd px-1 font-sans text-xs font-semibold text-kbd-foreground select-none [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-0.5", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
