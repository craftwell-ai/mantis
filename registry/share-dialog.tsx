"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldDescription, FieldError, FieldLegend, FieldSet } from "@/components/ui/field"
import { Icon, type IconName } from "@/components/ui/icon"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupCard } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"

export type ShareVisibility = "private" | "link" | "public"

export type ShareRole = { value: string; label: string }

export type ShareMember = {
  id: string
  name: string
  email?: string
  avatar?: string
  /** A role value, or "owner" for the person who cannot be removed. */
  role: string
}

export type ShareInvitee = { email: string; role: string }

export type ShareRequest = { invitees: ShareInvitee[]; visibility: ShareVisibility }

export type ShareDialogProps = {
  /** What is being shared, such as a project name. Shown in the title. */
  itemName: string
  shareUrl: string
  members?: ShareMember[]
  roles?: ShareRole[]
  defaultVisibility?: ShareVisibility
  /** Persist the invites and visibility. Throw (or reject) to keep the dialog open with an error. */
  onShare?: (request: ShareRequest) => void | Promise<void>
  trigger?: React.ReactElement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export const DEFAULT_SHARE_ROLES: ShareRole[] = [
  { value: "viewer", label: "Can view" },
  { value: "editor", label: "Can edit" },
]

const VISIBILITY: { value: ShareVisibility; icon: IconName; title: string; description: string }[] = [
  { value: "private", icon: "lock", title: "Private", description: "Only you and people you invite" },
  { value: "link", icon: "link", title: "Anyone with the link", description: "Can view without signing in" },
  { value: "public", icon: "public", title: "Public", description: "Listed on your profile and in Explore" },
]

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// "Mara Quinn" → "MQ", "leo.park@…" → "LP", "jo@…" → "JO".
function initials(text: string) {
  const words = text.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean)
  if (words.length > 1) return `${words[0][0]}${words[1][0]}`
  return words[0]?.slice(0, 2) ?? "?"
}

// Share a project: type emails that turn into chips, pick a role per invitee,
// choose who can open it (private, link, public) as radio cards, copy the link,
// then Share. Laid out like the reference's share dialog.
export function ShareDialog({
  itemName,
  shareUrl,
  members = [],
  roles = DEFAULT_SHARE_ROLES,
  defaultVisibility = "private",
  onShare,
  trigger,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: ShareDialogProps) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp ?? openState
  const [draft, setDraft] = React.useState("")
  const [invitees, setInvitees] = React.useState<ShareInvitee[]>([])
  const [inviteError, setInviteError] = React.useState<string | null>(null)
  const [visibility, setVisibility] = React.useState<ShareVisibility>(defaultVisibility)
  const [copied, setCopied] = React.useState(false)
  const [status, setStatus] = React.useState<"idle" | "saving" | "error">("idle")
  const baseId = React.useId()
  const inviteId = `${baseId}-invite`
  const inviteHintId = `${baseId}-invite-hint`
  const linkId = `${baseId}-link`

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setOpenState(next)
    onOpenChange?.(next)
  }

  const defaultRole = roles[0]?.value ?? "viewer"
  const roleItems = roles.map((role) => ({ value: role.value, label: role.label }))

  // Turns the typed text into chips. Several addresses can be pasted at once.
  const commitDraft = () => {
    const parts = draft.split(/[\s,;]+/).filter(Boolean)
    if (!parts.length) return true
    const invalid = parts.filter((part) => !EMAIL.test(part))
    const known = new Set([...invitees.map((entry) => entry.email), ...members.map((member) => member.email)])
    const fresh = parts.filter((part) => EMAIL.test(part) && !known.has(part.toLowerCase()))
    setInvitees((list) => [...list, ...fresh.map((email) => ({ email: email.toLowerCase(), role: defaultRole }))])
    setDraft(invalid.join(" "))
    setInviteError(invalid.length ? `“${invalid[0]}” is not an email address. Check it for typos.` : null)
    return invalid.length === 0
  }

  const removeInvitee = (email: string) => setInvitees((list) => list.filter((entry) => entry.email !== email))

  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(shareUrl)
    } catch {
      // Clipboard can be blocked (permissions, iframes); the field stays selectable for a manual copy.
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === "saving" || !commitDraft()) return
    setStatus("saving")
    try {
      // commitDraft queues state; read the draft again so a typed-but-not-chipped address is included.
      const typed = draft
        .split(/[\s,;]+/)
        .filter((part) => EMAIL.test(part))
        .map((email) => ({ email: email.toLowerCase(), role: defaultRole }))
      await onShare?.({ invitees: [...invitees, ...typed], visibility })
      setStatus("idle")
      setInvitees([])
      setOpen(false)
    } catch {
      setStatus("error")
    }
  }

  const saving = status === "saving"
  const shareLabel = invitees.length ? `Share with ${invitees.length} ${invitees.length === 1 ? "person" : "people"}` : "Share"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger render={trigger} /> : null}
      <DialogContent data-slot="share-dialog" className="gap-5 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share {itemName}</DialogTitle>
          <DialogDescription className="text-sm">
            Invite collaborators by email and choose who else can open it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor={inviteId}>Invite people</Label>
            <div
              className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-control bg-field px-2 py-1.5 has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50"
              onClick={(event) => (event.currentTarget.querySelector("input") as HTMLInputElement | null)?.focus()}
            >
              {invitees.map((entry) => (
                <span
                  key={entry.email}
                  className="inline-flex h-7 items-center gap-1 rounded-lg bg-secondary pr-0.5 pl-2 text-xs font-medium text-secondary-foreground"
                >
                  {entry.email}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${entry.email}`}
                    onClick={() => removeInvitee(entry.email)}
                  >
                    <Icon name="close" />
                  </Button>
                </span>
              ))}
              <input
                id={inviteId}
                type="text"
                inputMode="email"
                autoComplete="off"
                value={draft}
                aria-describedby={inviteHintId}
                aria-invalid={inviteError ? true : undefined}
                placeholder={invitees.length ? "Add another" : "name@studio.com"}
                onChange={(event) => {
                  setDraft(event.target.value)
                  if (inviteError) setInviteError(null)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === "," || (event.key === " " && draft.trim())) {
                    event.preventDefault()
                    commitDraft()
                  } else if (event.key === "Backspace" && !draft && invitees.length) {
                    removeInvitee(invitees[invitees.length - 1].email)
                  }
                }}
                onBlur={() => draft.trim() && commitDraft()}
                className="h-7 min-w-32 flex-1 bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            {inviteError ? (
              <FieldError id={inviteHintId}>{inviteError}</FieldError>
            ) : (
              <FieldDescription id={inviteHintId}>Press Enter or comma after each address.</FieldDescription>
            )}
          </div>

          {invitees.length || members.length ? (
            <ul aria-label="People with access" className="flex max-h-56 flex-col gap-1 overflow-y-auto">
              {members.map((member) => (
                <li key={member.id} className="flex items-center gap-3 py-1">
                  <Avatar size="sm">
                    {member.avatar ? <AvatarImage src={member.avatar} alt="" /> : null}
                    <AvatarFallback>{initials(member.name)}</AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{member.name}</span>
                    {member.email ? <span className="truncate text-xs text-muted-foreground">{member.email}</span> : null}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {member.role === "owner" ? "Owner" : (roles.find((role) => role.value === member.role)?.label ?? member.role)}
                  </span>
                </li>
              ))}
              {invitees.map((entry) => (
                <li key={entry.email} className="flex items-center gap-3 py-1">
                  <Avatar size="sm">
                    <AvatarFallback>{initials(entry.email)}</AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{entry.email}</span>
                    <span className="text-xs text-muted-foreground">Invite pending</span>
                  </span>
                  <Select
                    items={roleItems}
                    value={entry.role}
                    onValueChange={(next) =>
                      next &&
                      setInvitees((list) => list.map((item) => (item.email === entry.email ? { ...item, role: next } : item)))
                    }
                  >
                    <SelectTrigger size="sm" aria-label={`Role for ${entry.email}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} align="end">
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </li>
              ))}
            </ul>
          ) : null}

          <Separator />

          <FieldSet className="gap-3">
            <FieldLegend variant="label" id={`${baseId}-visibility`}>
              Who can open it
            </FieldLegend>
            <RadioGroup
              name="visibility"
              value={visibility}
              onValueChange={(next) => setVisibility(next as ShareVisibility)}
              aria-labelledby={`${baseId}-visibility`}
              className="grid-cols-1 sm:grid-cols-3"
            >
              {VISIBILITY.map((option) => (
                <RadioGroupCard key={option.value} value={option.value} className="gap-1 p-3 pr-8">
                  <Icon name={option.icon} className="mb-2 size-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{option.title}</span>
                  <span data-contrast-exempt className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </RadioGroupCard>
              ))}
            </RadioGroup>
          </FieldSet>

          <div className="flex flex-col gap-2">
            <Label htmlFor={linkId}>Link</Label>
            <InputGroup>
              <InputGroupInput id={linkId} readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="sm" variant="secondary" onClick={copyLink} className="h-7">
                  <Icon name={copied ? "check" : "content_copy"} />
                  {copied ? "Copied" : "Copy link"}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>
              {visibility === "private"
                ? "The link only opens for people you invite."
                : visibility === "link"
                  ? "Anyone who has the link can view. Only invited people can edit."
                  : "Anyone can find and view it. Only invited people can edit."}
            </FieldDescription>
            <span role="status" className="sr-only">
              {copied ? "Link copied to the clipboard" : ""}
            </span>
          </div>

          <DialogFooter className={cn("mt-0 items-center", status === "error" && "sm:justify-between")}>
            {status === "error" ? (
              <p role="alert" className="text-xs text-destructive sm:mr-auto">
                Sharing failed. Check your connection and try again.
              </p>
            ) : null}
            <DialogClose render={<Button variant="ghost" type="button" />}>Cancel</DialogClose>
            <Button type="submit" disabled={saving} focusableWhenDisabled>
              {saving ? <Spinner label="Sharing" /> : null}
              {saving ? "Sharing" : shareLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
