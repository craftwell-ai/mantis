"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon, type IconName } from "@/components/ui/icon"

export type AccountMenuUser = {
  name: string
  email: string
  /** Plan name, such as "Creator". */
  plan: string
  /** Profile picture URL. Initials show while it loads or when there is none. */
  avatarSrc?: string
}

export type AccountMenuCredits = {
  /** Credits spent this billing period. */
  used: number
  /** Credits the plan grants per period. */
  total: number
}

export type AccountMenuUpsell = {
  icon: IconName
  label: string
  /** Short verb on the row's pill, such as "Buy" or "Upgrade". */
  actionLabel: string
  onSelect?: () => void
}

export type AccountMenuItem = {
  icon: IconName
  label: string
  /** A short "New" style label for a recently added destination. */
  badge?: string
  onSelect?: () => void
}

export interface AccountMenuProps {
  user: AccountMenuUser
  credits: AccountMenuCredits
  /** Rows that sell more capacity, shown inside the credit panel. Keep to two. */
  upsells?: AccountMenuUpsell[]
  /** Everyday destinations, such as settings and help. Sign out is added after them. */
  items?: AccountMenuItem[]
  onProfile?: () => void
  /** Opens the usage page from the credit row. */
  onCredits?: () => void
  onSignOut?: () => void
  /** Open on first render; for documentation and tests. */
  defaultOpen?: boolean
  /** Extra classes for the trigger button. */
  className?: string
}

const DEFAULT_ITEMS: AccountMenuItem[] = [
  { icon: "settings", label: "Settings" },
  { icon: "help", label: "Help and feedback" },
]

// Enough dots to read as a meter at menu width without becoming a hairline.
const METER_DOTS = 24

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
}

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value)

// Rows inside the menu hold two lines or a trailing pill, so they drop the
// primitive's fixed 32px height.
const tallItem = "h-auto py-2"
// The panel is glass, as in the reference; its rows highlight with a second
// layer of glass rather than the menu's opaque inset focus color.
const panelItem = cn(tallItem, "focus:bg-glass")

function AccountMenu({
  user,
  credits,
  upsells = [],
  items = DEFAULT_ITEMS,
  onProfile,
  onCredits,
  onSignOut,
  defaultOpen,
  className,
}: AccountMenuProps) {
  const left = Math.max(0, credits.total - credits.used)
  const share = credits.total > 0 ? left / credits.total : 0
  const litDots = Math.round(share * METER_DOTS)
  const initials = initialsOf(user.name)

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${user.name}`}
        className={cn(
          "rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 enabled:hover:brightness-80",
          className
        )}
      >
        <Avatar>
          {user.avatarSrc ? <AvatarImage src={user.avatarSrc} alt="" /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64 p-1.5">
        <DropdownMenuItem className={cn(tallItem, "gap-3")} onClick={onProfile}>
          <Avatar size="lg">
            {user.avatarSrc ? <AvatarImage src={user.avatarSrc} alt="" /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="flex items-center gap-1.5">
              <span className="truncate font-semibold">{user.name}</span>
              <Badge variant="neutral">{user.plan}</Badge>
            </span>
            <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
          </span>
        </DropdownMenuItem>

        {/* The credit panel: balance first, then the ways to get more. Glass over the
            menu, exactly as the reference; its grey text is contrast-exempt by owner
            decision (2026-10-02, see CLAUDE.md). */}
        <DropdownMenuGroup className="my-1 rounded-xl bg-glass p-1">
          <DropdownMenuItem className={cn(panelItem, "flex-col items-stretch gap-2")} onClick={onCredits}>
            <span className="flex items-center gap-2">
              <span>Credits</span>
              <span data-contrast-exempt className="ml-auto font-normal text-muted-foreground tabular-nums">
                {formatNumber(left)} left
              </span>
              <Icon name="chevron_right" />
            </span>
            {/* Lime dots are what is left, so the meter empties as credits are spent. */}
            <span className="flex gap-0.5" aria-hidden="true">
              {Array.from({ length: METER_DOTS }, (_, index) => (
                <span
                  key={index}
                  className={cn("h-1.5 flex-1 rounded-full", index < litDots ? "bg-brand" : "bg-glass")}
                />
              ))}
            </span>
            <span data-contrast-exempt className="text-xs font-normal text-muted-foreground tabular-nums">
              {formatNumber(credits.used)} of {formatNumber(credits.total)} used this month
            </span>
          </DropdownMenuItem>
          {upsells.map((upsell, index) => (
            <React.Fragment key={upsell.label}>
              <DropdownMenuSeparator className="mx-2" />
              <DropdownMenuItem className={panelItem} onClick={upsell.onSelect}>
                <Icon name={upsell.icon} />
                <span>{upsell.label}</span>
                {/* Looks like a button but is part of the row: the whole row is the one control.
                    The first upsell is the menu's one lime action; any other stays glass. */}
                <span className={cn(buttonVariants({ variant: index === 0 ? "brand" : "glass", size: "xs" }), "ml-auto")}>
                  {upsell.actionLabel}
                </span>
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuGroup>

        {items.map((item) => (
          <DropdownMenuItem key={item.label} onClick={item.onSelect}>
            <Icon name={item.icon} />
            {item.label}
            {item.badge ? (
              <Badge variant="new" className="ml-auto">
                {item.badge}
              </Badge>
            ) : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          <Icon name="logout" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { AccountMenu }
