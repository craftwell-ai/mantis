"use client"

import { useId, useState, type FormEvent } from "react"
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
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { MediaTile } from "@/components/ui/media-tile"

export interface ProjectCardProps {
  /** The project's name, shown under the thumbnail and in the dialogs. */
  name: string
  /** When it was last edited, already written for people: "2 hours ago", "Sep 30". */
  lastEdited: string
  /** The same moment as an ISO date, so assistive tech and crawlers get an exact time. */
  lastEditedDateTime?: string
  /** A still from the project. Without one, the card shows an empty image slot. */
  thumbnail?: { src: string; alt?: string }
  /** Where the project opens. The name becomes a link that covers the whole card. */
  href?: string
  /** Called with the trimmed new name. The menu hides Rename when this is missing. */
  onRename?: (name: string) => void
  /** The menu hides Duplicate when this is missing. */
  onDuplicate?: () => void
  /** Runs only after the person confirms. The menu hides Delete when this is missing. */
  onDelete?: () => void
  /** Replaces the delete dialog's default sentence when you can say exactly what goes. */
  deleteDescription?: string
  className?: string
}

function ProjectCard({
  name,
  lastEdited,
  lastEditedDateTime,
  thumbnail,
  href,
  onRename,
  onDuplicate,
  onDelete,
  deleteDescription = "Its generations, uploads and share links are removed for everyone on the project. This cannot be undone.",
  className,
}: ProjectCardProps) {
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const hasMenu = Boolean(onRename || onDuplicate || onDelete)

  return (
    <Card
      variant="media"
      size="sm"
      data-slot="project-card"
      // group/media-card: the thumbnail dims with the card when the stretched link is hovered.
      className={cn("relative gap-3 py-0", href && "group/media-card", className)}
    >
      <MediaTile
        aspect="video"
        radius="2xl"
        src={thumbnail?.src}
        // An empty alt is right when the name under it already says what the still shows.
        alt={thumbnail?.alt ?? ""}
      >
        <div className="flex size-full items-center justify-center text-3xl text-muted-foreground">
          <Icon name="image" />
        </div>
      </MediaTile>

      <div className="flex items-start gap-2 px-1">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate text-sm font-medium text-card-foreground">
            {href ? (
              // The link's ::after stretches over the whole card, so the thumbnail opens the project too.
              <a
                href={href}
                className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
              >
                {name}
              </a>
            ) : (
              name
            )}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            Edited <time dateTime={lastEditedDateTime}>{lastEdited}</time>
          </p>
        </div>

        {hasMenu ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              // z-10 lifts the trigger above the stretched link so it stays clickable.
              render={<Button variant="ghost" size="icon-sm" className="relative z-10 -mt-1 -mr-1" />}
              aria-label={`More actions for ${name}`}
            >
              <Icon name="more_vert" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {onRename ? (
                <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                  <Icon name="edit" />
                  Rename
                </DropdownMenuItem>
              ) : null}
              {onDuplicate ? (
                <DropdownMenuItem onClick={onDuplicate}>
                  <Icon name="content_copy" />
                  Duplicate
                </DropdownMenuItem>
              ) : null}
              {onDelete ? (
                <>
                  {onRename || onDuplicate ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                    <Icon name="delete" />
                    Delete
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {onRename ? (
        <RenameProjectDialog
          open={renameOpen}
          onOpenChange={setRenameOpen}
          currentName={name}
          onRename={onRename}
        />
      ) : null}

      {onDelete ? (
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
              <AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="glass">Keep project</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  onDelete()
                  setDeleteOpen(false)
                }}
              >
                Delete project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </Card>
  )
}

function RenameProjectDialog({
  open,
  onOpenChange,
  currentName,
  onRename,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentName: string
  onRename: (name: string) => void
}) {
  const inputId = useId()
  const errorId = useId()
  const [draft, setDraft] = useState(currentName)
  const [error, setError] = useState<string | null>(null)

  // Start from the saved name each time the dialog opens, not whatever was
  // typed and abandoned last time. Adjusting state during render (rather than
  // in an effect) avoids a flash of the stale draft.
  const [lastOpen, setLastOpen] = useState(open)
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      setDraft(currentName)
      setError(null)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) {
      setError("Give the project a name so you can find it later.")
      return
    }
    if (trimmed !== currentName) onRename(trimmed)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              The new name shows in your library and on any share links you have sent.
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor={inputId}>Project name</FieldLabel>
            <Input
              id={inputId}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value)
                if (error) setError(null)
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              maxLength={80}
              autoComplete="off"
            />
            {error ? <FieldError id={errorId}>{error}</FieldError> : null}
          </Field>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">Save name</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { ProjectCard }
