"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { type IconName } from "@/components/ui/icon"
import { IconTile } from "@/components/ui/icon-tile"

type TileColor = "blue" | "purple" | "pink" | "orange" | "mint" | "brown" | "neutral"

export type SettingsNavItem = {
  id: string
  label: string
  icon: IconName
  /** Keep each page's color the same everywhere it appears. */
  color: TileColor
  /** Renders a link. Without it the row is a button that calls `onValueChange`. */
  href?: string
}

export interface SettingsNavProps {
  items: SettingsNavItem[]
  /** Small heading above the rows, such as the workspace name. */
  label?: string
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  /** Pinned under the rows, such as a sign-out button. */
  footer?: React.ReactNode
  className?: string
}

function SettingsNav({ items, label = "Settings", value: valueProp, defaultValue, onValueChange, footer, className }: SettingsNavProps) {
  const [valueState, setValueState] = React.useState(defaultValue ?? items[0]?.id)
  const value = valueProp ?? valueState
  const labelId = React.useId()

  const rowClass =
    "flex h-9 w-full items-center gap-2.5 rounded-lg px-2 text-sm font-medium text-foreground outline-none transition-[background-color,filter] duration-(--duration-normal) hover:bg-glass focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-glass"

  return (
    <nav data-slot="settings-nav" aria-labelledby={labelId} className={cn("flex w-full max-w-60 flex-col gap-2", className)}>
      <p id={labelId} className="truncate px-2 text-xs text-muted-foreground">
        {label}
      </p>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const current = item.id === value
          const content = (
            <>
              <IconTile name={item.icon} color={item.color} size="md" />
              <span className="truncate">{item.label}</span>
            </>
          )
          const select = () => {
            if (valueProp === undefined) setValueState(item.id)
            onValueChange?.(item.id)
          }
          return (
            <li key={item.id}>
              {item.href ? (
                <a href={item.href} aria-current={current ? "page" : undefined} className={rowClass} onClick={select}>
                  {content}
                </a>
              ) : (
                <button type="button" aria-current={current ? "page" : undefined} className={rowClass} onClick={select}>
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
      {footer ? <div className="mt-auto pt-4">{footer}</div> : null}
    </nav>
  )
}

export { SettingsNav }
