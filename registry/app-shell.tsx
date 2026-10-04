"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { AccountMenu, type AccountMenuProps } from "./account-menu"
import { SampleLibraryPage, sampleNavigation } from "./sample-content"
import { TopNavigation, type TopNavigationProps } from "./top-navigation"

export interface AppShellProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Everything the top bar shows: brand, section links, search, pricing, credits. Leave out to show the sample product's bar. */
  navigation?: TopNavigationProps
  /**
   * The signed-in person. Renders an `AccountMenu` in the bar's account slot.
   * Leave out when signed out and pass a sign-in button as `navigation.account`.
   */
  account?: AccountMenuProps
  /** The page. It scrolls inside the shell, so the bar stays put. */
  children?: React.ReactNode
  /** Classes for the scrolling content area, such as padding or a max width. */
  contentClassName?: string
  /** Text of the skip link that jumps past the bar to the page. */
  skipLinkLabel?: string
}

// Moves focus into the page content, past the bar, for keyboard users.
// Shared with the other shells so every template skips the same way.
function AppShellSkipLink({ targetId, label }: { targetId: string; label: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground outline-none focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {label}
    </a>
  )
}

// Shown when no navigation is passed, so the shell previews with nothing filled in.
const SAMPLE_NAVIGATION = sampleNavigation()

// The signed-in page frame: the top bar across the top and one scrolling
// content area under it. Fills the viewport, so only the content scrolls.
function AppShell({
  navigation = SAMPLE_NAVIGATION,
  account,
  children,
  contentClassName,
  skipLinkLabel = "Skip to content",
  className,
  ...props
}: AppShellProps) {
  // React's ids hold punctuation that is awkward in a #fragment, so keep only the safe part.
  const contentId = `app-content-${React.useId().replace(/[^\w-]/g, "")}`

  return (
    <div
      data-slot="app-shell"
      className={cn("relative flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground", className)}
      {...props}
    >
      <AppShellSkipLink targetId={contentId} label={skipLinkLabel} />
      <TopNavigation
        {...navigation}
        account={account ? <AccountMenu {...account} /> : navigation.account}
        className={cn("shrink-0", navigation.className)}
      />
      {/* Focusable so keyboard users can scroll it even when the page has no
          links or buttons, and so the skip link has somewhere to land. */}
      <main
        id={contentId}
        tabIndex={0}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
          contentClassName
        )}
      >
        {/* Left out entirely, the content area shows a sample page; pass null for an empty one. */}
        {children === undefined ? <SampleLibraryPage /> : children}
      </main>
    </div>
  )
}

export { AppShell, AppShellSkipLink }
