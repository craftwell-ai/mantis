"use client"

import * as React from "react"
import { useDropzone, type Accept, type FileRejection } from "react-dropzone"

import { cn } from "@/lib/mantis-cn"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Progress } from "@/components/ui/progress"

export interface UploadDropzoneProps extends Omit<React.ComponentProps<"div">, "title" | "onDrop"> {
  /** The line inside the drop area. */
  title?: string
  /** What is accepted, in words, such as "PNG, JPG or WebP, up to 20 MB each". */
  hint?: string
  /** Accepted types, as a map of MIME type to extensions: `{ "image/*": [".png", ".jpg"] }`. */
  accept?: Accept
  /** The largest file allowed, in bytes. */
  maxSize?: number
  /** The most files the list may hold. */
  maxFiles?: number
  /** Set to false to take one file; a new one replaces it. */
  multiple?: boolean
  /** Files already in the list when it first shows. */
  defaultFiles?: File[]
  /** Called with the whole list each time a file is added or removed. Start your upload here. */
  onFilesChange?: (files: File[]) => void
  /** Upload progress from 0 to 100, keyed by file name. A file at 100 reads as uploaded. */
  progress?: Record<string, number>
  /** Names the file picker for screen readers. */
  label?: string
}

const keyOf = (file: File) => `${file.name}-${file.size}-${file.lastModified}`

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

// A small preview for pictures; other files get an icon, since the browser cannot draw them.
function Thumb({ file }: { file: File }) {
  const [url, setUrl] = React.useState<string>()
  const isImage = file.type.startsWith("image/")
  React.useEffect(() => {
    if (!isImage) return
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    // The browser holds the file in memory until its preview address is released.
    return () => URL.revokeObjectURL(objectUrl)
  }, [file, isImage])
  return (
    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-glass text-foreground">
      {url ? (
        // A damaged or unreadable picture falls back to the icon instead of a broken-image mark.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="size-full object-cover" onError={() => setUrl(undefined)} />
      ) : (
        <Icon name={isImage ? "image" : file.type.startsWith("video/") ? "movie" : file.type.startsWith("audio/") ? "music_note" : "folder"} className="size-5" />
      )}
    </span>
  )
}

// A drop area for adding files: drag them in, paste them, or browse. It checks type and size, lists what
// was added with a way to remove each, and says in words why a file was turned away. Sending the files
// anywhere is the app's job. The dragging and checking is react-dropzone; the look is Mantis's.
function UploadDropzone({
  title = "Drop files here",
  hint,
  accept,
  maxSize,
  maxFiles,
  multiple = true,
  defaultFiles = [],
  onFilesChange,
  progress,
  label = "Upload files",
  className,
  ...props
}: UploadDropzoneProps) {
  const [files, setFiles] = React.useState<File[]>(defaultFiles)
  const [problems, setProblems] = React.useState<string[]>([])
  const limit = multiple ? maxFiles : 1
  const isFull = multiple && limit !== undefined && files.length >= limit

  function explain({ file, errors }: FileRejection) {
    const code = errors[0]?.code
    if (code === "file-invalid-type") return `“${file.name}” is not an accepted file type.`
    if (code === "file-too-large" && maxSize) return `“${file.name}” is ${formatBytes(file.size)}. The limit is ${formatBytes(maxSize)}.`
    if (code === "too-many-files") return "Add one file at a time."
    return errors[0]?.message ?? `“${file.name}” could not be added.`
  }

  function update(next: File[]) {
    setFiles(next)
    onFilesChange?.(next)
  }

  // The list's own limit is counted here, not by the library: the library turns away the whole drop
  // when it is one file over, and keeping the ones that fit is kinder.
  function onDrop(accepted: File[], rejected: FileRejection[]) {
    const turnedAway = [...new Set(rejected.map(explain))]
    const next = multiple ? [...files] : []
    for (const file of accepted) {
      if (next.some((existing) => keyOf(existing) === keyOf(file))) continue
      if (limit !== undefined && next.length >= limit) {
        turnedAway.push(`“${file.name}” was left out. You can add up to ${limit} files.`)
        continue
      }
      next.push(file)
    }
    setProblems(turnedAway)
    if (accepted.length) update(next)
  }

  // noKeyboard: the Browse button is the keyboard's way in, so the area itself is not a second tab stop.
  // useFsAccessApi off: every browser then goes through the same plain file input.
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({ accept, maxSize, multiple, onDrop, disabled: isFull, noKeyboard: true, useFsAccessApi: false })

  return (
    <div data-slot="upload-dropzone" className={cn("flex flex-col gap-3", className)} {...props}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-glass-border px-6 py-10 text-center transition-colors duration-(--duration-normal)",
          !isFull && "cursor-pointer hover:bg-glass",
          isDragActive && "border-brand bg-brand/10",
          isDragReject && "border-destructive bg-destructive/10"
        )}
      >
        <input {...getInputProps({ "aria-label": label })} />
        <span className="flex size-11 items-center justify-center rounded-full bg-glass text-foreground">
          <Icon name={isFull ? "check" : "upload"} className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {isFull ? `All ${limit} files added` : isDragReject ? "Some of these cannot be added" : isDragActive ? "Drop to add" : title}
          </p>
          <p className={cn("text-xs", isDragActive ? "text-foreground" : "text-muted-foreground")}>{isFull ? "Remove one to add another." : hint}</p>
        </div>
        {/* No handler of its own: the click reaches the drop area, which opens the file picker. */}
        {isFull ? null : (
          <Button type="button" variant="secondary" size="sm">
            Browse files
          </Button>
        )}
      </div>

      <div role="alert" className="flex flex-col gap-1 empty:hidden">
        {problems.map((problem) => (
          <p key={problem} className="flex items-start gap-1.5 text-xs text-destructive">
            <Icon name="error" className="mt-px size-3.5 shrink-0" />
            {problem}
          </p>
        ))}
      </div>

      {files.length ? (
        <ul aria-label="Added files" className="flex flex-col gap-2">
          {files.map((file) => {
            const percent = progress?.[file.name]
            const isUploading = percent !== undefined && percent < 100
            return (
              <li key={keyOf(file)} className="flex items-center gap-3 rounded-xl border border-glass-border p-2">
                <Thumb file={file} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatBytes(file.size)}
                    {isUploading ? ` · Uploading ${Math.round(percent)}%` : percent !== undefined ? " · Uploaded" : null}
                  </p>
                  {isUploading ? <Progress value={percent} aria-label={`Uploading ${file.name}`} /> : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => {
                    setProblems([])
                    update(files.filter((existing) => existing !== file))
                  }}
                >
                  <Icon name="close" />
                </Button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export { UploadDropzone }
