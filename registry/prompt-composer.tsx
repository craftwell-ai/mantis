"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Stepper } from "@/components/ui/stepper"
import { Textarea } from "@/components/ui/textarea"

export type PromptComposerModel = {
  value: string
  label: string
  creditsPerImage: number
}

export type PromptComposerAspectRatio = {
  value: string
  label: string
}

export type PromptComposerRequest = {
  prompt: string
  model: string
  aspectRatio: string
  count: number
  credits: number
}

// Ordered wide to tall, so the list reads like the shapes it produces.
export const DEFAULT_ASPECT_RATIOS: PromptComposerAspectRatio[] = [
  { value: "16:9", label: "16:9" },
  { value: "3:2", label: "3:2" },
  { value: "4:3", label: "4:3" },
  { value: "1:1", label: "1:1" },
  { value: "3:4", label: "3:4" },
  { value: "2:3", label: "2:3" },
  { value: "9:16", label: "9:16" },
]

export type PromptComposerProps = Omit<React.ComponentProps<"form">, "onSubmit" | "children"> & {
  models: PromptComposerModel[]
  aspectRatios?: PromptComposerAspectRatio[]
  defaultModel?: string
  defaultAspectRatio?: string
  defaultCount?: number
  maxCount?: number
  defaultPrompt?: string
  placeholder?: string
  /** The person's remaining credits. When the cost is higher, Generate is disabled and says why. */
  creditBalance?: number
  /** True while a request is running: Generate shows a spinner and cannot be pressed again. */
  generating?: boolean
  onGenerate?: (request: PromptComposerRequest) => void
}

// The image composer: prompt, model chip, aspect-ratio chip, batch stepper and
// the one lime Generate button carrying the live credit cost (DESIGN.md › Composer).
export function PromptComposer({
  models,
  aspectRatios = DEFAULT_ASPECT_RATIOS,
  defaultModel,
  defaultAspectRatio = "1:1",
  defaultCount = 1,
  maxCount = 4,
  defaultPrompt = "",
  placeholder = "Describe the image you want: subject, setting, light and mood",
  creditBalance,
  generating = false,
  onGenerate,
  className,
  ...props
}: PromptComposerProps) {
  const [prompt, setPrompt] = React.useState(defaultPrompt)
  const [model, setModel] = React.useState(defaultModel ?? models[0]?.value ?? "")
  const [aspectRatio, setAspectRatio] = React.useState(defaultAspectRatio)
  const [count, setCount] = React.useState(defaultCount)
  const noticeId = React.useId()

  const selectedModel = models.find((entry) => entry.value === model)
  const credits = (selectedModel?.creditsPerImage ?? 0) * count
  const notEnoughCredits = creditBalance !== undefined && credits > creditBalance
  const canGenerate = prompt.trim().length > 0 && !!selectedModel && !notEnoughCredits && !generating

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canGenerate) return
    onGenerate?.({ prompt: prompt.trim(), model, aspectRatio, count, credits })
  }

  return (
    <form
      data-slot="prompt-composer"
      aria-label="Image prompt"
      onSubmit={submit}
      className={cn("flex flex-col gap-3 rounded-2xl border border-separator bg-card p-4 text-card-foreground", className)}
      {...props}
    >
      <Textarea
        variant="prompt"
        aria-label="Prompt"
        placeholder={placeholder}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={(event) => {
          // Cmd/Ctrl+Enter generates without leaving the keyboard; plain Enter keeps adding lines.
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault()
            event.currentTarget.form?.requestSubmit()
          }
        }}
        className="max-h-60"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Select
          items={models.map((entry) => ({ value: entry.value, label: entry.label }))}
          value={model}
          onValueChange={(next) => next && setModel(next)}
        >
          <SelectTrigger aria-label="Model">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="start" className="w-auto">
            <SelectGroup>
              <SelectLabel>Model</SelectLabel>
              {models.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                  <span className="ml-auto pl-4 text-xs text-muted-foreground">
                    {entry.creditsPerImage} {entry.creditsPerImage === 1 ? "credit" : "credits"} per image
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select items={aspectRatios} value={aspectRatio} onValueChange={(next) => next && setAspectRatio(next)}>
          <SelectTrigger aria-label="Aspect ratio">
            <Icon name="image" className="size-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="start">
            <SelectGroup>
              <SelectLabel>Aspect ratio</SelectLabel>
              {aspectRatios.map((ratio) => (
                <SelectItem key={ratio.value} value={ratio.value}>
                  {ratio.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Stepper label="number of images" value={count} min={1} max={maxCount} onValueChange={setCount} />
        <Button
          type="submit"
          variant="brand"
          depth="glossy"
          size="lg"
          disabled={!canGenerate}
          aria-describedby={notEnoughCredits ? noticeId : undefined}
          className="ml-auto min-w-32"
        >
          {generating ? (
            <>
              <Spinner label="Generating images" />
              Generating
            </>
          ) : (
            <>
              Generate
              <span className="inline-flex items-center gap-0.5 font-medium tabular-nums">
                <Icon name="star_shine-fill" className="size-3.5" />
                {credits}
                <span className="sr-only">{credits === 1 ? "credit" : "credits"}</span>
              </span>
            </>
          )}
        </Button>
      </div>
      {notEnoughCredits ? (
        <p id={noticeId} className="text-xs text-muted-foreground">
          This needs {credits} credits and you have {creditBalance}. Lower the number of images, pick a lighter model or top up.
        </p>
      ) : null}
    </form>
  )
}
