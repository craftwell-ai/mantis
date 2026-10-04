"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export type TopNavigationLink = {
  label: string
  href: string
  /** A short "New" label beside the link. One or two links at most. */
  badge?: string
}

export type TopNavigationPricing = {
  label: string
  href: string
  /** The sale tag hung under the link, such as "30% off". Leave out when there is no sale. */
  saleTag?: string
}

export interface TopNavigationProps extends Omit<React.ComponentProps<"header">, "children"> {
  /** Product name; labels the empty logo slot ("<name> logo"). */
  brandName: string
  homeHref?: string
  links: TopNavigationLink[]
  /** href of the page being shown; that link turns lime and gets aria-current. */
  activeHref?: string
  /** Opens the command palette. Also bound to ⌘K / Ctrl+K while the bar is mounted. */
  onSearch?: () => void
  pricing?: TopNavigationPricing
  /** Where the Assets button goes. Leave out to hide it. */
  assetsHref?: string
  /** The person's credit balance. Leave out when signed out. */
  credits?: number
  /** Where the credits indicator goes, such as the usage page. */
  creditsHref?: string
  /** The avatar control, usually an `AccountMenu`; or, when signed out, one lime (`brand`) Sign up or Sign in link: the bar's call to action. */
  account?: React.ReactNode
  /** Names the navigation landmark. Change it only when a page holds two bars. */
  navLabel?: string
}

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value)

// Button looks on a real <a>: Base UI's Button would add role="button" to a
// link, and these go to other pages. The variant's hover dim only targets
// form controls, so links restate it.
function linkButton(variant: "glass" | "ghost", size: "sm" | "default", className?: string) {
  return cn(buttonVariants({ variant, size }), "hover:brightness-80 active:brightness-60", className)
}

function useCommandK(onSearch?: () => void) {
  React.useEffect(() => {
    if (!onSearch) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onSearch()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onSearch])
}

function LogoSlot({ brandName, href }: { brandName: string; href: string }) {
  return (
    <a
      href={href}
      className="shrink-0 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {/* An empty, labelled slot: the product's own mark goes here. */}
      <span role="img" aria-label={`${brandName} logo`} className="block size-8 rounded-lg bg-glass shadow-inset-glass" />
    </a>
  )
}

// The pricing link with its sale tag hanging off the bottom edge, as the reference does.
// In the menu sheet the row is full width, so the tag sits at its end instead.
function PricingLink({
  pricing,
  tag = "hang",
  className,
}: {
  pricing: TopNavigationPricing
  tag?: "hang" | "inline"
  className?: string
}) {
  return (
    <a href={pricing.href} className={linkButton("glass", "sm", cn("relative", className))}>
      <Icon name="rocket_launch" />
      {pricing.label}
      {pricing.saleTag ? (
        <Badge variant="sale" className={tag === "hang" ? "absolute -bottom-2.5 left-1/2 -translate-x-1/2" : "ml-auto"}>
          {pricing.saleTag}
        </Badge>
      ) : null}
    </a>
  )
}

function NavLinks({
  links,
  activeHref,
  orientation,
}: {
  links: TopNavigationLink[]
  activeHref?: string
  orientation: "horizontal" | "vertical"
}) {
  return (
    <ul className={cn("flex", orientation === "horizontal" ? "items-center gap-1" : "flex-col gap-0.5")}>
      {links.map((link) => {
        const active = link.href === activeHref
        return (
          <li key={link.href}>
            <a
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-lg font-medium whitespace-nowrap outline-none transition-[filter,background-color] duration-(--duration-normal) hover:bg-glass focus-visible:ring-3 focus-visible:ring-ring/50",
                orientation === "horizontal" ? "h-8 px-2 text-sm" : "h-10 px-3 text-base",
                active ? "text-brand-text" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
              {link.badge ? <Badge variant="new">{link.badge}</Badge> : null}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

// The app's top bar: logo, section links (the current one lime), search with
// ⌘K, pricing with a sale tag, assets, credits and the account control.
// When the bar is narrower than 1024px the links, pricing and assets fold into a menu sheet.
function TopNavigation({
  brandName,
  homeHref = "/",
  links,
  activeHref,
  onSearch,
  pricing,
  assetsHref,
  credits,
  creditsHref,
  account,
  navLabel = "Main",
  className,
  ...props
}: TopNavigationProps) {
  useCommandK(onSearch)
  const creditsText = credits === undefined ? null : formatNumber(credits)

  const creditsBody =
    creditsText === null ? null : (
      <>
        <Icon name="toll" />
        <span className="tabular-nums">{creditsText}</span>
        <span className="sr-only"> credits left</span>
      </>
    )

  return (
    <header
      data-slot="top-navigation"
      className={cn("@container/topnav flex h-14 w-full items-center gap-3 bg-background px-4", className)}
      {...props}
    >
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Open menu" className="@5xl/topnav:hidden" />}>
          <Icon name="menu" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 gap-2">
          <SheetHeader className="pb-0">
            <SheetTitle>{brandName}</SheetTitle>
          </SheetHeader>
          <nav aria-label={navLabel} className="px-2">
            <NavLinks links={links} activeHref={activeHref} orientation="vertical" />
          </nav>
          {pricing || assetsHref ? <Separator className="mx-4 w-auto" /> : null}
          <div className="flex flex-col gap-3 px-4 pt-2">
            {pricing ? <PricingLink pricing={pricing} tag="inline" className="h-10 justify-start" /> : null}
            {assetsHref ? (
              <a href={assetsHref} className={linkButton("glass", "default", "h-10 justify-start")}>
                <Icon name="folder" />
                Assets
              </a>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <LogoSlot brandName={brandName} href={homeHref} />

      <nav aria-label={navLabel} className="hidden min-w-0 @5xl/topnav:block">
        <NavLinks links={links} activeHref={activeHref} orientation="horizontal" />
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {onSearch ? (
          <>
            <button
              type="button"
              onClick={onSearch}
              className="hidden h-8 w-48 items-center gap-2 rounded-lg bg-glass px-2.5 text-sm text-muted-foreground outline-none transition-[filter] duration-(--duration-normal) hover:brightness-80 focus-visible:ring-3 focus-visible:ring-ring/50 @3xl/topnav:flex"
            >
              <Icon name="search" />
              Search
              <KbdGroup className="ml-auto">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </button>
            <Button variant="ghost" size="icon-sm" aria-label="Search" onClick={onSearch} className="@3xl/topnav:hidden">
              <Icon name="search" />
            </Button>
          </>
        ) : null}

        {pricing ? <PricingLink pricing={pricing} className="hidden @5xl/topnav:inline-flex" /> : null}

        {assetsHref ? (
          <a href={assetsHref} className={linkButton("glass", "sm", "hidden @5xl/topnav:inline-flex")}>
            <Icon name="folder" />
            Assets
          </a>
        ) : null}

        {creditsBody ? (
          creditsHref ? (
            <a href={creditsHref} className={linkButton("ghost", "sm", "px-2")}>
              {creditsBody}
            </a>
          ) : (
            <span className="inline-flex h-8 items-center gap-1.5 px-2 text-sm font-medium">{creditsBody}</span>
          )
        ) : null}

        {account ? (
          <>
            <Separator orientation="vertical" className="mx-1 my-2" />
            {account}
          </>
        ) : null}
      </div>
    </header>
  )
}

export { TopNavigation }
