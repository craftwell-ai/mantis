"use client"

import { useId, useState, type ReactNode } from "react"
import { cn } from "@/lib/mantis-cn"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { MediaTile } from "@/components/ui/media-tile"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
// Relative on purpose: shadcn installs blocks side by side and leaves relative imports alone.
import { EmptyState } from "./empty-state"
import { SAMPLE_CLIPS, SAMPLE_VIDEO_SETTINGS, sampleNavigation } from "./sample-content"
import { StudioSettingsPanel, type StudioSettingsPanelProps } from "./studio-settings-panel"
import { TopNavigation, type TopNavigationProps } from "./top-navigation"

export interface VideoStudioClip {
  id: string
  /** A still from the clip. Leave it out while `status` is "generating". */
  posterSrc?: string
  /** The video file. Without it the canvas shows the poster still. */
  videoSrc?: string
  /** A WebVTT captions file for the video, when the clip has speech or meaningful sound. */
  captionsSrc?: string
  /** Describes what the clip shows. */
  alt: string
  prompt: string
  /** The model's display name in your product. */
  model: string
  /** Short setting values, already formatted: "5s", "16:9", "1080p". */
  settings?: string[]
  /** When it was made, written for people: "2 min ago", "Sep 30". */
  createdAt: string
  /** "generating" draws a shimmering canvas with a status word instead of media. */
  status?: "ready" | "generating"
}

export interface VideoStudioPageProps {
  /** Everything the top bar needs; set `activeHref` to this page's link. Leave out to show the sample product's bar. */
  navigation?: TopNavigationProps
  /** The left rail: models, preset, references, credit balance, `generating` and `onGenerate`. Leave out for the sample models and preset. */
  settings?: StudioSettingsPanelProps
  /** Recent clips, newest first. The first one fills the canvas until another is picked. Leave out for sample clips; pass `[]` for none yet. */
  clips?: VideoStudioClip[]
  /** Controlled selection of the clip on the canvas. Pair with `onSelectClip`. */
  selectedClipId?: string
  onSelectClip?: (clip: VideoStudioClip) => void
  onDownload?: (clip: VideoStudioClip) => void
  /** Puts the clip's prompt back in the settings rail. */
  onReuse?: (clip: VideoStudioClip) => void
  /** Names the page for assistive tech. */
  pageTitle?: string
  /** Replaces the canvas's empty state when there are no clips yet. */
  empty?: ReactNode
  className?: string
}

const SAMPLE_NAVIGATION = sampleNavigation("/video")

// The video studio (docs/inventory.md §4): top bar, the settings rail on the
// left with Generate pinned to its foot, and a canvas that shows the latest
// clip large, its prompt and settings under it, and a strip of recent clips.
// Below 1024px the rail stacks above the canvas.
function VideoStudioPage({
  navigation = SAMPLE_NAVIGATION,
  settings = SAMPLE_VIDEO_SETTINGS,
  clips = SAMPLE_CLIPS,
  selectedClipId,
  onSelectClip,
  onDownload,
  onReuse,
  pageTitle = "Video studio",
  empty,
  className,
}: VideoStudioPageProps) {
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined)
  const recentId = useId()
  const selectedId = selectedClipId ?? selectedState
  const current = clips.find((clip) => clip.id === selectedId) ?? clips[0]

  function select(clip: VideoStudioClip) {
    if (selectedClipId === undefined) setSelectedState(clip.id)
    onSelectClip?.(clip)
  }

  return (
    <div data-slot="video-studio-page" className={cn("flex min-h-svh flex-col bg-background text-foreground", className)}>
      <TopNavigation {...navigation} />

      <main className="flex flex-1 flex-col gap-3 p-3 lg:flex-row lg:items-start">
        <h1 className="sr-only">{pageTitle}</h1>

        {/* The rail sticks beside the canvas on wide screens so Generate stays in reach. */}
        <StudioSettingsPanel
          {...settings}
          className={cn(
            "max-w-none lg:sticky lg:top-3 lg:max-h-[calc(100svh-5rem)] lg:min-h-[calc(100svh-5rem)] lg:w-88 lg:shrink-0 lg:overflow-y-auto",
            settings.className
          )}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {current ? (
            <ClipCanvas clip={current} onDownload={onDownload} onReuse={onReuse} />
          ) : (
            (empty ?? (
              <EmptyState
                icon="movie"
                title="Your first clip plays here"
                description="Pick a preset or add a reference image, describe the motion, then press Generate. Finished clips line up underneath so you can compare takes."
                className="min-h-96 flex-1 lg:min-h-[calc(100svh-5rem)]"
              />
            ))
          )}

          {clips.length > 1 ? (
            <section aria-labelledby={recentId} className="flex flex-col gap-2">
              <h2 id={recentId} className="text-title-sm text-foreground">
                Recent clips
              </h2>
              <ul className="flex gap-2 overflow-x-auto pb-1">
                {clips.map((clip) => (
                  <li key={clip.id} className="shrink-0">
                    <ClipThumb clip={clip} selected={clip.id === current?.id} onSelect={() => select(clip)} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  )
}

function ClipCanvas({
  clip,
  onDownload,
  onReuse,
}: {
  clip: VideoStudioClip
  onDownload?: (clip: VideoStudioClip) => void
  onReuse?: (clip: VideoStudioClip) => void
}) {
  const ready = clip.status !== "generating" && Boolean(clip.posterSrc || clip.videoSrc)
  return (
    <article aria-label="Selected clip" className="flex flex-col gap-3">
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-card">
        {!ready ? (
          <>
            <Skeleton className="absolute inset-0 rounded-none" />
            <div className="relative flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Spinner label="Rendering clip" />
              <span aria-hidden="true">Rendering your clip</span>
            </div>
          </>
        ) : clip.videoSrc ? (
          <video
            key={clip.id}
            src={clip.videoSrc}
            poster={clip.posterSrc}
            controls
            playsInline
            aria-label={clip.alt}
            className="size-full object-contain"
          >
            {clip.captionsSrc ? <track kind="captions" src={clip.captionsSrc} default /> : null}
          </video>
        ) : (
          // A plain <img> keeps the block framework-agnostic; swap in next/image in your app if you like.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={clip.posterSrc} alt={clip.alt} className="size-full object-contain" />
        )}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="line-clamp-3 text-sm text-pretty text-foreground">{clip.prompt}</p>
          <dl className="flex flex-wrap items-center gap-1.5 text-xs">
            <dt className="sr-only">Model</dt>
            <dd className="inline-flex h-6 items-center gap-1 rounded-lg bg-chip px-2 font-medium text-chip-foreground">
              <Icon name="movie" className="text-muted-foreground" />
              {clip.model}
            </dd>
            {clip.settings?.length ? <dt className="sr-only">Settings</dt> : null}
            {clip.settings?.map((setting) => (
              <dd key={setting} className="inline-flex h-6 items-center rounded-lg bg-chip px-2 font-medium text-chip-foreground">
                {setting}
              </dd>
            ))}
            <dt className="sr-only">Created</dt>
            <dd className="px-1 text-muted-foreground">{clip.createdAt}</dd>
          </dl>
        </div>
        {ready && (onReuse || onDownload) ? (
          <div className="flex shrink-0 gap-2">
            {onReuse ? (
              <Button variant="glass" size="sm" onClick={() => onReuse(clip)}>
                <Icon name="autorenew" />
                Reuse prompt
              </Button>
            ) : null}
            {onDownload ? (
              <Button variant="ghost" size="sm" onClick={() => onDownload(clip)}>
                <Icon name="download" />
                Download
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}

function ClipThumb({ clip, selected, onSelect }: { clip: VideoStudioClip; selected: boolean; onSelect: () => void }) {
  const ready = clip.status !== "generating" && Boolean(clip.posterSrc)
  return (
    <MediaTile
      aspect="video"
      src={ready ? clip.posterSrc : undefined}
      alt=""
      label={ready ? clip.alt : `Rendering: ${clip.alt}`}
      selected={selected}
      indicator={false}
      onClick={onSelect}
      // Selection is lime, like a checked box. Drawn as an inset overlay above
      // the picture: an outer ring would be clipped by the strip's scroll edge,
      // and a plain inset ring is painted under the image, where nobody sees it.
      className={cn(
        "w-36 focus-visible:ring-3",
        selected && "ring-transparent after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] after:ring-2 after:ring-brand after:ring-inset",
      )}
    >
      {/* A bare ring, not a Spinner: the button's own name already says "Rendering". */}
      <span aria-hidden="true" className="flex size-full items-center justify-center text-muted-foreground">
        <Icon name="progress_activity" className="animate-spin motion-reduce:animate-none" />
      </span>
    </MediaTile>
  )
}

export { VideoStudioPage }
