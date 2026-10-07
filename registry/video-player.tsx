"use client"

import * as React from "react"
import {
  MediaCaptionsButton,
  MediaControlBar,
  MediaController,
  MediaFullscreenButton,
  MediaLoadingIndicator,
  MediaMuteButton,
  MediaPlayButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react"

import { cn } from "@/lib/mantis-cn"
import { Icon, type IconName } from "@/components/ui/icon"

export interface VideoPlayerProps extends Omit<React.ComponentProps<"div">, "children" | "title"> {
  /** The clip to play. */
  src: string
  /** Names the clip for screen readers, such as "Ferry leaving the pier". */
  title: string
  /** A still shown before the clip plays. */
  poster?: string
  /** A captions file (WebVTT). The captions button appears when this is set. */
  captionsSrc?: string
  /** The captions' language as a code, such as "en". */
  captionsLanguage?: string
  /** Frame shape: video (16:9), square or portrait (9:16). */
  aspect?: "video" | "square" | "portrait"
  /** Start again from the beginning when the clip ends, for short generated loops. */
  loop?: boolean
  /** Start with the sound off. */
  muted?: boolean
  /** Play as soon as the clip is ready. Browsers only allow this with `muted`. */
  autoPlay?: boolean
}

const ASPECT = { video: "aspect-video", square: "aspect-square", portrait: "aspect-9/16" }

// Media Chrome draws its controls inside its own elements, so their look is set through its CSS
// variables, each pointed at a Mantis token: white controls on a dark scrim, a lime played bar.
const theme = cn(
  "[--media-primary-color:var(--foreground)] [--media-secondary-color:transparent] [--media-icon-color:var(--foreground)]",
  "[--media-control-background:transparent] [--media-control-hover-background:var(--glass-hover)]",
  "[--media-range-bar-color:var(--brand)] [--media-range-track-background:var(--glass-border)] [--media-time-range-buffered-color:var(--glass-hover)]",
  "[--media-range-thumb-background:var(--primary)] [--media-range-track-height:calc(var(--spacing)*1)] [--media-range-track-border-radius:var(--radius-full)]",
  "[--media-font-family:var(--font-sans)] [--media-font-size:var(--text-xs)] [--media-font-weight:500]",
  "[--media-focus-box-shadow:inset_0_0_0_2px_var(--ring)] [--media-button-icon-height:calc(var(--spacing)*5)] [--media-control-padding:calc(var(--spacing)*2)]",
  "[--media-tooltip-background:var(--tooltip)] [--media-tooltip-border:1px_solid_var(--tooltip-border)] [--media-tooltip-border-radius:var(--radius-md)]",
  "[--media-loading-indicator-icon-height:calc(var(--spacing)*12)] [--media-background-color:var(--background)]",
)

// Tailwind's reset removes padding from every element, Media Chrome's included, so each control's
// size is set here: 36px square, which clears the 24px minimum target size.
const control = "size-9 rounded-lg p-2"

// Every control's picture is a Mantis icon dropped into the slot Media Chrome leaves for it.
function Glyph({ slot, name }: { slot: string; name: IconName }) {
  return (
    <span slot={slot} className="flex">
      <Icon name={name} className="size-5" />
    </span>
  )
}

// A video player in Mantis's look: play and pause, a lime scrub bar, time, sound, captions and
// fullscreen, over a clip that fills a rounded frame. The playback behavior (buffering, keyboard
// shortcuts, fullscreen, captions) is Media Chrome's; the look and the icons are Mantis's.
function VideoPlayer({
  src,
  title,
  poster,
  captionsSrc,
  captionsLanguage = "en",
  aspect = "video",
  loop,
  muted,
  autoPlay,
  className,
  ...props
}: VideoPlayerProps) {
  const trackRef = React.useRef<HTMLTrackElement>(null)

  // Captions sit on the bottom line by default, which is under the control bar. Once the captions
  // file has loaded, each line is lifted clear of it.
  React.useEffect(() => {
    const element = trackRef.current
    if (!element) return
    const lift = () => {
      for (const cue of Array.from(element.track.cues ?? [])) (cue as VTTCue).line = -4
    }
    lift()
    element.addEventListener("load", lift)
    element.track.addEventListener("cuechange", lift)
    return () => {
      element.removeEventListener("load", lift)
      element.track.removeEventListener("cuechange", lift)
    }
  }, [captionsSrc])

  return (
    <div
      data-slot="video-player"
      // Media Chrome names its own region "video player"; the group around it carries the clip's name.
      role="group"
      aria-label={title}
      className={cn("@container overflow-hidden rounded-2xl bg-background", ASPECT[aspect], className)}
      {...props}
    >
      <MediaController className={cn("block size-full", theme)}>
        <video
          slot="media"
          src={src}
          poster={poster}
          loop={loop}
          muted={muted}
          autoPlay={autoPlay}
          playsInline
          preload="metadata"
          // Lets the captions file load from another address, such as a media server.
          crossOrigin="anonymous"
          className="size-full object-contain"
        >
          {captionsSrc ? (
            <track
              ref={trackRef}
              kind="captions"
              src={captionsSrc}
              srcLang={captionsLanguage}
              label="Captions"
              default
            />
          ) : null}
        </video>
        <MediaLoadingIndicator slot="centered-chrome" noAutohide />
        <MediaControlBar className="w-full items-center gap-0.5 bg-overlay px-2 py-1">
          <MediaPlayButton className={control}>
            <Glyph slot="play" name="play_arrow" />
            <Glyph slot="pause" name="pause" />
          </MediaPlayButton>
          <MediaTimeDisplay showDuration className="px-2 tabular-nums" />
          <MediaTimeRange className="h-9 flex-1 px-2" />
          <MediaMuteButton className={control}>
            <Glyph slot="high" name="volume_up" />
            <Glyph slot="medium" name="volume_down" />
            <Glyph slot="low" name="volume_down" />
            <Glyph slot="off" name="volume_off" />
          </MediaMuteButton>
          <MediaVolumeRange className="hidden h-9 w-20 px-2 @md:inline-flex" />
          {captionsSrc ? (
            // An on/off control, so it is announced as a switch; a plain button may not carry a checked state.
            <MediaCaptionsButton
              className={control}
              // Media Chrome sets role="button" itself when the element connects, so the role is corrected after.
              ref={(element: HTMLElement | null) => element?.setAttribute("role", "switch")}
            >
              <Glyph slot="on" name="closed_caption" />
              <Glyph slot="off" name="closed_caption_disabled" />
            </MediaCaptionsButton>
          ) : null}
          <MediaFullscreenButton className={control}>
            <Glyph slot="enter" name="fullscreen" />
            <Glyph slot="exit" name="fullscreen_exit" />
          </MediaFullscreenButton>
        </MediaControlBar>
      </MediaController>
    </div>
  )
}

export { VideoPlayer }
