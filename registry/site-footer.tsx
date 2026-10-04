import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { buttonVariants } from "@/components/ui/button"
import { Icon, type IconName } from "@/components/ui/icon"

export type SiteFooterLink = { label: string; href: string }

export type SiteFooterColumn = {
  title: string
  links: SiteFooterLink[]
}

export type SiteFooterSocial = {
  /** The network's name, such as "Instagram". Becomes the button's accessible name. */
  label: string
  href: string
  icon: IconName
}

export interface SiteFooterProps extends Omit<React.ComponentProps<"footer">, "children"> {
  /** Product name; labels the empty logo slot ("<name> logo"). */
  brandName: string
  homeHref?: string
  /** A short uppercase statement beside the logo. Only on the `brand` tone. */
  tagline?: string
  columns: SiteFooterColumn[]
  socials?: SiteFooterSocial[]
  /** The copyright line, such as "© 2026 Lumen Labs, Inc." */
  legal: React.ReactNode
  /** Privacy, terms and similar, shown beside the copyright line. */
  legalLinks?: SiteFooterLink[]
  /** `brand` is the lime marketing footer; `plain` is the quiet dark one for app pages. */
  tone?: "brand" | "plain"
}

const tones = {
  brand: {
    root: "bg-brand text-brand-foreground",
    // On lime the system's lime focus ring would vanish; the dark label color replaces it.
    focus: "focus-visible:ring-brand-foreground/60",
    title: "text-brand-foreground",
    link: "text-brand-foreground",
    slot: "bg-brand-foreground/10",
    rule: "border-brand-foreground/15",
    social: "text-brand-foreground bg-brand-foreground/10 hover:bg-brand-foreground/15",
  },
  plain: {
    root: "bg-background text-foreground border-t border-separator",
    focus: "focus-visible:ring-ring/50",
    title: "text-foreground",
    link: "text-muted-foreground hover:text-foreground",
    slot: "bg-glass shadow-inset-glass",
    rule: "border-separator",
    social: "bg-glass",
  },
} as const

// The marketing footer: logo and statement, link columns, then a bottom row
// with the legal line and social buttons. Two tones: lime for marketing pages
// (the reference's footer), dark for in-app pages.
function SiteFooter({
  brandName,
  homeHref = "/",
  tagline,
  columns,
  socials = [],
  legal,
  legalLinks = [],
  tone = "brand",
  className,
  ...props
}: SiteFooterProps) {
  const toneClasses = tones[tone]
  const linkClass = cn("rounded-sm text-sm font-medium outline-none hover:underline underline-offset-4 focus-visible:ring-3", toneClasses.link, toneClasses.focus)

  return (
    <footer data-slot="site-footer" data-tone={tone} className={cn("w-full px-6 py-12 md:px-10", toneClasses.root, className)} {...props}>
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        <div className="flex flex-col gap-6 lg:w-2/5">
          <a href={homeHref} className={cn("w-fit rounded-xl outline-none focus-visible:ring-3", toneClasses.focus)}>
            {/* An empty, labelled slot: the product's own mark goes here. */}
            <span role="img" aria-label={`${brandName} logo`} className={cn("block size-10 rounded-xl", toneClasses.slot)} />
          </a>
          {tagline && tone === "brand" ? (
            <p className="max-w-md font-grotesk text-display-sm uppercase md:text-display-md">{tagline}</p>
          ) : null}
        </div>

        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {columns.map((column) => {
            return (
              <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
                <h2 className={cn("text-xs font-semibold tracking-wide uppercase", toneClasses.title)}>
                  {column.title}
                </h2>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <a href={link.href} className={linkClass}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )
          })}
        </div>
      </div>

      <div className={cn("mt-12 flex flex-col-reverse gap-6 border-t pt-6 md:flex-row md:items-center", toneClasses.rule)}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <p>{legal}</p>
          {legalLinks.length ? (
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {legalLinks.map((link) => (
                <li key={link.href + link.label}>
                  <a href={link.href} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {socials.length ? (
          <ul className="flex gap-2 md:ml-auto" aria-label={`${brandName} elsewhere`}>
            {socials.map((social) => (
              <li key={social.href}>
                {/* A real link with button looks: Base UI's Button would announce it as a button. */}
                <a
                  href={social.href}
                  aria-label={social.label}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon-sm" }),
                    "rounded-full hover:brightness-80 active:brightness-60",
                    toneClasses.social,
                    toneClasses.focus
                  )}
                >
                  <Icon name={social.icon} />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </footer>
  )
}

export { SiteFooter }
