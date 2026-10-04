"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Icon, type IconName } from "@/components/ui/icon"
import { IconTile } from "@/components/ui/icon-tile"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type NotificationRequestStatus = "pending" | "accepted" | "declined"

export type NotificationEntry = {
  id: string
  /** Who did it. Shown as an avatar and bolded at the start of the message. */
  actor?: { name: string; avatar?: string }
  /** Shown instead of an avatar for system messages, such as a finished render. */
  icon?: IconName
  /** The rest of the sentence after the actor's name: "invited you to edit Night Market". */
  message: string
  /** Already formatted for display, such as "4m" or "Yesterday". */
  time: string
  /** Machine-readable timestamp for the <time> element. */
  dateTime?: string
  unread: boolean
  /** Present on requests (invites, access asks). They get Accept and Decline in the row. */
  request?: { status: NotificationRequestStatus }
}

type Filter = "all" | "requests" | "unread"

export type NotificationsPanelProps = {
  notifications: NotificationEntry[]
  /** Fires when someone opens a non-request row. The panel marks it read itself. */
  onOpenNotification?: (notification: NotificationEntry) => void
  onRespond?: (notification: NotificationEntry, response: "accepted" | "declined") => void
  onMarkAllRead?: () => void
  /**
   * `popover` (default) renders the bell button that opens the panel.
   * `inline` renders the panel on its own, for a sheet or a full page.
   */
  mode?: "popover" | "inline"
  defaultOpen?: boolean
  className?: string
}

const EMPTY_COPY: Record<Filter, { title: string; body: string }> = {
  all: {
    title: "No notifications yet",
    body: "Comments, likes and finished renders will show up here.",
  },
  requests: {
    title: "No requests",
    body: "When someone invites you to a project or asks for access, you can answer here.",
  },
  unread: {
    title: "You're all caught up",
    body: "Everything here has been read. New activity will appear at the top.",
  },
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
}

// The bell menu: three tabs (All, Requests, Unread), rows with an avatar or
// icon, the message, a time and an unread dot, inline Accept / Decline on
// requests, Mark all as read, and an empty state per tab.
export function NotificationsPanel({
  notifications: initial,
  onOpenNotification,
  onRespond,
  onMarkAllRead,
  mode = "popover",
  defaultOpen,
  className,
}: NotificationsPanelProps) {
  // Seeded once from props so read and answered states show at once; the
  // callbacks persist them. Remount with a new `key` to load a fresh list.
  const [notifications, setNotifications] = React.useState(initial)
  const [filter, setFilter] = React.useState<Filter>("all")
  const headingId = React.useId()

  const unreadCount = notifications.filter((entry) => entry.unread).length
  const pendingRequests = notifications.filter((entry) => entry.request?.status === "pending").length

  const markRead = (id: string) =>
    setNotifications((list) => list.map((entry) => (entry.id === id ? { ...entry, unread: false } : entry)))

  const markAllRead = () => {
    setNotifications((list) => list.map((entry) => ({ ...entry, unread: false })))
    onMarkAllRead?.()
  }

  const respond = (entry: NotificationEntry, response: "accepted" | "declined") => {
    setNotifications((list) =>
      list.map((item) => (item.id === entry.id ? { ...item, unread: false, request: { status: response } } : item))
    )
    onRespond?.(entry, response)
  }

  const visible: Record<Filter, NotificationEntry[]> = {
    all: notifications,
    requests: notifications.filter((entry) => entry.request),
    unread: notifications.filter((entry) => entry.unread),
  }

  const panel = (
    <section
      data-slot="notifications-panel"
      aria-labelledby={headingId}
      className={cn("flex w-full flex-col gap-3", mode === "inline" && "max-w-md rounded-2xl border border-separator bg-background p-2", className)}
    >
      <div className="flex items-center justify-between gap-2 px-2 pt-1">
        <h2 id={headingId} className="text-title-sm">
          Notifications
        </h2>
        <Button variant="ghost" size="xs" disabled={unreadCount === 0} onClick={markAllRead}>
          <Icon name="done_all" />
          Mark all as read
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)} className="gap-2">
        <TabsList className="mx-1 w-auto self-stretch">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {pendingRequests > 0 ? <span className="tabular-nums text-muted-foreground">{pendingRequests}</span> : null}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 ? <span className="tabular-nums text-muted-foreground">{unreadCount}</span> : null}
          </TabsTrigger>
        </TabsList>

        {(Object.keys(visible) as Filter[]).map((key) => (
          <TabsContent key={key} value={key} className="max-h-104 overflow-y-auto overscroll-contain">
            {visible[key].length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-glass text-muted-foreground">
                  <Icon name="notifications" className="size-6" />
                </span>
                <p className="text-sm font-medium text-foreground">{EMPTY_COPY[key].title}</p>
                <p className="text-xs text-muted-foreground">{EMPTY_COPY[key].body}</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {visible[key].map((entry) => (
                  <NotificationRow
                    key={entry.id}
                    entry={entry}
                    onOpen={() => {
                      markRead(entry.id)
                      onOpenNotification?.(entry)
                    }}
                    onRespond={(response) => respond(entry, response)}
                  />
                ))}
              </ul>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )

  if (mode === "inline") return panel

  return (
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger
        render={<Button variant="glass" size="icon" className="relative" />}
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
      >
        <Icon name="notifications" className="size-5" />
        {unreadCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-2xs font-semibold text-primary-foreground tabular-nums"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent aria-labelledby={headingId} align="end" sideOffset={8} className="w-96 max-w-[calc(100vw-2rem)]">
        {panel}
      </PopoverContent>
    </Popover>
  )
}

function NotificationRow({
  entry,
  onOpen,
  onRespond,
}: {
  entry: NotificationEntry
  onOpen: () => void
  onRespond: (response: "accepted" | "declined") => void
}) {
  const leading = entry.actor ? (
    <Avatar>
      {entry.actor.avatar ? <AvatarImage src={entry.actor.avatar} alt="" /> : null}
      <AvatarFallback>{initials(entry.actor.name)}</AvatarFallback>
    </Avatar>
  ) : (
    <IconTile name={entry.icon ?? "notifications"} size="lg" className="rounded-full" />
  )

  const text = (
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-sm text-foreground">
        {entry.actor ? <span className="font-medium">{entry.actor.name} </span> : null}
        <span className={cn(!entry.unread && "text-muted-foreground")}>{entry.message}</span>
      </span>
      <time dateTime={entry.dateTime} className="text-xs text-muted-foreground">
        {entry.time}
      </time>
    </span>
  )

  // Never color alone: the dot carries a spoken "Unread" too.
  const unreadDot = entry.unread ? (
    <span className="mt-1.5 flex size-2 shrink-0 rounded-full bg-primary">
      <span className="sr-only">Unread</span>
    </span>
  ) : (
    <span aria-hidden="true" className="size-2 shrink-0" />
  )

  if (entry.request) {
    const { status } = entry.request
    return (
      <li className={cn("flex items-start gap-3 rounded-xl px-2 py-2.5", entry.unread && "bg-glass")}>
        {leading}
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          {text}
          {status === "pending" ? (
            <span className="flex gap-2">
              <Button size="xs" variant="secondary" onClick={() => onRespond("accepted")}>
                Accept
              </Button>
              <Button size="xs" variant="ghost" onClick={() => onRespond("declined")}>
                Decline
              </Button>
            </span>
          ) : (
            <span role="status" className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon name={status === "accepted" ? "check_circle" : "close"} className="size-3.5" />
              {status === "accepted" ? "Accepted" : "Declined"}
            </span>
          )}
        </span>
        {unreadDot}
      </li>
    )
  }

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-[background-color] duration-(--duration-normal) outline-none hover:bg-glass-hover focus-visible:ring-3 focus-visible:ring-ring/50",
          entry.unread && "bg-glass"
        )}
      >
        {leading}
        {text}
        {unreadDot}
      </button>
    </li>
  )
}
