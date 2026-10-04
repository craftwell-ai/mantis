"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/mantis-cn"

import { Heading, HeadingAccent } from "@/components/ui/heading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "./empty-state"
import { LightboxInspector, type LightboxItem } from "./lightbox-inspector"
import { MediaGrid, type MediaGridItem } from "./media-grid"
import { SAMPLE_BRAND_NAME, sampleNavigationWithoutBrand } from "./sample-content"
import { TopNavigation, type TopNavigationProps } from "./top-navigation"

export type ExploreItem = MediaGridItem &
  Pick<LightboxItem, "prompt" | "info"> & {
    /** The category id this item is filed under; matches an entry in `categories`. */
    category: string
  }

export type ExploreCategory = { id: string; label: string }

export interface ExplorePageProps {
  /** Product name; labels the logo slot in the top bar. */
  brandName?: string
  /** Everything the top bar needs except the brand name. `activeHref` defaults to "/explore". */
  navigation?: Omit<TopNavigationProps, "brandName">
  /** The page headline, written in sentence case; it renders uppercase. */
  title?: string
  /** One word of `title` to set in lime. */
  accent?: string
  description?: ReactNode
  /** Filter pills after "All", in display order. */
  categories?: ExploreCategory[]
  /** Label of the first pill, which shows every item. */
  allLabel?: string
  items?: ExploreItem[]
  /** Which pill starts selected; "all" or a category id. */
  defaultCategory?: string
  /** First load: the grid draws skeleton tiles. */
  loading?: boolean
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
  /** Called after the like toggles; the page already updates the count. */
  onLike?: (item: ExploreItem, liked: boolean) => void
  /** Generate again from an item's prompt: the grid's hover button and the viewer's lime action. */
  onRecreate?: (item: ExploreItem) => void
  /** Credits Recreate spends, shown on the viewer's button. */
  recreateCost?: number
  onDownload?: (item: ExploreItem) => void
  onShare?: (item: ExploreItem) => void
  className?: string
}

const ALL = "all"

const DEFAULT_CATEGORIES: ExploreCategory[] = [
  { id: "portraits", label: "Portraits" },
  { id: "landscapes", label: "Landscapes" },
  { id: "product", label: "Product" },
  { id: "architecture", label: "Architecture" },
  { id: "film-stills", label: "Film stills" },
  { id: "illustration", label: "Illustration" },
]

const AUTHORS = ["Mira Okafor", "Tomas Lindqvist", "Ana Ruiz", "Kenji Mori", "Priya Nair", "Leo Brandt"]

// [seed, alt, width, height, category, prompt]
const SAMPLE: [string, string, number, number, string, string][] = [
  ["potter", "Portrait of a potter at her wheel", 600, 800, "portraits", "Environmental portrait of a potter at her wheel, clay on her forearms, shelves of drying bowls behind her, north window light."],
  ["dunes", "Wind-carved sand dunes at sunrise", 800, 600, "landscapes", "Aerial view of wind-carved dunes at sunrise, long shadows in the ripples, a single line of footprints crossing the ridge."],
  ["perfume", "Glass perfume bottle on wet black stone", 600, 750, "product", "Studio product shot of a faceted glass perfume bottle on wet black slate, soft rim light, droplets catching the highlights."],
  ["stairwell", "Spiral stairwell seen from below", 600, 900, "architecture", "Looking straight up a white spiral stairwell, the handrail forming a tight curl toward a round skylight."],
  ["diner", "Night diner with a lone customer", 900, 600, "film-stills", "Wide film still of an empty diner after midnight, one customer at the counter, neon reflected in the window, anamorphic flare."],
  ["fox", "Ink illustration of a fox in tall grass", 800, 800, "illustration", "Loose ink and watercolor illustration of a red fox half hidden in tall summer grass, paper texture visible."],
  ["fisher", "Fisherman mending nets on a pier", 600, 800, "portraits", "Close portrait of an old fisherman mending nets on a pier, weathered hands in focus, overcast morning light."],
  ["fjord", "Mist over a fjord between steep cliffs", 800, 500, "landscapes", "Low mist drifting through a narrow fjord, steep green cliffs on both sides, a small red boat for scale."],
  ["sneaker", "Sneaker floating above a pastel backdrop", 800, 800, "product", "A white running sneaker floating mid-air above a pastel peach backdrop, laces lifting, crisp shadow on the floor."],
  ["atrium", "Concrete atrium with afternoon light", 800, 1000, "architecture", "Brutalist concrete atrium, shafts of afternoon light through slot windows, a single person crossing the floor."],
  ["rooftop", "Two figures on a rooftop at dusk", 900, 600, "film-stills", "Two silhouetted figures talking on a rooftop at dusk, city lights coming on behind them, 35mm grain."],
  ["lighthouse", "Paper-cut illustration of a lighthouse", 600, 800, "illustration", "Layered paper-cut illustration of a lighthouse on a cliff, waves in five shades of blue, soft drop shadows."],
]

const DEFAULT_ITEMS: ExploreItem[] = SAMPLE.map(([seed, alt, width, height, category, prompt], index) => ({
  id: seed,
  src: `https://picsum.photos/seed/${seed}/${width}/${height}`,
  alt,
  width,
  height,
  category,
  prompt,
  author: { name: AUTHORS[index % AUTHORS.length] },
  likes: 140 + index * 263,
  liked: index === 3,
  info: [
    { label: "Model", value: "Lumen Photo 2" },
    { label: "Size", value: `${width * 2} × ${height * 2}` },
    { label: "Seed", value: String(20431 + index * 977) },
    { label: "Shared", value: "Sep 30, 2026" },
  ],
}))

// The same sample bar as every other template, so the sample product reads as one app.
const DEFAULT_NAVIGATION = sampleNavigationWithoutBrand()

// The community page: the app's top bar, an uppercase headline, a row of
// category pills, then the masonry of everyone's work. Picking a picture
// opens the viewer on it, and the arrows step through the current category.
function ExplorePage({
  brandName = SAMPLE_BRAND_NAME,
  navigation = DEFAULT_NAVIGATION,
  title = "Explore what people are making",
  accent = "making",
  description = "Fresh work from the community, updated every few minutes. Open any picture to see the prompt behind it.",
  categories = DEFAULT_CATEGORIES,
  allLabel = "All",
  items = DEFAULT_ITEMS,
  defaultCategory = ALL,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  onLike,
  onRecreate,
  recreateCost,
  onDownload,
  onShare,
  className,
}: ExplorePageProps) {
  const [category, setCategory] = useState(defaultCategory)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  // Likes are toggled locally so the count responds at once; onLike reports the change.
  const [likeOverrides, setLikeOverrides] = useState<Record<string, boolean>>({})

  const shown = items
    .filter((item) => category === ALL || item.category === category)
    .map((item) => {
      const override = likeOverrides[item.id]
      if (override === undefined || override === Boolean(item.liked)) return item
      return { ...item, liked: override, likes: (item.likes ?? 0) + (override ? 1 : -1) }
    })

  const pills = [{ id: ALL, label: allLabel }, ...categories]
  const accentAt = accent ? title.indexOf(accent) : -1

  function toggleLike(item: MediaGridItem) {
    const next = !item.liked
    setLikeOverrides((current) => ({ ...current, [item.id]: next }))
    const original = items.find((entry) => entry.id === item.id)
    if (original) onLike?.(original, next)
  }

  function open(item: MediaGridItem) {
    setViewerIndex(Math.max(0, shown.findIndex((entry) => entry.id === item.id)))
    setViewerOpen(true)
  }

  // The grid and viewer hand back their own item shapes; callers get the original ExploreItem.
  const withOriginal = (callback?: (item: ExploreItem) => void) =>
    callback
      ? (item: { id: string }) => {
          const original = items.find((entry) => entry.id === item.id)
          if (original) callback(original)
        }
      : undefined

  return (
    <div data-slot="explore-page" className={cn("flex min-h-dvh w-full flex-col bg-background", className)}>
      <TopNavigation brandName={brandName} activeHref="/explore" {...navigation} className="sticky top-0 z-20" />

      <main className="flex flex-1 flex-col gap-4 px-2 pt-4 pb-12 sm:px-4">
        <header className="flex flex-col gap-1 px-2 sm:px-0">
          <Heading level="sub" render={<h1 />}>
            {accent && accentAt >= 0 ? (
              <>
                {title.slice(0, accentAt)}
                <HeadingAccent>{accent}</HeadingAccent>
                {title.slice(accentAt + accent.length)}
              </>
            ) : (
              title
            )}
          </Heading>
          {description ? <p className="max-w-2xl text-sm text-pretty text-muted-foreground">{description}</p> : null}
        </header>

        <Tabs value={category} onValueChange={(value) => setCategory(String(value))} className="gap-4">
          {/* The pills scroll sideways on narrow screens instead of wrapping into a wall of chips. */}
          <div className="-mx-2 overflow-x-auto px-2 pb-1 sm:mx-0 sm:px-0">
            <TabsList variant="pill" aria-label="Categories">
              {pills.map((pill) => (
                <TabsTrigger key={pill.id} value={pill.id} className="flex-none">
                  {pill.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {pills.map((pill) => (
            <TabsContent key={pill.id} value={pill.id}>
              <MediaGrid
                label={pill.id === ALL ? "Community creations" : `${pill.label} from the community`}
                items={shown}
                loading={loading}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={onLoadMore}
                onOpen={open}
                onLike={toggleLike}
                onRecreate={withOriginal(onRecreate)}
                empty={
                  <EmptyState
                    icon="photo_library"
                    title={`No ${pill.label.toLowerCase()} shared yet`}
                    description="Nobody has shared work in this category today. Try another one, or check back soon."
                  />
                }
              />
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <LightboxInspector
        items={shown}
        index={viewerIndex}
        onIndexChange={setViewerIndex}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        recreateCost={recreateCost}
        onRecreate={withOriginal(onRecreate)}
        onDownload={withOriginal(onDownload)}
        onShare={withOriginal(onShare)}
      />
    </div>
  )
}

export { ExplorePage }
