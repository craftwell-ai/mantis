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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Icon, type IconName } from "@/components/ui/icon"
import { Spinner } from "@/components/ui/spinner"

export type SessionDevice = "desktop" | "laptop" | "phone" | "tablet"

export type Session = {
  id: string
  device: SessionDevice
  /** Browser or app, such as "Chrome" or "Mantis for iOS". */
  client: string
  /** Operating system, such as "macOS 15". */
  os: string
  /** City and country, as precise as you can honestly say. */
  location: string
  /** Already written for people: "Active now", "2 hours ago". */
  lastActive: string
  lastActiveDateTime?: string
  /** The session this page is open in. It is marked and cannot be signed out from here. */
  current?: boolean
}

export interface SessionListProps {
  sessions: Session[]
  /** Sign one session out. Return a promise to show a spinner on that row until it settles. */
  onSignOut?: (sessionId: string) => void | Promise<void>
  /** Sign out every session except the current one. Runs after the person confirms. */
  onSignOutOthers?: () => void | Promise<void>
  className?: string
}

const DEVICE_ICON: Record<SessionDevice, IconName> = {
  desktop: "computer",
  laptop: "computer",
  phone: "mobile",
  tablet: "tablet_mac",
}

function SessionList({ sessions: sessionsProp, onSignOut, onSignOutOthers, className }: SessionListProps) {
  const headingId = React.useId()
  const [sessions, setSessions] = React.useState(sessionsProp)
  const [pending, setPending] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState("")

  // A new list from the parent (after a refetch) replaces what this block removed locally.
  React.useEffect(() => setSessions(sessionsProp), [sessionsProp])

  const others = sessions.filter((session) => !session.current)
  // Current session first: people look for "this device" before anything else.
  const ordered = [...sessions].sort((a, b) => Number(Boolean(b.current)) - Number(Boolean(a.current)))

  async function signOut(session: Session) {
    setPending(session.id)
    try {
      await onSignOut?.(session.id)
      setSessions((list) => list.filter((item) => item.id !== session.id))
      setMessage(`Signed out of ${session.client} on ${session.os}.`)
    } catch {
      setMessage(`We could not sign out ${session.client} on ${session.os}. Try again.`)
    } finally {
      setPending(null)
    }
  }

  async function signOutOthers() {
    setPending("others")
    try {
      await onSignOutOthers?.()
      setSessions((list) => list.filter((item) => item.current))
      setMessage("Signed out of every other device.")
    } catch {
      setMessage("We could not sign out your other devices. Try again.")
    } finally {
      setPending(null)
    }
  }

  return (
    <section
      data-slot="session-list"
      aria-labelledby={headingId}
      className={cn("flex w-full max-w-2xl flex-col gap-4 rounded-2xl bg-card p-5", className)}
    >
      <header className="flex flex-col gap-1">
        <Heading id={headingId} level="title-sm" render={<h2 />}>
          Where you&apos;re signed in
        </Heading>
        <p className="text-sm text-muted-foreground">
          Sign out any device you don&apos;t recognise, then change your password.
        </p>
      </header>

      <ul className="flex flex-col">
        {ordered.map((session) => (
          <li
            key={session.id}
            className="flex items-center gap-3 border-t border-divider py-3 first:border-t-0 first:pt-0 last:pb-0"
          >
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-glass text-foreground shadow-inset-glass"
            >
              <Icon name={DEVICE_ICON[session.device]} className="size-5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                <span className="truncate">
                  {session.client} on {session.os}
                </span>
                {session.current ? <Badge variant="outline">This device</Badge> : null}
              </p>
              <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                <Icon name="location_on" className="size-3.5" />
                <span>{session.location}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={session.lastActiveDateTime}>{session.lastActive}</time>
              </p>
            </div>
            {session.current ? null : (
              <Button
                variant="ghost"
                size="sm"
                disabled={pending !== null}
                onClick={() => signOut(session)}
                aria-label={`Sign out ${session.client} on ${session.os}, ${session.location}`}
              >
                {pending === session.id ? <Spinner label="Signing out" /> : null}
                Sign out
              </Button>
            )}
          </li>
        ))}
      </ul>

      <footer className={cn("flex flex-wrap items-center justify-between gap-3", others.length > 0 && "border-t border-divider pt-4")}>
        {/* Always mounted so the result is announced when it changes. */}
        <p role="status" className="text-xs text-muted-foreground">
          {message}
        </p>
        {others.length > 0 ? (
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="secondary" size="sm" disabled={pending !== null} />}>
              {pending === "others" ? <Spinner label="Signing out other devices" /> : <Icon name="logout" />}
              Sign out everywhere else
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Sign out of {others.length} other {others.length === 1 ? "device" : "devices"}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Anyone using them will need your password to get back in. Generations already queued there keep
                  rendering.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="glass">Keep them signed in</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={signOutOthers}>
                  Sign out everywhere else
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </footer>
    </section>
  )
}

export { SessionList }
