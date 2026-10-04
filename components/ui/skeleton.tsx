import { cn } from "@/lib/mantis-cn"

// From the reference's .skeleton rule: #202227 with a soft dark band sweeping
// upward every 2s. Motion stops for people who prefer reduced motion.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-lg bg-skeleton after:absolute after:inset-0 after:translate-y-full after:bg-[image:var(--skeleton-shimmer)] after:content-[''] after:animate-shimmer motion-reduce:after:hidden",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
