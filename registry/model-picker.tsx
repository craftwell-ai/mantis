"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"
import { Badge } from "@/components/ui/badge"
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox"
import { Icon, type IconName } from "@/components/ui/icon"
import { IconTile } from "@/components/ui/icon-tile"
import { InputGroupAddon } from "@/components/ui/input-group"

export type ModelPickerModel = {
  value: string
  label: string
  /** One line on what the model is good at, such as "Smooth camera moves up to 10 seconds". */
  description: string
  icon: IconName
  /** Featured models are listed first, under their own heading. */
  featured?: boolean
  /** At most one: `new` for a recent release, `hot` for one many people are using right now. */
  badge?: "new" | "hot"
}

type ModelGroup = { value: string; label: string; icon: IconName; items: ModelPickerModel[] }

export type ModelPickerProps = {
  models: ModelPickerModel[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** What is being picked; names the trigger for screen readers and heads the row variant. */
  label?: string
  /**
   * `chip` sits in a composer's settings row; `row` fills the width of a
   * settings rail with the label above the chosen model.
   */
  trigger?: "chip" | "row"
  /** Which side of the trigger the list opens on. Use `top` when the trigger sits at the bottom of the screen. */
  side?: "top" | "bottom"
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  className?: string
}

const BADGE_LABEL = { new: "New", hot: "Hot" } as const

function groupModels(models: ModelPickerModel[]): ModelGroup[] {
  const featured = models.filter((model) => model.featured)
  const rest = models.filter((model) => !model.featured)
  const groups: ModelGroup[] = []
  if (featured.length) groups.push({ value: "featured", label: "Featured", icon: "star", items: featured })
  // A model appears once: "All models" holds everything not already featured, so
  // keyboard users never meet the same option twice.
  if (rest.length) groups.push({ value: "all", label: featured.length ? "All models" : "Models", icon: "apps", items: rest })
  return groups
}

// The searchable model list from DESIGN.md › Picker: a search field, Featured and
// All groups, rows of icon tile + name + one-line description, a badge where a
// model is new, and a check on the chosen row. Opens from a composer chip.
export function ModelPicker({
  models,
  value,
  defaultValue,
  onValueChange,
  label = "Model",
  trigger = "chip",
  side = "bottom",
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  className,
}: ModelPickerProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? models[0]?.value ?? "")
  const current = value ?? uncontrolled
  const selected = models.find((model) => model.value === current) ?? null
  const groups = React.useMemo(() => groupModels(models), [models])

  return (
    <Combobox
      items={groups}
      value={selected}
      onValueChange={(next: ModelPickerModel | null) => {
        if (!next) return
        setUncontrolled(next.value)
        onValueChange?.(next.value)
      }}
      itemToStringLabel={(model: ModelPickerModel) => model.label}
      isItemEqualToValue={(a: ModelPickerModel, b: ModelPickerModel) => a.value === b.value}
      // Search reads the description too, so "portrait" finds the model built for faces.
      filter={(model: ModelPickerModel, query: string) => {
        const needle = query.trim().toLowerCase()
        return !needle || `${model.label} ${model.description}`.toLowerCase().includes(needle)
      }}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
      disabled={disabled}
    >
      {trigger === "chip" ? (
        <ComboboxTrigger
          data-slot="model-picker-trigger"
          // The trigger is a combobox, which takes its name from a label, not its text;
          // its text is read as the current value, as with the composer's Select chips.
          aria-label={label}
          className={cn(
            "inline-flex h-10 w-fit items-center gap-1.5 rounded-xl border border-chip-border bg-chip px-3 text-sm font-medium whitespace-nowrap text-chip-foreground transition-[filter] duration-(--duration-normal) outline-none hover:brightness-110 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          {selected ? <Icon name={selected.icon} className="size-4" /> : null}
          {selected?.label ?? `Choose a ${label.toLowerCase()}`}
        </ComboboxTrigger>
      ) : (
        <ComboboxTrigger
          data-slot="model-picker-trigger"
          aria-label={label}
          className={cn(
            // The field fill, as in the reference; the grey label is contrast-exempt (owner decision, 2026-10-02).
            "flex w-full items-center gap-3 rounded-xl bg-field px-3 py-2 text-left transition-[filter] duration-(--duration-normal) outline-none hover:brightness-110 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          {selected ? <IconTile name={selected.icon} size="lg" /> : null}
          <span className="flex min-w-0 flex-1 flex-col">
            <span data-contrast-exempt className="text-xs text-muted-foreground">
              {label}
            </span>
            <span className="truncate text-sm font-medium text-foreground">
              {selected?.label ?? `Choose a ${label.toLowerCase()}`}
            </span>
          </span>
        </ComboboxTrigger>
      )}
      <ComboboxContent side={side} aria-label={`Choose a ${label.toLowerCase()}`} className="w-88">
        <ComboboxInput showTrigger={false} placeholder="Search models" aria-label={`Search ${label.toLowerCase()}s`}>
          <InputGroupAddon align="inline-start">
            <Icon name="search" />
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxEmpty className="flex-col gap-1 px-4 py-6">
          <span className="text-foreground">No models match that search.</span>
          <span>Try what you want to make, such as portrait, motion or sketch.</span>
        </ComboboxEmpty>
        <ComboboxList className="max-h-96">
          {(group: ModelGroup) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel className="flex items-center gap-1.5 pt-2">
                <Icon name={group.icon} className="size-3.5" />
                {group.label}
              </ComboboxLabel>
              <ComboboxCollection>
                {(model: ModelPickerModel) => (
                  <ComboboxItem
                    key={model.value}
                    value={model}
                    className="h-auto items-center gap-3 py-2 data-selected:bg-glass"
                  >
                    <IconTile name={model.icon} size="lg" />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <span className="truncate">{model.label}</span>
                        {model.badge === "new" ? <Badge variant="new">{BADGE_LABEL.new}</Badge> : null}
                        {model.badge === "hot" ? <Badge variant="neutral">{BADGE_LABEL.hot}</Badge> : null}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">{model.description}</span>
                    </span>
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
