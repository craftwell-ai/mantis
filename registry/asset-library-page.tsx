"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/mantis-cn"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Heading } from "@/components/ui/heading"
import { Icon } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { MediaTile } from "@/components/ui/media-tile"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Relative on purpose: shadcn installs blocks side by side and leaves relative imports alone.
import { EmptyState } from "./empty-state"
import { SAMPLE_ASSETS, sampleNavigation } from "./sample-content"
import { TopNavigation, type TopNavigationProps } from "./top-navigation"

export type LibraryAssetKind = "image" | "video" | "upload"

export interface LibraryAsset {
  id: string
  /** The picture, or a still for a video. */
  src: string
  /** Describes what the picture shows. */
  alt: string
  /** File or generation name; search matches it. */
  name: string
  kind: LibraryAssetKind
  /** One short line under the name, already formatted: "2048 × 2048", "PNG · 3.1 MB". */
  detail?: string
  /** A video's length, such as "0:06". Shown on the tile. */
  duration?: string
}

export interface LibraryFilter {
  value: string
  label: string
  /** The kinds this tab shows. Leave out for "All". */
  kinds?: LibraryAssetKind[]
}

export interface AssetLibraryPageProps {
  /** Everything the top bar needs; usually `assetsHref` points at this page. Leave out to show the sample product's bar. */
  navigation?: TopNavigationProps
  /** Leave out for sample assets; pass `[]` for the empty library. */
  assets?: LibraryAsset[]
  /** First load: the grid shows skeleton tiles. */
  loading?: boolean
  title?: ReactNode
  /** One line under the title. */
  description?: ReactNode
  filters?: LibraryFilter[]
  /** Opens a file picker or the add-media panel. */
  onUpload?: () => void
  /** Accepted files, shown under the empty state's button. */
  uploadHint?: ReactNode
  /** Opens one asset, usually in the lightbox inspector. */
  onOpen?: (asset: LibraryAsset) => void
  onDownload?: (assets: LibraryAsset[]) => void
  /** Runs only after the person confirms. */
  onDelete?: (assets: LibraryAsset[]) => void
  className?: string
}

export const DEFAULT_LIBRARY_FILTERS: LibraryFilter[] = [
  { value: "all", label: "All" },
  { value: "images", label: "Images", kinds: ["image"] },
  { value: "videos", label: "Videos", kinds: ["video"] },
  { value: "uploads", label: "Uploads", kinds: ["upload"] },
]

const KIND_LABEL: Record<LibraryAssetKind, string> = { image: "Image", video: "Video", upload: "Upload" }
const SKELETON_COUNT = 10
const SAMPLE_NAVIGATION = sampleNavigation("/assets")

// The asset library (docs/inventory.md §4): a page header with the upload
// action, filter tabs and a search field, then a grid of asset tiles that can
// be selected with a corner checkbox. Selecting brings up a floating bar to
// download or delete in bulk, as the reference does. With nothing uploaded or
// generated yet, the page shows the empty state and its one upload button.
function AssetLibraryPage({
  navigation = SAMPLE_NAVIGATION,
  assets = SAMPLE_ASSETS,
  loading = false,
  title = "Assets",
  description = "Everything you have generated or uploaded, ready to reuse as a reference.",
  filters = DEFAULT_LIBRARY_FILTERS,
  onUpload,
  uploadHint = "PNG, JPG, WEBP, MP4 or MOV, up to 200 MB each",
  onOpen,
  onDownload,
  onDelete,
  className,
}: AssetLibraryPageProps) {
  const [filter, setFilter] = useState(filters[0]?.value ?? "all")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)

  const libraryEmpty = !loading && assets.length === 0
  const selectedAssets = assets.filter((asset) => selected.has(asset.id))
  const selectedCount = selectedAssets.length
  const plural = selectedCount === 1 ? "asset" : "assets"

  function visibleFor(value: string) {
    const kinds = filters.find((entry) => entry.value === value)?.kinds
    const needle = query.trim().toLowerCase()
    return assets.filter(
      (asset) => (!kinds || kinds.includes(asset.kind)) && (!needle || asset.name.toLowerCase().includes(needle))
    )
  }

  function toggle(id: string, checked: boolean) {
    setSelected((previous) => {
      const next = new Set(previous)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <div data-slot="asset-library-page" className={cn("flex min-h-svh flex-col bg-background text-foreground", className)}>
      <TopNavigation {...navigation} />

      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pt-8 pb-24">
        <header className="flex flex-wrap items-end gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Heading level="title" render={<h1 />}>
              {title}
            </Heading>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {/* With an empty library the empty state carries the upload button, so the page still has only one.
              Uploading is this page's main action, so it is lime, as on the reference. */}
          {onUpload && !libraryEmpty ? (
            <Button variant="brand" onClick={onUpload}>
              <Icon name="upload" />
              Upload
            </Button>
          ) : null}
        </header>

        {libraryEmpty ? (
          <EmptyState
            icon="photo_library"
            title="Your library is empty"
            description="Upload photos, product shots or clips to use as references, and every image and video you generate will be saved here too."
            action={
              onUpload ? (
                <Button variant="brand" onClick={onUpload}>
                  <Icon name="upload" />
                  Upload files
                </Button>
              ) : undefined
            }
            hint={onUpload ? uploadHint : undefined}
            className="flex-1"
          />
        ) : (
          <Tabs value={filter} onValueChange={(value) => setFilter(String(value))} className="flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* justify-start: a centered row that overflows clips its first tab out of scroll reach. */}
              <TabsList variant="pill" aria-label="Asset type" className="max-w-full justify-start overflow-x-auto">
                {filters.map((entry) => (
                  <TabsTrigger key={entry.value} value={entry.value} className="flex-none">
                    {entry.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <InputGroup className="w-full sm:ml-auto sm:w-64">
                <InputGroupAddon>
                  <Icon name="search" />
                </InputGroupAddon>
                <InputGroupInput
                  type="search"
                  aria-label="Search assets by name"
                  placeholder="Search by name"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query ? (
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setQuery("")}>
                      <Icon name="close" />
                    </InputGroupButton>
                  </InputGroupAddon>
                ) : null}
              </InputGroup>
            </div>

            {filters.map((entry) => {
              const visible = visibleFor(entry.value)
              return (
                <TabsContent key={entry.value} value={entry.value} aria-busy={loading || undefined}>
                  {loading ? (
                    <ul aria-label="Loading assets" className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                        <li key={index} className="flex flex-col gap-2">
                          <Skeleton className="aspect-square rounded-xl" />
                          <Skeleton className="h-3.5 w-2/3" />
                        </li>
                      ))}
                    </ul>
                  ) : visible.length === 0 ? (
                    <EmptyState
                      icon="search"
                      title={query ? `Nothing named “${query.trim()}”` : `No ${entry.label.toLowerCase()} yet`}
                      description={
                        query
                          ? "Check the spelling, try part of the name, or look under All."
                          : "Assets of this type will appear here as you generate or upload them."
                      }
                      action={
                        query ? (
                          <Button variant="glass" onClick={() => setQuery("")}>
                            Clear search
                          </Button>
                        ) : undefined
                      }
                    />
                  ) : (
                    <ul aria-label={`${entry.label} assets`} className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                      {visible.map((asset) => (
                        <AssetTile
                          key={asset.id}
                          asset={asset}
                          selected={selected.has(asset.id)}
                          selecting={selectedCount > 0}
                          onSelectedChange={(checked) => toggle(asset.id, checked)}
                          onOpen={onOpen}
                        />
                      ))}
                    </ul>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        )}

        {selectedCount > 0 ? (
          // Floats over the grid at the bottom of the window, like the reference's selection bar.
          <section
            aria-label="Selection"
            className="sticky bottom-4 z-10 mx-auto flex max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border border-glass-border bg-popover p-1.5 text-popover-foreground shadow-popover"
          >
            <p aria-live="polite" className="px-2 text-sm font-medium tabular-nums">
              {selectedCount} selected
            </p>
            {onDownload ? (
              <Button variant="glass" size="sm" onClick={() => onDownload(selectedAssets)}>
                <Icon name="download" />
                Download
              </Button>
            ) : null}
            {onDelete ? (
              <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                <Icon name="delete" />
                Delete
              </Button>
            ) : null}
            <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={() => setSelected(new Set())}>
              <Icon name="close" />
            </Button>
          </section>
        ) : null}
      </main>

      {onDelete ? (
        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {selectedCount} {plural}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedCount === 1 ? "It is" : "They are"} removed from your library and from any project that uses{" "}
                {selectedCount === 1 ? "it" : "them"}. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="glass">Keep {plural}</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  onDelete(selectedAssets)
                  setSelected(new Set())
                  setConfirmDelete(false)
                }}
              >
                Delete {plural}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  )
}

function AssetTile({
  asset,
  selected,
  selecting,
  onSelectedChange,
  onOpen,
}: {
  asset: LibraryAsset
  selected: boolean
  /** Something is selected, so every checkbox stays visible. */
  selecting: boolean
  onSelectedChange: (checked: boolean) => void
  onOpen?: (asset: LibraryAsset) => void
}) {
  return (
    <li className="flex min-w-0 flex-col gap-2">
      <MediaTile
        src={asset.src}
        alt={asset.alt}
        onClick={onOpen ? () => onOpen(asset) : undefined}
        label={`Open ${asset.name}`}
        // Selection is lime, like the checkbox itself; the checkbox carries the state.
        selected={selected}
        indicator={false}
        actionsAlign="start"
        actionsVisible={selected || selecting}
        actions={
          <span className="flex rounded-md bg-overlay">
            <Checkbox checked={selected} onCheckedChange={(checked) => onSelectedChange(checked === true)} aria-label={`Select ${asset.name}`} />
          </span>
        }
        detail={
          asset.kind === "video" ? (
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-overlay px-2 text-xs font-medium text-foreground tabular-nums">
              <Icon name="play_arrow" />
              {asset.duration ?? <span className="sr-only">Video</span>}
            </span>
          ) : null
        }
      />
      <div className="flex min-w-0 flex-col px-0.5">
        <p className="truncate text-sm font-medium text-foreground">{asset.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {KIND_LABEL[asset.kind]}
          {asset.detail ? ` · ${asset.detail}` : null}
        </p>
      </div>
    </li>
  )
}

export { AssetLibraryPage }
