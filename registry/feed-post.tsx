"use client"

import { useState } from "react"
import { cn } from "@/lib/mantis-cn"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { Toggle } from "@/components/ui/toggle"

export type FeedPostReaction = "like" | "dislike" | null

export interface FeedPostProps {
  author: { name: string; avatarSrc?: string }
  /** When it was posted, written for people: "2d ago", "just now". */
  postedAt: string
  /** The same moment as an ISO date. */
  postedAtDateTime?: string
  /** Optional bold first line. */
  title?: string
  /** The body text. Plain text; line breaks are kept. */
  text?: string
  /** Up to four pictures. One fills the width; two or more sit in a two-column grid. */
  media?: { src: string; alt: string }[]
  /** A small label over the first picture, such as the tool it was made with. */
  mediaLabel?: string
  likes: number
  dislikes?: number
  comments: number
  views?: number
  /** The viewer's reaction when the post loads. Counts already include it. */
  defaultReaction?: FeedPostReaction
  onReactionChange?: (reaction: FeedPostReaction) => void
  /** Opens the comments. Without it, the comment count is plain text. */
  onComment?: () => void
  onShare?: () => void
  /** Whether the viewer follows the author. Leave undefined on the viewer's own posts to hide Follow. */
  defaultFollowing?: boolean
  onFollowChange?: (following: boolean) => void
  onCopyLink?: () => void
  onReport?: () => void
  className?: string
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

// The reference's community post: a card with the author row on top, the
// words, the media, and a quiet row of counts that double as actions.
// Reactions are toggles so their state is announced, not just colored.
function FeedPost({
  author,
  postedAt,
  postedAtDateTime,
  title,
  text,
  media = [],
  mediaLabel,
  likes,
  dislikes,
  comments,
  views,
  defaultReaction = null,
  onReactionChange,
  onComment,
  onShare,
  defaultFollowing,
  onFollowChange,
  onCopyLink,
  onReport,
  className,
}: FeedPostProps) {
  const [reaction, setReaction] = useState<FeedPostReaction>(defaultReaction)
  const [following, setFollowing] = useState(defaultFollowing)

  // Counts arrive including the starting reaction, so shift them only by the change.
  const likeCount = likes + (reaction === "like" ? 1 : 0) - (defaultReaction === "like" ? 1 : 0)
  const dislikeCount = (dislikes ?? 0) + (reaction === "dislike" ? 1 : 0) - (defaultReaction === "dislike" ? 1 : 0)

  function react(next: Exclude<FeedPostReaction, null>, pressed: boolean) {
    const value = pressed ? next : null
    setReaction(value)
    onReactionChange?.(value)
  }

  const initials = author.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
  const shown = media.slice(0, 4)

  return (
    <article
      data-slot="feed-post"
      aria-label={`Post by ${author.name}`}
      className={cn("flex w-full flex-col gap-3 rounded-2xl bg-card p-4", className)}
    >
      <header className="flex items-center gap-2.5">
        <Avatar>
          {author.avatarSrc ? <AvatarImage src={author.avatarSrc} alt="" /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{author.name}</span>
          <time dateTime={postedAtDateTime} className="text-xs text-muted-foreground">
            {postedAt}
          </time>
        </div>
        {following !== undefined ? (
          <Button
            variant={following ? "ghost" : "glass"}
            size="xs"
            onClick={() => {
              setFollowing(!following)
              onFollowChange?.(!following)
            }}
          >
            <Icon name={following ? "check" : "add"} />
            {following ? "Following" : "Follow"}
            <span className="sr-only"> {author.name}</span>
          </Button>
        ) : null}
      </header>

      {title || text ? (
        <div className="flex flex-col gap-1">
          {title ? <h3 className="text-base font-semibold text-foreground">{title}</h3> : null}
          {text ? <p className="text-sm whitespace-pre-line text-pretty text-foreground">{text}</p> : null}
        </div>
      ) : null}

      {shown.length > 0 ? (
        <div className={cn("relative grid gap-1 overflow-hidden rounded-xl", shown.length > 1 && "grid-cols-2")}>
          {shown.map((picture) => (
            // A plain <img> keeps the block framework-agnostic; swap in next/image in your app if you like.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={picture.src}
              src={picture.src}
              alt={picture.alt}
              className={cn("w-full bg-field object-cover", shown.length > 1 ? "aspect-square" : "aspect-video")}
            />
          ))}
          {mediaLabel ? (
            <span className="absolute bottom-2 left-2 rounded-md bg-glass-panel px-2 py-1 text-xs font-medium text-foreground backdrop-blur-glass">
              {mediaLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      <footer className="flex items-center gap-1 text-muted-foreground">
        <Toggle
          variant="ghost"
          size="sm"
          className="px-2 text-muted-foreground data-pressed:text-brand-text"
          pressed={reaction === "like"}
          onPressedChange={(pressed) => react("like", pressed)}
        >
          <Icon name="thumb_up" />
          <span className="sr-only">Like,</span>
          {compact.format(likeCount)}
        </Toggle>
        {dislikes !== undefined ? (
          <Toggle
            variant="ghost"
            size="sm"
            className="px-2 text-muted-foreground data-pressed:text-foreground"
            pressed={reaction === "dislike"}
            onPressedChange={(pressed) => react("dislike", pressed)}
          >
            <Icon name="thumb_down" />
            <span className="sr-only">Dislike,</span>
            {compact.format(dislikeCount)}
          </Toggle>
        ) : null}
        {onComment ? (
          <Button variant="ghost" size="xs" className="rounded-full px-2 text-xs font-semibold text-muted-foreground" onClick={onComment}>
            <Icon name="chat_bubble" />
            <span className="sr-only">Comments,</span>
            {compact.format(comments)}
          </Button>
        ) : (
          <span className="inline-flex h-7 items-center gap-1 px-2 text-xs font-semibold">
            <Icon name="chat_bubble" />
            <span className="sr-only">Comments,</span>
            {compact.format(comments)}
          </span>
        )}
        {onShare ? (
          <Button variant="ghost" size="icon-xs" className="rounded-full text-muted-foreground" aria-label="Share post" onClick={onShare}>
            <Icon name="share" />
          </Button>
        ) : null}

        <div className="ml-auto flex items-center gap-1">
          {views !== undefined ? (
            <span className="inline-flex items-center gap-1 px-1 text-xs font-medium">
              <Icon name="visibility" />
              <span className="sr-only">Views,</span>
              {compact.format(views)}
            </span>
          ) : null}
          {onCopyLink || onReport ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-xs" className="rounded-full text-muted-foreground" />}
                aria-label={`More actions for the post by ${author.name}`}
              >
                <Icon name="more_horiz" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {onCopyLink ? (
                  <DropdownMenuItem onClick={onCopyLink}>
                    <Icon name="content_copy" />
                    Copy link
                  </DropdownMenuItem>
                ) : null}
                {onReport ? (
                  <DropdownMenuItem onClick={onReport}>
                    <Icon name="warning" />
                    Report post
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </footer>
    </article>
  )
}

export { FeedPost }
