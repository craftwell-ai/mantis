"use client"

import { useId, useState, type FormEvent } from "react"
import { cn } from "@/lib/mantis-cn"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"

export type DigestFrequency = "never" | "daily" | "weekly"

export type NotificationTopic = {
  id: string
  label: string
  description?: string
}

export type NotificationPreferences = {
  // Keyed by topic id; a topic missing from the map counts as off.
  email: Record<string, boolean>
  digest: DigestFrequency
}

export const DEFAULT_NOTIFICATION_TOPICS: NotificationTopic[] = [
  {
    id: "generation-finished",
    label: "A generation finishes",
    description: "Know when a queued image or video is ready, so you can close the tab while it renders.",
  },
  {
    id: "new-comment",
    label: "Someone comments on your work",
    description: "Comments and replies on your published generations and shared projects.",
  },
  {
    id: "product-news",
    label: "Product news",
    description: "New models, features and the occasional workflow tip, about twice a month.",
  },
]

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: { "generation-finished": true, "new-comment": true, "product-news": false },
  digest: "weekly",
}

const DIGEST_OPTIONS: { value: DigestFrequency; label: string }[] = [
  { value: "never", label: "Never" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
]

type SaveStatus = "idle" | "saving" | "saved" | "error"

export type NotificationSettingsProps = {
  topics?: NotificationTopic[]
  defaultValue?: NotificationPreferences
  // Persist the preferences. Throw (or reject) to show the error message.
  onSave?: (preferences: NotificationPreferences) => void | Promise<void>
  className?: string
}

export function NotificationSettings({
  topics = DEFAULT_NOTIFICATION_TOPICS,
  defaultValue = DEFAULT_NOTIFICATION_PREFERENCES,
  onSave,
  className,
}: NotificationSettingsProps) {
  const baseId = useId()
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultValue)
  const [status, setStatus] = useState<SaveStatus>("idle")

  // Any edit after a save makes the "Saved" message stale, so clear it.
  function update(next: NotificationPreferences) {
    setPreferences(next)
    if (status === "saved" || status === "error") setStatus("idle")
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === "saving") return
    setStatus("saving")
    try {
      await onSave?.(preferences)
      setStatus("saved")
    } catch {
      setStatus("error")
    }
  }

  const headingId = `${baseId}-heading`
  const isSaving = status === "saving"

  return (
    <Card data-slot="notification-settings" className={cn("w-full max-w-xl", className)}>
      <form aria-labelledby={headingId} onSubmit={handleSubmit} className="flex flex-col gap-(--card-spacing)">
        <CardHeader>
          <CardTitle>
            <h2 id={headingId}>Notifications</h2>
          </CardTitle>
          <CardDescription>Choose which emails we send you. Changes apply after you save.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <FieldSet>
            <FieldLegend variant="label">Email me when</FieldLegend>
            <div className="flex flex-col gap-4">
              {topics.map((topic) => {
                const checkboxId = `${baseId}-${topic.id}`
                const descriptionId = `${checkboxId}-description`
                return (
                  <div key={topic.id} className="flex items-start gap-3">
                    <Checkbox
                      id={checkboxId}
                      name={`email-${topic.id}`}
                      checked={preferences.email[topic.id] ?? false}
                      onCheckedChange={(checked) =>
                        update({ ...preferences, email: { ...preferences.email, [topic.id]: checked } })
                      }
                      aria-describedby={topic.description ? descriptionId : undefined}
                    />
                    <div className="flex flex-col gap-0.5">
                      <label htmlFor={checkboxId} className="text-sm font-medium leading-snug">
                        {topic.label}
                      </label>
                      {topic.description ? (
                        <FieldDescription id={descriptionId}>{topic.description}</FieldDescription>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </FieldSet>

          <Separator />

          <FieldSet>
            <FieldLegend variant="label" id={`${baseId}-digest-legend`}>
              Activity digest
            </FieldLegend>
            <FieldDescription id={`${baseId}-digest-description`}>
              One email that rounds up likes, follows and comments you were not emailed about.
            </FieldDescription>
            <RadioGroup
              name="digest"
              value={preferences.digest}
              onValueChange={(value: DigestFrequency) => update({ ...preferences, digest: value })}
              aria-labelledby={`${baseId}-digest-legend`}
              aria-describedby={`${baseId}-digest-description`}
              className="flex flex-wrap gap-x-6 gap-y-3"
            >
              {DIGEST_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value={option.value} />
                  {option.label}
                </label>
              ))}
            </RadioGroup>
          </FieldSet>
        </CardContent>

        <CardFooter className="justify-between gap-3">
          {/* Always mounted so screen readers hear the message when it changes. */}
          <p
            role={status === "error" ? "alert" : "status"}
            className={cn("text-xs", status === "error" ? "text-destructive" : "text-muted-foreground")}
          >
            {status === "saved" ? "Notification preferences saved." : null}
            {status === "error" ? "We could not save your preferences. Check your connection and try again." : null}
          </p>
          <Button type="submit" disabled={isSaving} focusableWhenDisabled>
            {isSaving ? <Spinner label="Saving notification preferences" /> : null}
            {isSaving ? "Saving" : "Save preferences"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
