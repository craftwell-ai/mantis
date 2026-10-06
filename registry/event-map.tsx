"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import type { GeoJSONSource, Map as MapLibreMap, Marker, StyleSpecification } from "maplibre-gl"
import type { TerraDraw } from "terra-draw"
import "maplibre-gl/dist/maplibre-gl.css"

import { cn } from "@/lib/mantis-cn"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Icon, type IconName } from "@/components/ui/icon"
import { IconTile } from "@/components/ui/icon-tile"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/** Longitude then latitude, the order maps use. */
export type MapPosition = [number, number]

export type MapEventKind = "pin" | "circle" | "area"

/** Where an event is: a single point, a circle around a point, or a hand-drawn area. */
export type MapEventLocation = {
  kind: MapEventKind
  /** The middle of the shape; for a pin, the pin itself. */
  center: MapPosition
  /** Circles only: distance from the centre to the edge. */
  radiusMeters?: number
  /** Circles and areas: the outline as a closed ring of positions. */
  outline?: MapPosition[]
}

/** A kind of event people can log, such as Incident or Checkpoint. */
export type MapEventCategory = {
  value: string
  label: string
  icon: IconName
  color: React.ComponentProps<typeof IconTile>["color"]
}

export type MapEvent = {
  id: string
  title: string
  /** Matches a `MapEventCategory.value`. */
  category: string
  notes?: string
  location: MapEventLocation
}

export interface EventMapProps extends Omit<React.ComponentProps<"div">, "children" | "onChange"> {
  /** The kinds of event people can choose from in the form. */
  categories: MapEventCategory[]
  /** Events already on the map when it first renders. */
  defaultEvents?: MapEvent[]
  /** Called with the full list whenever an event is saved or removed. Store the events here. */
  onEventsChange?: (events: MapEvent[]) => void
  /** Called with the new event when the form is saved. */
  onCreate?: (event: MapEvent) => void
  /** Opens the form on a location chosen elsewhere, such as a search result, without drawing it first. */
  defaultLocation?: MapEventLocation
  /** Where the map starts, as longitude then latitude. */
  center?: MapPosition
  /** Starting zoom: about 2 shows a continent, 11 a city, 15 a few streets. */
  zoom?: number
  /**
   * What the map shows. `streets` is a dark street map from OpenFreeMap (free, no key). `blank` draws
   * no map data, for offline demos and tests. Any other string is the URL of a MapLibre style.
   */
  mapStyle?: "streets" | "blank" | (string & {})
  /** Accessible name for the map. */
  label?: string
}

type Tool = "browse" | MapEventKind

const STREETS_STYLE = "https://tiles.openfreemap.org/styles/dark"
const EVENTS_SOURCE = "mantis-events"
const floating = "border border-glass-border bg-glass-panel shadow-popover backdrop-blur-glass"

const TOOLS: { value: Tool; label: string; icon: IconName; hint: string }[] = [
  { value: "browse", label: "Browse", icon: "pan_tool", hint: "" },
  { value: "pin", label: "Pin", icon: "location_on", hint: "Click the map to drop a pin." },
  { value: "circle", label: "Circle", icon: "circle", hint: "Click the centre, then click again to set the size." },
  { value: "area", label: "Area", icon: "pentagon", hint: "Click each corner, then click the first point to close the area." },
]

const EARTH_RADIUS = 6371008.8
const radians = (degrees: number) => (degrees * Math.PI) / 180

function distanceMeters([lng1, lat1]: MapPosition, [lng2, lat2]: MapPosition) {
  const a =
    Math.sin(radians(lat2 - lat1) / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(radians(lng2 - lng1) / 2) ** 2
  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(a))
}

// Close enough for areas the size of a village or a city district, which is what gets drawn here.
function areaSquareMeters(outline: MapPosition[]) {
  const latitude = radians(outline.reduce((sum, [, lat]) => sum + lat, 0) / outline.length)
  const points = outline.map(([lng, lat]) => [radians(lng) * EARTH_RADIUS * Math.cos(latitude), radians(lat) * EARTH_RADIUS])
  let twice = 0
  for (let index = 0; index < points.length; index++) {
    const [x1, y1] = points[index]
    const [x2, y2] = points[(index + 1) % points.length]
    twice += x1 * y2 - x2 * y1
  }
  return Math.abs(twice) / 2
}

function centerOf(outline: MapPosition[]): MapPosition {
  // The ring repeats its first point at the end; leave the repeat out of the average.
  const corners = outline.slice(0, -1)
  return [corners.reduce((sum, [lng]) => sum + lng, 0) / corners.length, corners.reduce((sum, [, lat]) => sum + lat, 0) / corners.length]
}

const formatDistance = (meters: number) => (meters >= 1000 ? `${(meters / 1000).toFixed(meters >= 10000 ? 0 : 1)} km` : `${Math.round(meters)} m`)
// Square metres up to a tenth of a square kilometre, then square kilometres, so the number stays readable.
const formatArea = (squareMeters: number) =>
  squareMeters >= 1e5 ? `${(squareMeters / 1e6).toFixed(squareMeters >= 1e7 ? 0 : squareMeters >= 1e6 ? 1 : 2)} km²` : `${Math.round(squareMeters / 100) * 100} m²`
const formatPosition = ([lng, lat]: MapPosition) => `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`

/** One line describing a location, such as "Circle · 450 m radius". */
function describeLocation(location: MapEventLocation) {
  if (location.kind === "circle") return `Circle · ${formatDistance(location.radiusMeters ?? 0)} radius`
  if (location.kind === "area" && location.outline) return `Area · about ${formatArea(areaSquareMeters(location.outline))}`
  return "Pin"
}

// Map paint needs plain color values, so the tokens are read from the page once the block mounts.
function readColor(element: HTMLElement, token: string) {
  const probe = document.createElement("span")
  probe.style.color = `var(${token})`
  element.appendChild(probe)
  const [red = 0, green = 0, blue = 0] = (getComputedStyle(probe).color.match(/[\d.]+/g) ?? []).map(Number)
  probe.remove()
  return `#${[red, green, blue].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}` as `#${string}`
}

function shapesOf(events: MapEvent[], selectedId: string | null) {
  return {
    type: "FeatureCollection" as const,
    features: events
      .filter((event) => event.location.outline)
      .map((event) => ({
        type: "Feature" as const,
        properties: { id: event.id, selected: event.id === selectedId },
        geometry: { type: "Polygon" as const, coordinates: [event.location.outline as MapPosition[]] },
      })),
  }
}

// MapLibre is held at version 5 on purpose: it carries its background worker inside one file, so it
// runs in any bundler with no setup. Version 6 ships the worker as a separate file that each app has
// to locate for it (setWorkerUrl), which a block installed into unknown apps cannot do.
//
// A map for logging events at places: drop a pin or draw a circle or an area, fill in what happened
// there, and it joins the list and stays on the map. The map is MapLibre and the drawing is Terra
// Draw; the default street map comes from OpenFreeMap, whose data credit must stay visible.
function EventMap({
  categories,
  defaultEvents = [],
  onEventsChange,
  onCreate,
  defaultLocation,
  center = [0, 20],
  zoom = 1.5,
  mapStyle = "streets",
  label = "Event map",
  className,
  ...props
}: EventMapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const mapRef = React.useRef<MapLibreMap | null>(null)
  const drawRef = React.useRef<TerraDraw | null>(null)
  const [ready, setReady] = React.useState(false)
  const [events, setEvents] = React.useState(defaultEvents)
  const [tool, setTool] = React.useState<Tool>("browse")
  const [draft, setDraft] = React.useState<MapEventLocation | null>(defaultLocation ?? null)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState("")
  const [category, setCategory] = React.useState(categories[0]?.value ?? "")
  const [notes, setNotes] = React.useState("")
  const [markers, setMarkers] = React.useState<{ id: string; element: HTMLDivElement }[]>([])
  const nextId = React.useRef(defaultEvents.length + 1)
  const formId = React.useId()

  const categoryOf = (value: string) => categories.find((candidate) => candidate.value === value)
  const selected = events.find((event) => event.id === selectedId) ?? null

  // Create the map once. The libraries load in the browser only, so the page can render on a server.
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let cancelled = false
    let map: MapLibreMap | undefined
    let draw: TerraDraw | undefined

    async function start(mount: HTMLDivElement) {
      const [{ default: maplibre }, terra, { TerraDrawMapLibreGLAdapter }] = await Promise.all([
        import("maplibre-gl"),
        import("terra-draw"),
        import("terra-draw-maplibre-gl-adapter"),
      ])
      if (cancelled) return
      const brand = readColor(mount, "--brand")
      const ground = readColor(mount, "--background")
      const blank: StyleSpecification = {
        version: 8,
        sources: {},
        layers: [{ id: "background", type: "background", paint: { "background-color": ground } }],
      }
      const created = new maplibre.Map({
        container: mount,
        style: mapStyle === "blank" ? blank : mapStyle === "streets" ? STREETS_STYLE : mapStyle,
        center,
        zoom,
        // The data credit is a license condition of the map data; compact keeps it small, not hidden.
        attributionControl: { compact: true },
      })
      map = created
      mapRef.current = created
      // MapLibre names its canvas "Map"; give it the name this map was given.
      created.getCanvas().setAttribute("aria-label", label)
      created.on("load", () => {
        if (cancelled) return
        created.addSource(EVENTS_SOURCE, { type: "geojson", data: shapesOf(defaultEvents, null) })
        created.addLayer({
          id: `${EVENTS_SOURCE}-fill`,
          type: "fill",
          source: EVENTS_SOURCE,
          paint: { "fill-color": brand, "fill-opacity": ["case", ["get", "selected"], 0.28, 0.12] },
        })
        created.addLayer({
          id: `${EVENTS_SOURCE}-line`,
          type: "line",
          source: EVENTS_SOURCE,
          paint: { "line-color": brand, "line-width": ["case", ["get", "selected"], 2.5, 1.5] },
        })
        const outline = { fillColor: brand, fillOpacity: 0.18, outlineColor: brand, outlineWidth: 2 }
        draw = new terra.TerraDraw({
          adapter: new TerraDrawMapLibreGLAdapter({ map: created }),
          modes: [
            new terra.TerraDrawPointMode({ styles: { pointColor: brand, pointWidth: 7, pointOutlineColor: ground, pointOutlineWidth: 2 } }),
            new terra.TerraDrawCircleMode({ styles: outline }),
            new terra.TerraDrawPolygonMode({ styles: { ...outline, closingPointColor: brand, closingPointWidth: 5, closingPointOutlineColor: ground, closingPointOutlineWidth: 2 } }),
          ],
        })
        draw.start()
        draw.on("finish", (id) => {
          const feature = draw?.getSnapshotFeature(id)
          if (!feature) return
          if (feature.geometry.type === "Point") {
            setDraft({ kind: "pin", center: feature.geometry.coordinates as MapPosition })
          } else if (feature.geometry.type === "Polygon") {
            const ring = feature.geometry.coordinates[0] as MapPosition[]
            const middle = centerOf(ring)
            if (feature.properties.mode === "circle") setDraft({ kind: "circle", center: middle, radiusMeters: distanceMeters(middle, ring[0]), outline: ring })
            else setDraft({ kind: "area", center: middle, outline: ring })
          }
          // One shape per event: stop drawing and let the form take over.
          setTool("browse")
        })
        drawRef.current = draw
        setReady(true)
      })
    }

    start(container)
    return () => {
      cancelled = true
      draw?.stop()
      map?.remove()
      mapRef.current = null
      drawRef.current = null
    }
    // The map is created once; later changes to these props would mean rebuilding it under the person's hands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The chosen tool decides what a click on the map does.
  React.useEffect(() => {
    if (!ready) return
    drawRef.current?.setMode(tool === "browse" ? "static" : tool === "pin" ? "point" : tool === "area" ? "polygon" : "circle")
  }, [tool, ready])

  // Saved shapes are drawn by the map; saved events also get a marker at their centre.
  React.useEffect(() => {
    if (!ready) return
    const map = mapRef.current
    ;(map?.getSource(EVENTS_SOURCE) as GeoJSONSource | undefined)?.setData(shapesOf(events, selectedId))
  }, [events, selectedId, ready])

  React.useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    let placed: Marker[] = []
    let cancelled = false
    import("maplibre-gl").then(({ default: maplibre }) => {
      if (cancelled) return
      const next = events.map((event) => {
        const element = document.createElement("div")
        placed.push(new maplibre.Marker({ element }).setLngLat(event.location.center).addTo(map))
        // MapLibre labels every marker as a button called "Map marker". The real, named button is the
        // one rendered inside it, so the wrapper's role comes off to avoid a button inside a button.
        element.removeAttribute("role")
        element.removeAttribute("aria-label")
        element.removeAttribute("tabindex")
        return { id: event.id, element }
      })
      setMarkers(next)
    })
    return () => {
      cancelled = true
      placed.forEach((marker) => marker.remove())
      placed = []
    }
  }, [events, ready])

  // Escape backs out of drawing, the way it closes a menu.
  React.useEffect(() => {
    if (tool === "browse") return
    const cancel = (event: KeyboardEvent) => event.key === "Escape" && setTool("browse")
    window.addEventListener("keydown", cancel)
    return () => window.removeEventListener("keydown", cancel)
  }, [tool])

  function update(next: MapEvent[]) {
    setEvents(next)
    onEventsChange?.(next)
  }

  function discard() {
    drawRef.current?.clear()
    setDraft(null)
    setTitle("")
    setNotes("")
  }

  function save(event: React.FormEvent) {
    event.preventDefault()
    if (!draft || !title.trim()) return
    const created: MapEvent = { id: `event-${nextId.current++}`, title: title.trim(), category, notes: notes.trim() || undefined, location: draft }
    update([...events, created])
    onCreate?.(created)
    discard()
    setSelectedId(created.id)
  }

  function open(event: MapEvent) {
    setSelectedId(event.id)
    mapRef.current?.flyTo({ center: event.location.center, zoom: Math.max(mapRef.current.getZoom(), 11) })
  }

  function remove(event: MapEvent) {
    update(events.filter((candidate) => candidate.id !== event.id))
    setSelectedId(null)
  }

  const hint = TOOLS.find((candidate) => candidate.value === tool)?.hint

  return (
    <div
      data-slot="event-map"
      className={cn("@container relative h-full min-h-120 w-full overflow-hidden rounded-2xl border border-border bg-background text-foreground", className)}
      {...props}
    >
      {/* MapLibre makes its own element position: relative, so the element that fills the block is a wrapper. */}
      <div
        // The data credit is restyled to sit on the dark map; it stays visible, as the data license asks.
        className="absolute inset-0 [&_.maplibregl-ctrl-attrib]:bg-glass-panel! [&_.maplibregl-ctrl-attrib]:text-xs [&_.maplibregl-ctrl-attrib]:text-foreground! [&_.maplibregl-ctrl-attrib_a]:text-foreground! [&_.maplibregl-ctrl-attrib-button]:invert"
      >
        <div ref={containerRef} className="size-full" />
      </div>

      {markers.map(({ id, element }) => {
        const event = events.find((candidate) => candidate.id === id)
        if (!event) return null
        const kind = categoryOf(event.category)
        return createPortal(
          <button
            type="button"
            aria-label={`${event.title}, ${kind?.label ?? event.category}`}
            aria-pressed={event.id === selectedId}
            onClick={() => open(event)}
            className={cn(
              "flex rounded-lg outline-none ring-background transition-shadow duration-(--duration-normal) focus-visible:ring-3 focus-visible:ring-ring/50",
              event.id === selectedId ? "ring-2 ring-brand" : "ring-2",
            )}
          >
            <IconTile name={kind?.icon ?? "location_on"} color={kind?.color ?? "neutral"} />
          </button>,
          element,
          id,
        )
      })}

      <div className={cn("absolute top-3 left-3 rounded-2xl p-1.5", floating)}>
        <ToggleGroup aria-label="Map tool" value={[tool]} onValueChange={(next) => setTool((next[0] as Tool | undefined) ?? "browse")}>
          {TOOLS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              // The name stays on the button when the word is hidden to fit a narrow map.
              aria-label={option.label}
              disabled={!ready || (draft !== null && option.value !== "browse")}
            >
              <Icon name={option.icon} />
              <span className="hidden @md:inline">{option.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {hint ? (
        <p role="status" className={cn("absolute bottom-10 left-1/2 w-max max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-lg px-3 py-1.5 text-center text-xs", floating)}>
          {hint} Esc cancels.
        </p>
      ) : null}

      <div className={cn("absolute bottom-3 left-3 flex flex-col gap-0.5 rounded-xl p-1", floating)}>
        <Button variant="ghost" size="icon-sm" aria-label="Zoom in" disabled={!ready} onClick={() => mapRef.current?.zoomIn()}>
          <Icon name="add" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Zoom out" disabled={!ready} onClick={() => mapRef.current?.zoomOut()}>
          <Icon name="remove" />
        </Button>
      </div>

      <aside
        aria-label="Events"
        className={cn(
          "absolute inset-x-3 bottom-16 flex max-h-[50%] flex-col gap-4 overflow-y-auto rounded-2xl p-4 @2xl:inset-x-auto @2xl:top-3 @2xl:right-3 @2xl:bottom-auto @2xl:max-h-[calc(100%-4rem)] @2xl:w-80",
          floating,
        )}
      >
        {draft ? (
          <form id={formId} onSubmit={save} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-title-sm">New event</h2>
              <p className="text-sm text-muted-foreground">
                {describeLocation(draft)} · {formatPosition(draft.center)}
              </p>
            </div>
            <Field>
              <FieldLabel htmlFor={`${formId}-title`}>Title</FieldLabel>
              <Input id={`${formId}-title`} required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Road closed after flooding" />
            </Field>
            <Field>
              <FieldLabel id={`${formId}-category`}>Type</FieldLabel>
              <Select items={categories} value={category} onValueChange={(next) => next && setCategory(next)}>
                <SelectTrigger aria-labelledby={`${formId}-category`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${formId}-notes`}>Notes</FieldLabel>
              <Textarea id={`${formId}-notes`} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What happened, who reported it, what is needed" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={discard}>
                Discard
              </Button>
              <Button type="submit" disabled={!title.trim()}>
                Save event
              </Button>
            </div>
          </form>
        ) : selected ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <IconTile name={categoryOf(selected.category)?.icon ?? "location_on"} color={categoryOf(selected.category)?.color ?? "neutral"} size="lg" />
              <div className="flex min-w-0 flex-col gap-0.5">
                <h2 className="text-base font-medium">{selected.title}</h2>
                <p className="text-sm text-muted-foreground">{categoryOf(selected.category)?.label ?? selected.category}</p>
              </div>
            </div>
            {selected.notes ? <p className="text-sm">{selected.notes}</p> : null}
            <p className="text-sm text-muted-foreground">
              {describeLocation(selected.location)} · {formatPosition(selected.location.center)}
            </p>
            <div className="flex justify-between gap-2">
              <Button variant="ghost" onClick={() => setSelectedId(null)}>
                <Icon name="arrow_back" />
                All events
              </Button>
              <Button variant="destructive" onClick={() => remove(selected)}>
                <Icon name="delete" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="flex items-baseline justify-between text-title-sm">
              Events
              <span className="text-sm font-normal text-muted-foreground">{events.length}</span>
            </h2>
            {events.length ? (
              <ul className="flex flex-col gap-1">
                {events.map((event) => (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => open(event)}
                      className="flex w-full items-center gap-3 rounded-xl p-2 text-left outline-none transition-colors duration-(--duration-normal) hover:bg-glass focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <IconTile name={categoryOf(event.category)?.icon ?? "location_on"} color={categoryOf(event.category)?.color ?? "neutral"} />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">{event.title}</span>
                        <span className="truncate text-xs text-muted-foreground">{describeLocation(event.location)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No events yet. Choose Pin, Circle or Area, then click the map to mark where something happened.</p>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}

export { EventMap }
