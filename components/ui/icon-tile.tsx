import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/mantis-cn"
import { Icon, type IconName } from "@/components/ui/icon"

// The colored rounded square behind an icon that the reference uses in nav,
// menus and settings, colored from its own palette pairs. Always decorative:
// the label beside it carries the meaning.
const iconTileVariants = cva("inline-flex shrink-0 items-center justify-center", {
  variants: {
    /** Tile color. Give each nav or settings entry its own and keep it the same everywhere. */
    color: {
      blue: "bg-tile-blue text-tile-blue-foreground",
      purple: "bg-tile-purple text-tile-purple-foreground",
      pink: "bg-tile-pink text-tile-pink-foreground",
      orange: "bg-tile-orange text-tile-orange-foreground",
      mint: "bg-tile-mint text-tile-mint-foreground",
      brown: "bg-tile-brown text-tile-brown-foreground",
      neutral: "bg-secondary text-foreground",
    },
    /** Tile size: sm 20px, md 24px, lg 32px. */
    size: {
      sm: "size-5 rounded-md [&_svg]:size-3",
      md: "size-6 rounded-md [&_svg]:size-3.5",
      lg: "size-8 rounded-lg [&_svg]:size-4.5",
    },
  },
  defaultVariants: { color: "neutral", size: "md" },
})

function IconTile({
  name,
  color,
  size,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "color"> & VariantProps<typeof iconTileVariants> & {
  /** Material Symbols icon drawn inside the tile. */
  name: IconName
}) {
  return (
    <span data-slot="icon-tile" aria-hidden="true" className={cn(iconTileVariants({ color, size }), className)} {...props}>
      <Icon name={name} />
    </span>
  )
}

export { IconTile, iconTileVariants }
