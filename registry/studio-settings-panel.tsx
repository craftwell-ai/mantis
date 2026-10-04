"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import { MediaTile } from "@/components/ui/media-tile"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
// Relative on purpose: shadcn installs both blocks side by side and leaves relative imports alone.
import { ModelPicker, type ModelPickerModel } from "./model-picker"

export type StudioModel = ModelPickerModel & {
  /** Credits one second of video costs at standard quality. */
  creditsPerSecond: number
}

export type StudioPreset = {
  title: string
  /** One line under the title, such as the look or the camera move it applies. */
  description?: string
  image: string
  imageAlt: string
}

export type StudioReference = {
  id: string
  src: string
  alt: string
}

export type StudioOption = { value: string; label: string }

export type StudioQuality = StudioOption & {
  /** Multiplies the cost: 1 for standard, more for sharper renders. */
  costMultiplier: number
}

export type StudioRequest = {
  preset?: string
  references: string[]
  prompt: string
  model: string
  duration: string
  aspectRatio: string
  quality: string
  bitrate: number
  credits: number
}

export const DEFAULT_DURATIONS: StudioOption[] = [
  { value: "3", label: "3s" },
  { value: "5", label: "5s" },
  { value: "8", label: "8s" },
  { value: "10", label: "10s" },
]

// Ordered wide to tall, like the composer's list.
export const DEFAULT_STUDIO_ASPECTS: StudioOption[] = [
  { value: "16:9", label: "16:9" },
  { value: "4:3", label: "4:3" },
  { value: "1:1", label: "1:1" },
  { value: "3:4", label: "3:4" },
  { value: "9:16", label: "9:16" },
]

export const DEFAULT_QUALITIES: StudioQuality[] = [
  { value: "draft", label: "Draft", costMultiplier: 0.5 },
  { value: "standard", label: "720p", costMultiplier: 1 },
  { value: "high", label: "1080p", costMultiplier: 2 },
]

export type StudioSettingsPanelProps = Omit<React.ComponentProps<"form">, "onSubmit" | "children"> & {
  models: StudioModel[]
  preset?: StudioPreset
  /** Opens the preset gallery; the preset card shows a Change button when set. */
  onChangePreset?: () => void
  references?: StudioReference[]
  maxReferences?: number
  /** Opens the add-media panel or a file picker. Hidden once `maxReferences` is reached. */
  onAddReference?: () => void
  onRemoveReference?: (id: string) => void
  defaultPrompt?: string
  defaultModel?: string
  durations?: StudioOption[]
  aspectRatios?: StudioOption[]
  qualities?: StudioQuality[]
  defaultDuration?: string
  defaultAspectRatio?: string
  defaultQuality?: string
  /** Bitrate in Mbps; the slider runs from 4 to 40. */
  defaultBitrate?: number
  creditBalance?: number
  generating?: boolean
  onGenerate?: (request: StudioRequest) => void
}

// The video studio's left rail (docs/inventory.md §3): the chosen preset on top,
// reference images, the prompt, the model row, duration / aspect / quality chips,
// a bitrate slider and, pinned to the bottom, the one lime Generate with its cost.
export function StudioSettingsPanel({
  models,
  preset,
  onChangePreset,
  references = [],
  maxReferences = 4,
  onAddReference,
  onRemoveReference,
  defaultPrompt = "",
  defaultModel,
  durations = DEFAULT_DURATIONS,
  aspectRatios = DEFAULT_STUDIO_ASPECTS,
  qualities = DEFAULT_QUALITIES,
  defaultDuration = "5",
  defaultAspectRatio = "16:9",
  defaultQuality = "standard",
  defaultBitrate = 12,
  creditBalance,
  generating = false,
  onGenerate,
  className,
  ...props
}: StudioSettingsPanelProps) {
  const [prompt, setPrompt] = React.useState(defaultPrompt)
  const [model, setModel] = React.useState(defaultModel ?? models[0]?.value ?? "")
  const [duration, setDuration] = React.useState(defaultDuration)
  const [aspectRatio, setAspectRatio] = React.useState(defaultAspectRatio)
  const [quality, setQuality] = React.useState(defaultQuality)
  const [bitrate, setBitrate] = React.useState(defaultBitrate)
  const promptId = React.useId()
  const referencesId = React.useId()
  const bitrateId = React.useId()
  const noticeId = React.useId()

  const selectedModel = models.find((entry) => entry.value === model)
  const multiplier = qualities.find((entry) => entry.value === quality)?.costMultiplier ?? 1
  const credits = Math.ceil((selectedModel?.creditsPerSecond ?? 0) * Number(duration) * multiplier)
  const notEnoughCredits = creditBalance !== undefined && credits > creditBalance
  // A reference image alone is enough to animate, so Generate needs a prompt or a reference.
  const hasInput = prompt.trim().length > 0 || references.length > 0
  const canGenerate = hasInput && !!selectedModel && !notEnoughCredits && !generating

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canGenerate) return
    onGenerate?.({
      preset: preset?.title,
      references: references.map((reference) => reference.id),
      prompt: prompt.trim(),
      model,
      duration,
      aspectRatio,
      quality,
      bitrate,
      credits,
    })
  }

  return (
    <form
      data-slot="studio-settings-panel"
      aria-label="Video settings"
      onSubmit={submit}
      className={cn("flex w-full max-w-88 flex-col gap-3 rounded-2xl bg-card p-3 text-card-foreground", className)}
      {...props}
    >
      {preset ? (
        <MediaTile
          aspect="auto"
          className="h-32"
          src={preset.image}
          alt={preset.imageAlt}
          title={preset.title}
          description={preset.description}
          actionsVisible
          actions={
            onChangePreset ? (
              <Button
                type="button"
                variant="glass"
                size="xs"
                onClick={onChangePreset}
                aria-label={`Change preset, ${preset.title} selected`}
                className="backdrop-blur-glass"
              >
                <Icon name="edit" />
                Change
              </Button>
            ) : null
          }
        />
      ) : null}

      <section aria-labelledby={referencesId} className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p id={referencesId} className="text-xs font-medium text-muted-foreground">
            References
          </p>
          <span className="text-xs text-muted-foreground tabular-nums">
            {references.length}/{maxReferences}
          </span>
        </div>
        {references.length === 0 ? (
          <button
            type="button"
            onClick={onAddReference}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-glass-border px-4 py-5 text-center transition-[filter,background-color] duration-(--duration-normal) outline-none hover:bg-glass focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-glass text-foreground">
              <Icon name="add" />
            </span>
            <span className="text-sm font-medium text-foreground">Add reference images</span>
            <span className="text-xs text-muted-foreground">Up to {maxReferences}. Faces, products or a first frame.</span>
          </button>
        ) : (
          <ul className="grid grid-cols-4 gap-2">
            {references.map((reference) => (
              <li key={reference.id}>
                <MediaTile
                  src={reference.src}
                  alt={reference.alt}
                  radius="lg"
                  inset="xs"
                  actionsVisible
                  actions={
                    onRemoveReference ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon-xs"
                        aria-label={`Remove ${reference.alt}`}
                        onClick={() => onRemoveReference(reference.id)}
                        className="rounded-full"
                      >
                        <Icon name="close" />
                      </Button>
                    ) : null
                  }
                />
              </li>
            ))}
            {references.length < maxReferences ? (
              <li className="aspect-square">
                <button
                  type="button"
                  onClick={onAddReference}
                  aria-label="Add reference image"
                  className="flex size-full items-center justify-center rounded-lg border border-dashed border-glass-border text-muted-foreground transition-colors duration-(--duration-normal) outline-none hover:bg-glass hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Icon name="add" />
                </button>
              </li>
            ) : null}
          </ul>
        )}
      </section>

      <div className="flex flex-col gap-2">
        <Label htmlFor={promptId} className="text-xs text-muted-foreground">
          Prompt
        </Label>
        <Textarea
          id={promptId}
          placeholder="Describe the motion: what moves, how the camera travels, the mood"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="max-h-40"
        />
      </div>

      <ModelPicker trigger="row" models={models} value={model} onValueChange={setModel} />

      <div className="grid grid-cols-3 gap-2">
        <Select items={durations} value={duration} onValueChange={(next) => next && setDuration(next)}>
          <SelectTrigger size="sm" aria-label="Duration" className="w-full">
            <Icon name="schedule" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="start">
            <SelectGroup>
              <SelectLabel>Duration</SelectLabel>
              {durations.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select items={aspectRatios} value={aspectRatio} onValueChange={(next) => next && setAspectRatio(next)}>
          <SelectTrigger size="sm" aria-label="Aspect ratio" className="w-full">
            <Icon name="aspect_ratio" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="start">
            <SelectGroup>
              <SelectLabel>Aspect ratio</SelectLabel>
              {aspectRatios.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select items={qualities} value={quality} onValueChange={(next) => next && setQuality(next)}>
          <SelectTrigger size="sm" aria-label="Quality" className="w-full">
            <Icon name="hd" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="end">
            <SelectGroup>
              <SelectLabel>Quality</SelectLabel>
              {qualities.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                  <span className="ml-auto pl-4 text-xs text-muted-foreground">×{option.costMultiplier} cost</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* The field fill, as in the reference; its grey text is contrast-exempt (owner decision, 2026-10-02). */}
      <div className="flex flex-col gap-2.5 rounded-xl bg-field px-3 py-2.5">
        <div className="flex items-center justify-between">
          <span id={bitrateId} data-contrast-exempt className="text-xs text-muted-foreground">
            Bitrate
          </span>
          <span className="text-xs font-medium text-foreground tabular-nums">{bitrate} Mbps</span>
        </div>
        <Slider
          aria-labelledby={bitrateId}
          min={4}
          max={40}
          step={2}
          value={bitrate}
          onValueChange={(next) => setBitrate(Array.isArray(next) ? next[0] : next)}
        />
        <div aria-hidden="true" className="flex justify-between text-2xs text-muted-foreground">
          <span data-contrast-exempt>Smaller file</span>
          <span data-contrast-exempt>Sharper detail</span>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-1">
        <Button
          type="submit"
          variant="brand"
          depth="glossy"
          size="xl"
          disabled={!canGenerate}
          aria-describedby={notEnoughCredits ? noticeId : undefined}
          className="w-full"
        >
          {generating ? (
            <>
              <Spinner label="Generating video" />
              Generating
            </>
          ) : (
            <>
              Generate
              <span className="inline-flex items-center gap-0.5 tabular-nums">
                <Icon name="star_shine-fill" className="size-3.5" />
                {credits}
                <span className="sr-only">{credits === 1 ? "credit" : "credits"}</span>
              </span>
            </>
          )}
        </Button>
        {notEnoughCredits ? (
          <p id={noticeId} className="text-center text-xs text-muted-foreground">
            This clip needs {credits} credits and you have {creditBalance}. Shorten it, lower the quality or top up.
          </p>
        ) : null}
      </div>
    </form>
  )
}
