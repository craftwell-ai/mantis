"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Heading } from "@/components/ui/heading"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"

import { type AccountMenuProps } from "./account-menu"
import { AppShell } from "./app-shell"
import { NotificationSettings, type NotificationSettingsProps } from "./notification-settings"
import { SAMPLE_SESSIONS, SAMPLE_SETTINGS_PROFILE, SAMPLE_USAGE, sampleNavigation } from "./sample-content"
import { SessionList, type Session } from "./session-list"
import { SettingsNav, type SettingsNavItem } from "./settings-nav"
import { SettingsSection } from "./settings-section"
import { type TopNavigationProps } from "./top-navigation"
import { UsageSummary, type UsageSummaryProps } from "./usage-summary"

export type SettingsPageSection = "profile" | "notifications" | "security" | "usage"

export type SettingsProfile = {
  name: string
  username: string
  email: string
  avatarSrc?: string
  /** Whether new generations appear on the person's public profile. */
  publishByDefault?: boolean
}

// The props marked "Sample" fall back to the invented Lumen account in
// ./sample-content when left out, so the page previews with nothing filled in.
export interface SettingsPageProps {
  /** The top bar. Sample: Lumen's bar with Maya's account menu. */
  navigation?: TopNavigationProps
  account?: AccountMenuProps
  /** Small heading above the settings nav, such as the workspace name. */
  workspaceLabel?: string
  /** Sample: Maya Okafor's profile. */
  profile?: SettingsProfile
  /** Persist profile edits. Throw (or reject) to show the error message. */
  onSaveProfile?: (profile: SettingsProfile) => void | Promise<void>
  onChangePhoto?: () => void
  onChangePassword?: () => void
  /** When the password last changed, in words, such as "3 months ago". */
  passwordLastChanged?: string
  notifications?: NotificationSettingsProps
  /** Devices signed in to the account. Sample: three devices; pass `[]` for none. */
  sessions?: Session[]
  onSignOutSession?: (sessionId: string) => void | Promise<void>
  onSignOutOthers?: () => void | Promise<void>
  /** Sample: a month of image, video, upscale and voiceover spending. */
  usage?: UsageSummaryProps
  onDeleteAccount?: () => void
  /** Signs out of this device, from the foot of the settings nav. */
  onSignOut?: () => void
  section?: SettingsPageSection
  defaultSection?: SettingsPageSection
  onSectionChange?: (section: SettingsPageSection) => void
  className?: string
}

// One tile color per page, kept the same wherever the page appears.
const NAV_ITEMS: (SettingsNavItem & { id: SettingsPageSection; description: string })[] = [
  {
    id: "profile",
    label: "Profile",
    icon: "person",
    color: "orange",
    description: "How you appear on shared projects and your public page.",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "notifications",
    color: "purple",
    description: "Pick the emails worth your inbox.",
  },
  {
    id: "security",
    label: "Security",
    icon: "shield",
    color: "mint",
    description: "Your password, two-step sign-in and the devices that can reach your account.",
  },
  {
    id: "usage",
    label: "Usage",
    icon: "data_usage",
    color: "blue",
    description: "What your credits went on this billing period.",
  },
]

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
}

type SaveStatus = "idle" | "saving" | "saved" | "error"

function ProfilePanel({
  profile,
  onSave,
  onChangePhoto,
}: {
  profile: SettingsProfile
  onSave?: SettingsPageProps["onSaveProfile"]
  onChangePhoto?: () => void
}) {
  const baseId = React.useId()
  const [draft, setDraft] = React.useState(profile)
  const [status, setStatus] = React.useState<SaveStatus>("idle")

  function update(next: Partial<SettingsProfile>) {
    setDraft((current) => ({ ...current, ...next }))
    // An edit after a save makes the "Saved" message stale.
    if (status === "saved" || status === "error") setStatus("idle")
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === "saving") return
    setStatus("saving")
    try {
      await onSave?.(draft)
      setStatus("saved")
    } catch {
      setStatus("error")
    }
  }

  const saving = status === "saving"

  return (
    <>
      <SettingsSection title="Public profile" description="Collaborators see this on shared projects and comments.">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" aria-label="Public profile">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {draft.avatarSrc ? <AvatarImage src={draft.avatarSrc} alt="" /> : null}
              <AvatarFallback className="text-lg">{initialsOf(draft.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start gap-1.5">
              <Button type="button" variant="secondary" size="sm" onClick={onChangePhoto}>
                <Icon name="upload" />
                Change photo
              </Button>
              <p className="text-xs text-muted-foreground">A square JPG or PNG, at least 256 pixels wide.</p>
            </div>
          </div>
          <FieldGroup className="grid gap-4 @xl/settings:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${baseId}-name`}>Display name</FieldLabel>
              <Input
                id={`${baseId}-name`}
                name="name"
                autoComplete="name"
                value={draft.name}
                onChange={(event) => update({ name: event.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${baseId}-username`}>Username</FieldLabel>
              <Input
                id={`${baseId}-username`}
                name="username"
                autoComplete="username"
                value={draft.username}
                aria-describedby={`${baseId}-username-hint`}
                onChange={(event) => update({ username: event.target.value })}
              />
              <FieldDescription id={`${baseId}-username-hint`}>Part of your public page address.</FieldDescription>
            </Field>
            <Field className="@xl/settings:col-span-2">
              <FieldLabel htmlFor={`${baseId}-email`}>Email</FieldLabel>
              <Input
                id={`${baseId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                value={draft.email}
                onChange={(event) => update({ email: event.target.value })}
              />
            </Field>
          </FieldGroup>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-divider pt-4">
            {/* Always mounted so screen readers hear the result when it changes. */}
            <p
              role={status === "error" ? "alert" : "status"}
              className={cn("text-xs", status === "error" ? "text-destructive" : "text-muted-foreground")}
            >
              {status === "saved" ? "Profile saved." : null}
              {status === "error" ? "We could not save your profile. Check your connection and try again." : null}
            </p>
            <Button type="submit" disabled={saving} focusableWhenDisabled>
              {saving ? <Spinner label="Saving profile" /> : null}
              {saving ? "Saving" : "Save profile"}
            </Button>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection
        title="Sharing"
        rows={[
          {
            id: "publish",
            icon: "public",
            label: "Show new generations on my profile",
            description: "Off keeps everything private until you choose to share it.",
            control: ({ labelId, descriptionId }) => (
              <Switch
                aria-labelledby={labelId}
                aria-describedby={descriptionId}
                checked={draft.publishByDefault ?? false}
                onCheckedChange={(checked) => update({ publishByDefault: checked })}
              />
            ),
          },
        ]}
      />
    </>
  )
}

const SAMPLE_NAVIGATION = sampleNavigation()

// The account settings page: the app shell, a settings nav on the left and,
// on the right, the stacked section cards for whichever page is chosen.
// Below 768px of its own width the nav sits above the cards.
function SettingsPage({
  navigation = SAMPLE_NAVIGATION,
  account,
  workspaceLabel = "Settings",
  profile = SAMPLE_SETTINGS_PROFILE,
  onSaveProfile,
  onChangePhoto,
  onChangePassword,
  passwordLastChanged,
  notifications,
  sessions = SAMPLE_SESSIONS,
  onSignOutSession,
  onSignOutOthers,
  usage = SAMPLE_USAGE,
  onDeleteAccount,
  onSignOut,
  section: sectionProp,
  defaultSection = "profile",
  onSectionChange,
  className,
}: SettingsPageProps) {
  const [sectionState, setSectionState] = React.useState<SettingsPageSection>(defaultSection)
  const section = sectionProp ?? sectionState
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const moved = React.useRef(false)
  const current = NAV_ITEMS.find((item) => item.id === section) ?? NAV_ITEMS[0]

  // After someone picks a page, move focus to its heading so a screen reader
  // starts reading the new content. Never on first render: that would steal focus.
  React.useEffect(() => {
    if (moved.current) headingRef.current?.focus()
  }, [section])

  function select(id: string) {
    const next = id as SettingsPageSection
    moved.current = true
    if (sectionProp === undefined) setSectionState(next)
    onSectionChange?.(next)
  }

  return (
    <AppShell navigation={navigation} account={account} className={cn("@container/settings", className)}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 @3xl/settings:flex-row @3xl/settings:gap-10 @3xl/settings:px-6 @3xl/settings:py-8">
        <SettingsNav
          items={NAV_ITEMS}
          label={workspaceLabel}
          value={section}
          onValueChange={select}
          className="max-w-none shrink-0 @3xl/settings:sticky @3xl/settings:top-0 @3xl/settings:w-56 @3xl/settings:self-start"
          footer={
            onSignOut ? (
              <Button variant="ghost" size="sm" className="w-full justify-start px-2" onClick={onSignOut}>
                <Icon name="logout" />
                Sign out
              </Button>
            ) : null
          }
        />

        <div className="flex min-w-0 max-w-3xl flex-1 flex-col gap-4">
          <header className="flex flex-col gap-1 pb-2">
            <Heading ref={headingRef} tabIndex={-1} level="title" render={<h1 />} className="outline-none">
              {current.label}
            </Heading>
            <p className="text-sm text-muted-foreground">{current.description}</p>
          </header>

          {section === "profile" ? (
            <ProfilePanel profile={profile} onSave={onSaveProfile} onChangePhoto={onChangePhoto} />
          ) : null}

          {section === "notifications" ? <NotificationSettings {...notifications} className="max-w-none" /> : null}

          {section === "security" ? (
            <>
              <SettingsSection
                title="Sign-in"
                description="Change your password if you ever shared it or used it somewhere else."
                rows={[
                  {
                    id: "password",
                    icon: "lock",
                    label: "Password",
                    description: passwordLastChanged ? `Last changed ${passwordLastChanged}` : undefined,
                    control: (
                      <Button variant="secondary" size="sm" onClick={onChangePassword}>
                        Change password
                      </Button>
                    ),
                  },
                  {
                    id: "two-step",
                    icon: "mobile",
                    label: "Two-step sign-in",
                    description: "Ask for a code from your phone when you sign in on a new device.",
                    control: ({ labelId, descriptionId }) => (
                      <Switch aria-labelledby={labelId} aria-describedby={descriptionId} defaultChecked />
                    ),
                  },
                ]}
              />
              <SessionList
                sessions={sessions}
                onSignOut={onSignOutSession}
                onSignOutOthers={onSignOutOthers}
                className="max-w-none"
              />
              {onDeleteAccount ? (
                <SettingsSection
                  title="Delete account"
                  description="Close your account for good. Download anything you want to keep first."
                  dangerZone={{
                    title: "This cannot be undone",
                    description: "Deleting your account removes it straight away.",
                    consequences: [
                      "Every image and video you generated",
                      "Projects you own, for you and your collaborators",
                      "Credits left on your balance",
                    ],
                    actionLabel: "Delete account",
                    confirmTitle: "Delete your account?",
                    confirmDescription:
                      "Your generations, projects and remaining credits are removed for good. Collaborators lose access to projects you own.",
                    cancelLabel: "Keep my account",
                    onConfirm: onDeleteAccount,
                  }}
                />
              ) : null}
            </>
          ) : null}

          {section === "usage" ? <UsageSummary {...usage} /> : null}
        </div>
      </div>
    </AppShell>
  )
}

export { SettingsPage }
