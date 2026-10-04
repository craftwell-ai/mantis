"use client"

import * as React from "react"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Icon, type IconName } from "@/components/ui/icon"

export type SettingsRowIds = { labelId: string; descriptionId: string }

export type SettingsRow = {
  id: string
  label: string
  description?: string
  icon?: IconName
  /**
   * The control at the row's end: a Switch, a Select, a small Button. Pass a
   * function to receive the ids of the label and description, and wire them to
   * the control with `aria-labelledby` / `aria-describedby`.
   */
  control: React.ReactNode | ((ids: SettingsRowIds) => React.ReactNode)
}

export type SettingsDangerZone = {
  title: string
  description: string
  /** What is lost, one short line each, listed before the button. */
  consequences?: string[]
  actionLabel: string
  confirmTitle: string
  confirmDescription: string
  cancelLabel?: string
  onConfirm: () => void
}

export interface SettingsSectionProps extends Omit<React.ComponentProps<"section">, "title" | "children"> {
  title: string
  description?: string
  rows?: SettingsRow[]
  /** Free-form content under the rows, for anything that is not label + control. */
  children?: React.ReactNode
  dangerZone?: SettingsDangerZone
}

function SettingsSection({ title, description, rows = [], children, dangerZone, className, ...props }: SettingsSectionProps) {
  const baseId = React.useId()
  const headingId = `${baseId}-heading`

  return (
    <section
      data-slot="settings-section"
      aria-labelledby={headingId}
      className={cn("flex w-full flex-col gap-4 rounded-2xl bg-card p-5", className)}
      {...props}
    >
      <header className="flex flex-col gap-1">
        <Heading id={headingId} level="title-sm" render={<h2 />} className="text-base font-medium">
          {title}
        </Heading>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </header>

      {rows.length > 0 ? (
        <ul className="flex flex-col">
          {rows.map((row) => {
            const ids = { labelId: `${baseId}-${row.id}-label`, descriptionId: `${baseId}-${row.id}-description` }
            return (
              <li key={row.id} className="flex items-center gap-3 border-t border-divider py-3 first:border-t-0 first:pt-0 last:pb-0">
                {row.icon ? (
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-glass text-foreground shadow-inset-glass"
                  >
                    <Icon name={row.icon} className="size-4.5" />
                  </span>
                ) : null}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p id={ids.labelId} className="text-sm font-medium">
                    {row.label}
                  </p>
                  {row.description ? (
                    <p id={ids.descriptionId} className="text-xs text-muted-foreground">
                      {row.description}
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0">{typeof row.control === "function" ? row.control(ids) : row.control}</div>
              </li>
            )
          })}
        </ul>
      ) : null}

      {children}

      {dangerZone ? <DangerZone {...dangerZone} id={`${baseId}-danger`} /> : null}
    </section>
  )
}

function DangerZone({
  id,
  title,
  description,
  consequences,
  actionLabel,
  confirmTitle,
  confirmDescription,
  cancelLabel = "Cancel",
  onConfirm,
}: SettingsDangerZone & { id: string }) {
  return (
    <div
      role="group"
      aria-labelledby={`${id}-title`}
      className="flex flex-col gap-3 rounded-xl border border-destructive/40 p-4"
    >
      <div className="flex flex-col gap-1">
        <h3 id={`${id}-title`} className="flex items-center gap-2 text-sm font-medium text-destructive">
          <Icon name="warning" className="size-4" />
          {title}
        </h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {consequences?.length ? (
        <ul className="flex flex-col gap-1.5 text-xs">
          {consequences.map((line) => (
            <li key={line} className="flex items-center gap-2">
              <Icon name="close" className="size-3.5 text-destructive" />
              {line}
            </li>
          ))}
        </ul>
      ) : null}
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="destructive" size="sm" className="self-start" />}>
          {actionLabel}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="glass">{cancelLabel}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onConfirm}>
              {actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { SettingsSection }
