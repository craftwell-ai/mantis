"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon, type IconName } from "@/components/ui/icon"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { AccountMenu, type AccountMenuProps } from "./account-menu"
import { AppShellSkipLink } from "./app-shell"
import { SAMPLE_SIDEBAR_LABEL, SAMPLE_SIDEBAR_SECTIONS, SampleProjectsPage, sampleNavigation } from "./sample-content"
import { TopNavigation, type TopNavigationProps } from "./top-navigation"

export type AppSidebarItem = {
  label: string
  href: string
  icon: IconName
  /** A short "New" label. It hides when the sidebar is collapsed, but screen readers still hear it. */
  badge?: string
}

export type AppSidebarSection = {
  /** Small heading above the section, such as "Recent projects". The first section usually has none. */
  label?: string
  items: AppSidebarItem[]
}

export interface AppShellSidebarProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Everything the top bar shows: brand, section links, search, pricing, credits. Leave out to show the sample product's bar. */
  navigation?: TopNavigationProps
  /** The signed-in person; renders an `AccountMenu` in the bar. */
  account?: AccountMenuProps
  /** Names the sidebar's navigation landmark and its small-screen sheet, such as "Studio". Defaults to the sample's "Studio". */
  sidebarLabel?: string
  /** The sidebar's links, in groups. Leave out to show the sample sections; pass `[]` for an empty sidebar. */
  sections?: AppSidebarSection[]
  /** href of the page being shown; that row is highlighted and gets aria-current. */
  activeHref?: string
  /** Pinned at the bottom of the open sidebar, such as an upgrade card. Hidden while collapsed. */
  sidebarFooter?: React.ReactNode
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /** The page. It scrolls on its own, beside the sidebar. */
  children?: React.ReactNode
  /** Classes for the scrolling content area, such as padding or a max width. */
  contentClassName?: string
  skipLinkLabel?: string
}

const rowClass =
  "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium outline-none transition-[background-color,color] duration-(--duration-normal) hover:bg-glass hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-glass aria-[current=page]:text-foreground"

function SidebarRow({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: AppSidebarItem
  active: boolean
  collapsed: boolean
  onNavigate?: () => void
}) {
  const link = (
    <a
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(rowClass, "text-muted-foreground", collapsed && "size-10 justify-center px-0")}
    >
      <Icon name={item.icon} className="size-5" />
      <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
      {item.badge ? (
        collapsed ? (
          <span className="sr-only">, {item.badge}</span>
        ) : (
          <Badge variant="new" className="ml-auto">
            {item.badge}
          </Badge>
        )
      ) : null}
    </a>
  )

  if (!collapsed) return link
  // Collapsed rows are icons only, so a tooltip names each one on hover and focus.
  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  )
}

function SidebarSections({
  sections,
  activeHref,
  collapsed,
  onNavigate,
}: {
  sections: AppSidebarSection[]
  activeHref?: string
  collapsed: boolean
  onNavigate?: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {sections.map((section, index) => {
        const headingId = `${index}-${section.label ?? "links"}`
        return (
          <div key={headingId} className="flex flex-col gap-1">
            {section.label && !collapsed ? (
              <p className="truncate px-2.5 pb-1 text-xs text-muted-foreground">{section.label}</p>
            ) : null}
            {collapsed && index > 0 ? <Separator className="mx-auto mb-2 w-6" /> : null}
            <ul className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
              {section.items.map((item) => (
                <li key={item.href} className={cn(!collapsed && "w-full")}>
                  <SidebarRow item={item} active={item.href === activeHref} collapsed={collapsed} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

// Shown for the props left out, so the shell previews with nothing filled in.
const SAMPLE_NAVIGATION = sampleNavigation()

// The signed-in frame for tools with many destinations: the top bar, a left
// sidebar of icon links grouped into sections, and a scrolling content area.
// From 1024px of the shell's own width the sidebar sits beside the page and collapses to icons; below
// that it moves into a sheet opened from a slim bar above the content.
function AppShellSidebar({
  navigation = SAMPLE_NAVIGATION,
  account,
  sidebarLabel = SAMPLE_SIDEBAR_LABEL,
  sections = SAMPLE_SIDEBAR_SECTIONS,
  activeHref,
  sidebarFooter,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  children,
  contentClassName,
  skipLinkLabel = "Skip to content",
  className,
  ...props
}: AppShellSidebarProps) {
  const [collapsedState, setCollapsedState] = React.useState(defaultCollapsed)
  const collapsed = collapsedProp ?? collapsedState
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const contentId = `app-content-${React.useId().replace(/[^\w-]/g, "")}`

  const toggleCollapsed = () => {
    const next = !collapsed
    if (collapsedProp === undefined) setCollapsedState(next)
    onCollapsedChange?.(next)
  }

  const activeItem = sections.flatMap((section) => section.items).find((item) => item.href === activeHref)
  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar"

  return (
    <div
      data-slot="app-shell-sidebar"
      className={cn("@container/shell relative flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground", className)}
      {...props}
    >
      <AppShellSkipLink targetId={contentId} label={skipLinkLabel} />
      <TopNavigation
        {...navigation}
        account={account ? <AccountMenu {...account} /> : navigation.account}
        className={cn("shrink-0", navigation.className)}
      />

      <div className="flex min-h-0 flex-1">
        <aside
          data-collapsed={collapsed || undefined}
          className={cn(
            "hidden shrink-0 flex-col gap-3 border-r border-divider py-3 transition-[width] duration-(--duration-normal) motion-reduce:transition-none @5xl/shell:flex",
            collapsed ? "w-16 items-center px-3" : "w-60 px-3"
          )}
        >
          <div className={cn("flex", collapsed ? "justify-center" : "justify-end")}>
            <Tooltip>
              <TooltipTrigger
                render={<Button variant="ghost" size="icon-sm" aria-label={toggleLabel} onClick={toggleCollapsed} />}
              >
                <Icon name={collapsed ? "left_panel_open" : "left_panel_close"} />
              </TooltipTrigger>
              <TooltipContent side="right">{toggleLabel}</TooltipContent>
            </Tooltip>
          </div>
          <nav aria-label={sidebarLabel} className="min-h-0 flex-1 overflow-y-auto">
            <SidebarSections sections={sections} activeHref={activeHref} collapsed={collapsed} />
          </nav>
          {sidebarFooter && !collapsed ? <div className="shrink-0">{sidebarFooter}</div> : null}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Below 1024px the sidebar lives in a sheet, opened from this bar. */}
          <div className="flex h-12 shrink-0 items-center border-b border-divider px-3 @5xl/shell:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger render={<Button variant="ghost" size="sm" />}>
                <Icon name="left_panel_open" />
                {/* The visible text is where you are; this says the button opens the sidebar. */}
                <span className="sr-only">Open {sidebarLabel} menu, current page: </span>
                {activeItem?.label ?? sidebarLabel}
                <Icon name="keyboard_arrow_down" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 gap-2">
                <SheetHeader className="pb-0">
                  <SheetTitle>{sidebarLabel}</SheetTitle>
                </SheetHeader>
                <nav aria-label={sidebarLabel} className="min-h-0 flex-1 overflow-y-auto px-2">
                  <SidebarSections
                    sections={sections}
                    activeHref={activeHref}
                    collapsed={false}
                    onNavigate={() => setSheetOpen(false)}
                  />
                </nav>
                {sidebarFooter ? <div className="shrink-0 p-4 pt-0">{sidebarFooter}</div> : null}
              </SheetContent>
            </Sheet>
          </div>

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
            {children === undefined ? <SampleProjectsPage /> : children}
          </main>
        </div>
      </div>
    </div>
  )
}

export { AppShellSidebar }
