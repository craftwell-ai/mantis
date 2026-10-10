import { Button } from "@/components/ui/button"
import { Icon, type IconName } from "@/components/ui/icon"
import { IconTile } from "@/components/ui/icon-tile"

type TileColor = React.ComponentProps<typeof IconTile>["color"]

function Node({
  className,
  icon,
  color,
  title,
  children,
}: {
  className: string
  icon: IconName
  color: TileColor
  title: string
  children: React.ReactNode
}) {
  return (
    <div className={`absolute flex flex-col gap-2 rounded-xl border bg-card p-2.5 shadow-popover ${className}`}>
      <div className="flex items-center gap-2">
        <IconTile name={icon} color={color} size="sm" />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      {children}
    </div>
  )
}

const TOOLS: IconName[] = ["crop_square", "text_fields", "link"]

/**
 * The picture on the Canvas card: a prompt and a reference wired into a model, then into an upscale
 * step. It is a drawing of the idea, at 800 by 500, not the canvas-shell template itself.
 */
function CanvasPreview() {
  return (
    <div className="home-canvas-dots relative h-125 w-200 overflow-hidden text-foreground">
      <svg viewBox="0 0 100 62.5" preserveAspectRatio="none" className="absolute inset-0 size-full fill-none">
        <path d="M31 25 C38 25,38 20,45 20" className="stroke-muted-foreground" strokeWidth={0.4} />
        <path d="M31 45 C38 45,38 24,45 24" className="stroke-muted-foreground" strokeWidth={0.4} />
        <path d="M67 22 C72 22,72 30,77 30" className="stroke-brand" strokeWidth={0.6} />
      </svg>

      <div className="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-divider bg-glass-panel-light p-1.5">
        <span className="flex size-8 items-center justify-center rounded-control bg-primary text-primary-foreground">
          <Icon name="arrow_selector_tool" />
        </span>
        {TOOLS.map((tool) => (
          <span key={tool} className="flex size-8 items-center justify-center rounded-control">
            <Icon name={tool} />
          </span>
        ))}
        <span className="h-5 w-px bg-glass-border" />
        <Button variant="brand" size="sm" className="font-bold">
          Run
          <Icon name="bolt" />
          12
        </Button>
      </div>

      <Node className="top-[28%] left-[6%] w-1/4 border-divider" icon="text_fields" color="blue" title="Prompt">
        <span className="text-xs text-muted-foreground">Glass greenhouse at dusk, fog</span>
      </Node>
      <Node className="top-[62%] left-[6%] w-1/4 border-divider" icon="image" color="pink" title="Reference">
        <span className="text-xs text-muted-foreground">greenhouse-mood.jpg</span>
      </Node>
      <Node className="top-[26%] left-[45%] w-[22%] border-brand" icon="star_shine-fill" color="purple" title="Model">
        <div className="flex gap-1">
          <span className="flex h-6.5 items-center rounded-lg bg-chip px-2 text-xs font-medium text-chip-foreground">Lumen 3</span>
          <span className="flex h-6.5 items-center rounded-lg bg-chip px-2 text-xs font-medium text-chip-foreground">16:9</span>
        </div>
      </Node>
      <Node className="top-[40%] left-[77%] w-[19%] border-divider" icon="hd" color="mint" title="Upscale">
        <span className="text-xs text-muted-foreground">×4 · 4K</span>
      </Node>

      <div className="absolute bottom-4 left-5 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex">
          <span className="size-7 rounded-full border-2 border-background bg-chart-5" />
          <span className="-ml-3 size-7 rounded-full border-2 border-background bg-brand" />
        </span>
        2 editing
      </div>
      <div className="absolute right-5 bottom-4 flex h-8 items-center gap-2.5 rounded-control bg-glass-panel-light px-3 text-sm">
        <Icon name="remove" />
        <span className="tabular-nums">100%</span>
        <Icon name="add" />
      </div>
    </div>
  )
}

export { CanvasPreview }
