"use client"

import { useRef, useState, type KeyboardEvent } from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Icon } from "@/components/ui/icon"

export interface LightboxItem {
  id: string
  src: string
  /** Describes what the picture shows. */
  alt: string
  /** The full prompt; the inspector shows all of it and copies it. */
  prompt: string
  author: { name: string; avatarSrc?: string }
  /** Rows for the details list, in order: model, size, seed, date… Values are already formatted. */
  info: { label: string; value: string }[]
}

export interface LightboxInspectorProps {
  items: LightboxItem[]
  /** Which item is showing. Controlled, so the grid that opened the lightbox can follow along. */
  index: number
  onIndexChange: (index: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The one lime action: generate again from this prompt and settings. */
  onRecreate?: (item: LightboxItem) => void
  /** Credits Recreate spends, shown on the button. */
  recreateCost?: number
  onDownload?: (item: LightboxItem) => void
  onShare?: (item: LightboxItem) => void
  onUpscale?: (item: LightboxItem) => void
  /** Runs only after the person confirms. */
  onDelete?: (item: LightboxItem) => void
  className?: string
}

// The reference's viewer: the picture centered on a blurred, darkened copy of
// itself, with an inspector card pinned to the right. The inspector reads top
// to bottom: who made it, what was asked, the settings, then what to do next,
// with Recreate as the one lime action above a grid of quieter ones.
function LightboxInspector({
  items,
  index,
  onIndexChange,
  open,
  onOpenChange,
  onRecreate,
  recreateCost,
  onDownload,
  onShare,
  onUpscale,
  onDelete,
  className,
}: LightboxInspectorProps) {
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const current = Math.min(Math.max(index, 0), Math.max(items.length - 1, 0))
  const item = items[current]
  const hasPrevious = current > 0
  const hasNext = current < items.length - 1

  // Reset the "Copied" confirmation whenever another item shows.
  const [copiedFor, setCopiedFor] = useState(item?.id)
  if (item?.id !== copiedFor) {
    setCopiedFor(item?.id)
    setCopied(false)
  }

  if (!item) return null

  function go(step: -1 | 1) {
    const next = current + step
    if (next >= 0 && next < items.length) onIndexChange(next)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Leave arrow keys alone inside buttons that use them and in any text field.
    const target = event.target as HTMLElement
    if (target.closest("input, textarea, [contenteditable='true']")) return
    if (event.key === "ArrowLeft") go(-1)
    if (event.key === "ArrowRight") go(1)
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(item.prompt)
      setCopied(true)
    } catch {
      // Clipboard access can be refused (permissions, insecure origin); the prompt stays selectable.
      setCopied(false)
    }
  }

  const initials = item.author.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        // Start on Close rather than Previous, which is disabled on the first item.
        initialFocus={closeRef}
        onKeyDown={handleKeyDown}
        className={cn(
          "inset-0 top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-2 overflow-y-auto rounded-none border-0 bg-transparent p-2 sm:max-w-none lg:flex-row lg:overflow-hidden",
          className
        )}
      >
        {/* The picture again, blurred, so the stage takes on its colors. Decorative. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.src} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 size-full scale-110 object-cover opacity-30 blur-3xl" />

        <div className="relative flex min-h-96 flex-1 items-center justify-center px-14 py-4 lg:min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.src} alt={item.alt} className="max-h-full max-w-full rounded-2xl object-contain" />

          <p className="absolute top-2 left-2 rounded-full bg-glass px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-glass">
            {current + 1} of {items.length}
          </p>
          <Button
            variant="glass"
            size="icon-lg"
            className="absolute left-2 rounded-full backdrop-blur-glass"
            aria-label="Previous"
            disabled={!hasPrevious}
            // Keeps focus on the button at the ends, so arrow keys keep working inside the dialog.
            focusableWhenDisabled
            onClick={() => go(-1)}
          >
            <Icon name="chevron_left" />
          </Button>
          <Button
            variant="glass"
            size="icon-lg"
            className="absolute right-2 rounded-full backdrop-blur-glass"
            aria-label="Next"
            disabled={!hasNext}
            // Keeps focus on the button at the ends, so arrow keys keep working inside the dialog.
            focusableWhenDisabled
            onClick={() => go(1)}
          >
            <Icon name="chevron_right" />
          </Button>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-3 rounded-2xl bg-card p-3 lg:w-96 lg:overflow-y-auto">
          <div className="flex items-center gap-2.5">
            <Avatar>
              {item.author.avatarSrc ? <AvatarImage src={item.author.avatarSrc} alt="" /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-foreground">{item.author.name}</span>
              <span className="text-xs text-muted-foreground">Creator</span>
            </div>
            <DialogClose ref={closeRef} render={<Button variant="ghost" size="icon-sm" aria-label="Close" />}>
              <Icon name="close" />
            </DialogClose>
          </div>

          <DialogTitle className="sr-only">
            Image {current + 1} of {items.length} by {item.author.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            The prompt, settings and actions for this image. Use the left and right arrow keys to move between images.
          </DialogDescription>

          <section aria-labelledby={`${item.id}-prompt`} className="flex flex-col gap-2 rounded-xl bg-glass p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 id={`${item.id}-prompt`} className="text-xs font-medium text-muted-foreground uppercase">
                Prompt
              </h3>
              <Button variant="ghost" size="xs" onClick={copyPrompt}>
                <Icon name={copied ? "check" : "content_copy"} />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="max-h-40 overflow-y-auto text-sm text-pretty text-foreground select-text">{item.prompt}</p>
            <span className="sr-only" aria-live="polite">
              {copied ? "Prompt copied" : ""}
            </span>
          </section>

          <section aria-labelledby={`${item.id}-details`} className="flex flex-col gap-1 rounded-xl bg-glass p-3">
            <h3 id={`${item.id}-details`} className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase">
              <Icon name="info" />
              Details
            </h3>
            <dl className="flex flex-col">
              {item.info.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 py-1.5 text-sm">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="truncate text-right font-medium text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="mt-auto flex flex-col gap-2 pt-2">
            {onRecreate ? (
              <Button variant="brand" depth="glossy" size="lg" className="w-full" onClick={() => onRecreate(item)}>
                <Icon name="autorenew" />
                Recreate
                {recreateCost !== undefined ? (
                  <span className="inline-flex items-center gap-0.5">
                    <Icon name="star_shine-fill" />
                    {recreateCost}
                    <span className="sr-only">credits</span>
                  </span>
                ) : null}
              </Button>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              {onDownload ? (
                <Button variant="glass" onClick={() => onDownload(item)}>
                  <Icon name="download" />
                  Download
                </Button>
              ) : null}
              {onShare ? (
                <Button variant="glass" onClick={() => onShare(item)}>
                  <Icon name="share" />
                  Share
                </Button>
              ) : null}
              {onUpscale ? (
                <Button variant="glass" onClick={() => onUpscale(item)}>
                  <Icon name="high_res" />
                  Upscale
                </Button>
              ) : null}
              {onDelete ? (
                <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                  <Icon name="delete" />
                  Delete
                </Button>
              ) : null}
            </div>
          </div>
        </aside>

        {onDelete ? (
          <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this image?</AlertDialogTitle>
                <AlertDialogDescription>
                  It leaves your history and any boards it was added to. Copies you already downloaded are not affected. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="glass">Keep image</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    onDelete(item)
                    setConfirmDelete(false)
                  }}
                >
                  Delete image
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export { LightboxInspector }
