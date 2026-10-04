"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Icon, type IconName } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
// Relative on purpose: shadcn installs blocks side by side and leaves relative imports alone.
import { SAMPLE_BRAND_NAME, SAMPLE_CANVAS_LAYERS, SAMPLE_CANVAS_PROJECT_NAME, SampleCanvasBoard } from "./sample-content"

export type CanvasTool = "select" | "pan" | "text" | "shape"

export type CanvasLayerKind = "image" | "video" | "text" | "shape" | "note"

export type CanvasLayer = {
  id: string
  name: string
  kind: CanvasLayerKind
  hidden?: boolean
  /** Position and size in board pixels, shown on the Properties tab. */
  frame?: { x: number; y: number; width: number; height: number }
}

export type CanvasAddKind = "image" | "video" | "upload" | "note"

export interface CanvasShellProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Product name; labels the empty logo slot ("<name> logo"). Defaults to the sample product, "Lumen". */
  brandName?: string
  homeHref?: string
  /** The board's name, shown top left and used as the page heading. Defaults to a sample board name. */
  projectName?: string
  tool?: CanvasTool
  defaultTool?: CanvasTool
  onToolChange?: (tool: CanvasTool) => void
  /** Zoom in percent. */
  zoom?: number
  defaultZoom?: number
  onZoomChange?: (zoom: number) => void
  /** A dotted grid (the default) or a plain board. */
  board?: "dots" | "blank"
  layers?: CanvasLayer[]
  selectedLayerId?: string
  onSelectLayer?: (layerId: string) => void
  onLayerVisibilityChange?: (layerId: string, hidden: boolean) => void
  /** Replaces the Properties tab's default position and size fields. */
  properties?: React.ReactNode
  /** Picks from the toolbar's Add menu. */
  onAdd?: (kind: CanvasAddKind) => void
  onUndo?: () => void
  onRedo?: () => void
  onShare?: () => void
  /** Replaces the Share button at the top right, such as with collaborators' avatars and Share. */
  actions?: React.ReactNode
  /** Whether the layers panel starts open on wide screens. */
  defaultPanelOpen?: boolean
  /** What sits on the board. It scales with the zoom around the board's center. */
  children?: React.ReactNode
}

export const CANVAS_ZOOM_STEPS = [10, 25, 50, 75, 100, 125, 150, 200, 300, 400]

const TOOLS: { value: CanvasTool; label: string; icon: IconName; shortcut: string }[] = [
  { value: "select", label: "Select", icon: "arrow_selector_tool", shortcut: "V" },
  { value: "pan", label: "Hand", icon: "pan_tool", shortcut: "H" },
  { value: "text", label: "Text", icon: "text_fields", shortcut: "T" },
  { value: "shape", label: "Shapes", icon: "shapes", shortcut: "R" },
]

const ADD_ITEMS: { value: CanvasAddKind; label: string; icon: IconName }[] = [
  { value: "image", label: "Image generation", icon: "image" },
  { value: "video", label: "Video generation", icon: "movie" },
  { value: "upload", label: "Upload from device", icon: "upload" },
  { value: "note", label: "Sticky note", icon: "sticky_note_2" },
]

const LAYER_ICON: Record<CanvasLayerKind, IconName> = {
  image: "image",
  video: "movie",
  text: "text_fields",
  shape: "crop_square",
  note: "sticky_note_2",
}

// Floating chrome is glass over the board, as the reference's toolbars are.
const floating = "border border-glass-border bg-glass-panel shadow-popover backdrop-blur-glass"

// Single-key tool shortcuts, ignored while someone types or holds a modifier.
function useToolShortcuts(onTool: (tool: CanvasTool) => void) {
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return
      const tool = TOOLS.find((item) => item.shortcut.toLowerCase() === event.key.toLowerCase())
      if (tool) onTool(tool.value)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onTool])
}

function IconButtonWithTip({
  label,
  icon,
  onClick,
  disabled,
  side = "top",
  className,
}: {
  label: string
  icon: IconName
  onClick?: () => void
  disabled?: boolean
  side?: "top" | "bottom"
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={label} onClick={onClick} disabled={disabled} className={className} />
        }
      >
        <Icon name={icon} />
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  )
}

function LayersList({
  layers,
  selectedLayerId,
  onSelect,
  onToggleHidden,
}: {
  layers: CanvasLayer[]
  selectedLayerId?: string
  onSelect: (id: string) => void
  onToggleHidden: (layer: CanvasLayer) => void
}) {
  if (layers.length === 0) {
    return <p className="px-2 py-6 text-center text-sm text-muted-foreground">Nothing on the board yet. Add something from the toolbar.</p>
  }
  return (
    <ul className="flex flex-col gap-0.5">
      {layers.map((layer) => {
        const selected = layer.id === selectedLayerId
        return (
          <li key={layer.id} className="group/layer flex items-center gap-1 rounded-lg pr-1 hover:bg-glass has-[[aria-pressed=true]]:bg-glass">
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(layer.id)}
              className={cn(
                "flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                layer.hidden ? "text-muted-foreground" : "text-foreground"
              )}
            >
              <Icon name={LAYER_ICON[layer.kind]} className="size-4.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{layer.name}</span>
              {layer.hidden ? <span className="sr-only">(hidden)</span> : null}
            </button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={layer.hidden ? `Show ${layer.name}` : `Hide ${layer.name}`}
              onClick={() => onToggleHidden(layer)}
            >
              <Icon name={layer.hidden ? "visibility_off" : "visibility"} />
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

function FrameFields({ layer }: { layer?: CanvasLayer }) {
  const baseId = React.useId()
  if (!layer) {
    return <p className="px-2 py-6 text-center text-sm text-muted-foreground">Select a layer to see its position and size.</p>
  }
  const frame = layer.frame ?? { x: 0, y: 0, width: 0, height: 0 }
  const fields = [
    { key: "x", label: "X", value: frame.x },
    { key: "y", label: "Y", value: frame.y },
    { key: "width", label: "Width", value: frame.width },
    { key: "height", label: "Height", value: frame.height },
  ]
  return (
    <div className="flex flex-col gap-3 px-1">
      <p className="truncate text-sm font-medium">{layer.name}</p>
      {/* Keyed by layer so the fields reset when the selection changes. */}
      <div key={layer.id} className="grid grid-cols-2 gap-3">
        {fields.map((field) => (
          <Field key={field.key}>
            <FieldLabel htmlFor={`${baseId}-${field.key}`}>{field.label}</FieldLabel>
            <Input id={`${baseId}-${field.key}`} type="number" inputMode="numeric" defaultValue={field.value} />
          </Field>
        ))}
      </div>
    </div>
  )
}

// A board page's chrome without a canvas engine: a full-bleed dotted board, a
// minimal top bar, a floating tool bar at the bottom and a layers and
// properties panel on the right (a sheet below 1024px of its own width). The app draws its own
// board content as children; this shell only scales it with the zoom.
function CanvasShell({
  brandName = SAMPLE_BRAND_NAME,
  homeHref = "/",
  projectName = SAMPLE_CANVAS_PROJECT_NAME,
  tool: toolProp,
  defaultTool = "select",
  onToolChange,
  zoom: zoomProp,
  defaultZoom = 100,
  onZoomChange,
  board = "dots",
  // A module-level constant, so the default keeps one identity across renders.
  layers: layersProp = SAMPLE_CANVAS_LAYERS,
  selectedLayerId: selectedProp,
  onSelectLayer,
  onLayerVisibilityChange,
  properties,
  onAdd,
  onUndo,
  onRedo,
  onShare,
  actions,
  defaultPanelOpen = true,
  children,
  className,
  style,
  ...props
}: CanvasShellProps) {
  const [toolState, setToolState] = React.useState(defaultTool)
  const tool = toolProp ?? toolState
  const [zoomState, setZoomState] = React.useState(defaultZoom)
  const zoom = zoomProp ?? zoomState
  const [layers, setLayers] = React.useState(layersProp)
  const [selectedState, setSelectedState] = React.useState<string | undefined>(undefined)
  const selectedLayerId = selectedProp ?? selectedState
  const [panelOpen, setPanelOpen] = React.useState(defaultPanelOpen)
  const [sheetOpen, setSheetOpen] = React.useState(false)

  // A new list from the app replaces visibility changes made here.
  React.useEffect(() => setLayers(layersProp), [layersProp])

  const changeTool = React.useCallback(
    (next: CanvasTool) => {
      if (toolProp === undefined) setToolState(next)
      onToolChange?.(next)
    },
    [toolProp, onToolChange]
  )
  useToolShortcuts(changeTool)

  const changeZoom = (next: number) => {
    if (zoomProp === undefined) setZoomState(next)
    onZoomChange?.(next)
  }
  const zoomIn = CANVAS_ZOOM_STEPS.find((step) => step > zoom)
  const zoomOut = [...CANVAS_ZOOM_STEPS].reverse().find((step) => step < zoom)

  const selectLayer = (id: string) => {
    if (selectedProp === undefined) setSelectedState(id)
    onSelectLayer?.(id)
  }
  const toggleHidden = (layer: CanvasLayer) => {
    const hidden = !layer.hidden
    setLayers((list) => list.map((item) => (item.id === layer.id ? { ...item, hidden } : item)))
    onLayerVisibilityChange?.(layer.id, hidden)
  }
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId)

  const panelBody = (
    <Tabs defaultValue="layers" className="flex min-h-0 flex-1 flex-col gap-3">
      <TabsList className="w-full">
        <TabsTrigger value="layers">Layers</TabsTrigger>
        <TabsTrigger value="properties">Properties</TabsTrigger>
      </TabsList>
      <TabsContent value="layers" className="min-h-0 flex-1 overflow-y-auto">
        <LayersList layers={layers} selectedLayerId={selectedLayerId} onSelect={selectLayer} onToggleHidden={toggleHidden} />
      </TabsContent>
      <TabsContent value="properties" className="min-h-0 flex-1 overflow-y-auto">
        {properties ?? <FrameFields layer={selectedLayer} />}
      </TabsContent>
    </Tabs>
  )

  // The dot grid scales with the zoom so the board feels like one surface.
  const gridSize = Math.max(8, Math.round((24 * zoom) / 100))
  const boardStyle: React.CSSProperties | undefined =
    board === "dots"
      ? {
          backgroundImage: "radial-gradient(color-mix(in oklab, var(--muted-foreground) 35%, transparent) 1px, transparent 1px)",
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: "center",
        }
      : undefined

  return (
    <div
      data-slot="canvas-shell"
      className={cn("@container/canvas relative h-dvh w-full overflow-hidden bg-background text-foreground", className)}
      style={style}
      {...props}
    >
      <main
        aria-label={`${projectName} board`}
        data-tool={tool}
        className={cn("absolute inset-0 overflow-hidden", tool === "pan" && "cursor-grab")}
        style={boardStyle}
      >
        <div
          className="absolute top-1/2 left-1/2 origin-center transition-transform duration-(--duration-normal) motion-reduce:transition-none"
          style={{ transform: `translate(-50%, -50%) scale(${zoom / 100})` }}
        >
          {/* Left out entirely, the board shows sample frames; pass null for a blank board. */}
          {children === undefined ? <SampleCanvasBoard /> : children}
        </div>
      </main>

      {/* The top bar floats over the board; only its controls take clicks. */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <div className={cn("pointer-events-auto flex h-11 min-w-0 items-center gap-1 rounded-xl pr-1 pl-1.5", floating)}>
          <a href={homeHref} className="shrink-0 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            {/* An empty, labelled slot: the product's own mark goes here. */}
            <span role="img" aria-label={`${brandName} logo`} className="block size-8 rounded-lg bg-glass shadow-inset-glass" />
          </a>
          <h1 className="min-w-0 truncate px-1.5 text-sm font-medium">{projectName}</h1>
          {onUndo || onRedo ? (
            <>
              <Separator orientation="vertical" className="mx-0.5 my-3" />
              <IconButtonWithTip label="Undo" icon="undo" onClick={onUndo} disabled={!onUndo} side="bottom" />
              <IconButtonWithTip label="Redo" icon="redo" onClick={onRedo} disabled={!onRedo} side="bottom" />
            </>
          ) : null}
        </div>

        <div className="pointer-events-auto flex shrink-0 items-center gap-2">
          {layersProp.length > 0 || properties ? (
            <>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="glass"
                      size="icon"
                      aria-label="Layers and properties"
                      aria-pressed={panelOpen}
                      onClick={() => setPanelOpen((open) => !open)}
                      className="hidden @5xl/canvas:inline-flex"
                    />
                  }
                >
                  <Icon name="dock_to_right" />
                </TooltipTrigger>
                <TooltipContent side="bottom">{panelOpen ? "Hide layers" : "Show layers"}</TooltipContent>
              </Tooltip>
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger render={<Button variant="glass" size="icon" aria-label="Layers and properties" className="@5xl/canvas:hidden" />}>
                  <Icon name="layers" />
                </SheetTrigger>
                <SheetContent side="right" className="w-80 gap-0">
                  <SheetHeader>
                    <SheetTitle>Layers and properties</SheetTitle>
                  </SheetHeader>
                  <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">{panelBody}</div>
                </SheetContent>
              </Sheet>
            </>
          ) : null}
          {actions ?? (
            <Button size="lg" onClick={onShare}>
              <Icon name="person_add" />
              Share
            </Button>
          )}
        </div>
      </header>

      {panelOpen && (layersProp.length > 0 || properties) ? (
        <aside
          aria-label="Layers and properties"
          className={cn("absolute top-17 right-3 bottom-3 hidden w-72 flex-col rounded-2xl p-3 @5xl/canvas:flex", floating)}
        >
          {panelBody}
        </aside>
      ) : null}

      {/* The tool bar: tools, add, and zoom. */}
      <div
        className={cn(
          "absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-2xl p-1.5",
          floating
        )}
      >
        <ToggleGroup
          value={[tool]}
          onValueChange={(value: string[]) => {
            const next = value[0] as CanvasTool | undefined
            if (next) changeTool(next)
          }}
          aria-label="Tool"
          className="bg-transparent p-0"
        >
          {TOOLS.map((item) => (
            <Tooltip key={item.value}>
              <TooltipTrigger
                render={<ToggleGroupItem value={item.value} aria-label={item.label} className="px-0" />}
              >
                <Icon name={item.icon} />
              </TooltipTrigger>
              <TooltipContent>
                {item.label}
                <Kbd>{item.shortcut}</Kbd>
              </TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>

        <Separator orientation="vertical" className="mx-0.5 my-1.5" />

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger render={<DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Add to board" />} />}>
              <Icon name="add" />
            </TooltipTrigger>
            <TooltipContent>Add to board</TooltipContent>
          </Tooltip>
          <DropdownMenuContent side="top" align="center" sideOffset={12} className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Add to board</DropdownMenuLabel>
              {ADD_ITEMS.map((item) => (
                <DropdownMenuItem key={item.value} onClick={() => onAdd?.(item.value)}>
                  <Icon name={item.icon} />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-0.5 my-1.5" />

        <div role="group" aria-label="Zoom" className="flex items-center">
          <IconButtonWithTip label="Zoom out" icon="zoom_out" onClick={() => zoomOut && changeZoom(zoomOut)} disabled={!zoomOut} />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-14 px-0 tabular-nums"
                  aria-label={`${zoom}%, reset zoom to 100%`}
                  onClick={() => changeZoom(100)}
                />
              }
            >
              {zoom}%
            </TooltipTrigger>
            <TooltipContent>Reset to 100%</TooltipContent>
          </Tooltip>
          <IconButtonWithTip label="Zoom in" icon="zoom_in" onClick={() => zoomIn && changeZoom(zoomIn)} disabled={!zoomIn} />
        </div>
      </div>
    </div>
  )
}

export { CanvasShell }
