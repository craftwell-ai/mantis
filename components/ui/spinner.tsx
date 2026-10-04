import { cn } from "@/lib/mantis-cn"
import { Icon } from "@/components/ui/icon"

// The reference's busy indicator: a spinning progress ring in the current
// text color. The label is announced; the ring itself is decorative.
function Spinner({
  className,
  label = "Loading",
  ...props
}: React.ComponentProps<"span"> & {
  /** Accessible name announced while waiting, such as "Upscaling". */
  label?: string
}) {
  return (
    <span data-slot="spinner" role="status" className={cn("inline-flex items-center", className)} {...props}>
      <Icon name="progress_activity" className="animate-spin motion-reduce:animate-none" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export { Spinner }
