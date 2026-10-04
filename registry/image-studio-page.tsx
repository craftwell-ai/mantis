"use client"

import { useId, useState, type ReactNode } from "react"
import { cn } from "@/lib/mantis-cn"

import { Heading, HeadingAccent } from "@/components/ui/heading"
// Relative on purpose: shadcn installs blocks side by side and leaves relative imports alone.
import { GenerationFeed, type GenerationFeedItem } from "./generation-feed"
import { LightboxInspector, type LightboxItem } from "./lightbox-inspector"
import { PromptComposer, type PromptComposerProps } from "./prompt-composer"
import { SAMPLE_GENERATIONS, SAMPLE_IMAGE_COMPOSER, sampleNavigation } from "./sample-content"
import { TopNavigation, type TopNavigationProps } from "./top-navigation"

export interface ImageStudioPageProps {
  /** Everything the top bar needs; set `activeHref` to this page's link. Leave out to show the sample product's bar. */
  navigation?: TopNavigationProps
  /** The docked composer: models, credit balance, `generating` and `onGenerate`. Leave out for the sample models. */
  composer?: PromptComposerProps
  /** The person's generations, newest first. While empty (and not loading), the hero shows instead. Leave out for sample results; pass `[]` for a first visit. */
  items?: GenerationFeedItem[]
  /** First load of the history: the feed shows skeleton tiles instead of the hero. */
  loading?: boolean
  /** The hero headline. Uppercase display type; wrap one word in `HeadingAccent` for lime. */
  heroTitle?: ReactNode
  /** One short line under the headline saying what happens next. */
  heroDescription?: ReactNode
  /** Names the page for assistive tech once the hero has given way to the feed. */
  pageTitle?: string
  /** Visible heading above the feed. */
  feedTitle?: ReactNode
  /** Shown as the author in the lightbox. */
  owner?: { name: string; avatarSrc?: string }
  /** Credits Recreate spends in the lightbox. */
  recreateCost?: number
  onDownload?: (item: GenerationFeedItem) => void
  /** Puts a generation's prompt and settings back in the composer (feed tiles and the lightbox's Recreate). */
  onReuse?: (item: GenerationFeedItem) => void
  /** Runs after the person confirms in the lightbox. */
  onDelete?: (item: GenerationFeedItem) => void
  className?: string
}

const SAMPLE_NAVIGATION = sampleNavigation("/image")

const isReady = (item: GenerationFeedItem) => item.status !== "generating" && Boolean(item.src)

// The image studio (docs/inventory.md §4): top bar, a centered uppercase hero
// on a first visit that gives way to the generation feed once there are
// results, and the prompt composer docked to the bottom of the window so
// writing the next prompt never needs a scroll. Tiles open in the lightbox.
function ImageStudioPage({
  navigation = SAMPLE_NAVIGATION,
  composer = SAMPLE_IMAGE_COMPOSER,
  items = SAMPLE_GENERATIONS,
  loading = false,
  heroTitle = (
    <>
      Sketch it in <HeadingAccent>words</HeadingAccent>
    </>
  ),
  heroDescription = "Describe a scene, choose its shape and how many takes you want. Your first images land here in seconds.",
  pageTitle = "Image studio",
  feedTitle = "Your generations",
  owner = { name: "You" },
  recreateCost,
  onDownload,
  onReuse,
  onDelete,
  className,
}: ImageStudioPageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const heroTitleId = useId()

  const showHero = !loading && items.length === 0
  // Only finished pictures can be inspected; tiles still generating have no media yet.
  const readyItems = items.filter(isReady)
  const lightboxItems: LightboxItem[] = readyItems.map((item) => ({
    id: item.id,
    src: item.src ?? "",
    alt: item.alt,
    prompt: item.prompt,
    author: owner,
    info: [
      { label: "Model", value: item.model },
      ...(item.settings?.length ? [{ label: "Settings", value: item.settings.join(" · ") }] : []),
      { label: "Created", value: item.createdAt },
    ],
  }))
  const findItem = (lightboxItem: LightboxItem) => readyItems.find((item) => item.id === lightboxItem.id)
  const withItem = (lightboxItem: LightboxItem, run: (item: GenerationFeedItem) => void) => {
    const item = findItem(lightboxItem)
    if (item) run(item)
  }

  function openItem(item: GenerationFeedItem) {
    const index = readyItems.findIndex((entry) => entry.id === item.id)
    if (index < 0) return
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <div data-slot="image-studio-page" className={cn("flex min-h-svh flex-col bg-background text-foreground", className)}>
      <TopNavigation {...navigation} />

      <main className="relative flex flex-1 flex-col">
        {showHero ? (
          <section
            aria-labelledby={heroTitleId}
            className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center"
          >
            <Heading id={heroTitleId} level="hero" render={<h1 />} className="max-w-4xl">
              {heroTitle}
            </Heading>
            {heroDescription ? (
              <p className="max-w-md text-sm text-pretty text-muted-foreground md:text-base">{heroDescription}</p>
            ) : null}
          </section>
        ) : (
          <>
            <h1 className="sr-only">{pageTitle}</h1>
            <GenerationFeed
              items={items}
              loading={loading}
              title={feedTitle}
              onOpen={openItem}
              onDownload={onDownload}
              onReuse={onReuse}
              className="flex-1 px-2 pt-2 pb-8"
            />
          </>
        )}

        {/* Docked: sticks to the bottom of the window over the feed, on a fade so tiles slide under it. */}
        <div className="sticky bottom-0 z-10 bg-linear-to-t from-background via-background/90 to-transparent px-3 pt-8 pb-3 sm:px-4 sm:pb-4">
          <PromptComposer {...composer} className={cn("mx-auto w-full max-w-3xl shadow-popover", composer.className)} />
        </div>
      </main>

      {lightboxItems.length ? (
        <LightboxInspector
          items={lightboxItems}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          recreateCost={recreateCost}
          onRecreate={
            onReuse
              ? (lightboxItem) => {
                  const item = findItem(lightboxItem)
                  if (!item) return
                  onReuse(item)
                  setLightboxOpen(false)
                }
              : undefined
          }
          onDownload={onDownload ? (lightboxItem) => withItem(lightboxItem, onDownload) : undefined}
          onDelete={onDelete ? (lightboxItem) => withItem(lightboxItem, onDelete) : undefined}
        />
      ) : null}
    </div>
  )
}

export { ImageStudioPage }
