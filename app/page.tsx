import "./home.css"

import { BlockGallery } from "@/components/home/block-gallery"
import { ComponentTiles } from "@/components/home/component-tiles"
import { HeroCanvas } from "@/components/home/hero-canvas"
import { InstallBox } from "@/components/home/install-box"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heading, HeadingAccent } from "@/components/ui/heading"
import { Icon } from "@/components/ui/icon"
import { siteStats } from "@/lib/site-stats"
import { links, REGISTRY_ENTRY } from "@/lib/site"
import { AnnouncementBar } from "@/registry/announcement-bar"

// The public home page of the design system: what it is, how to install it, and what is in it.

const INSTALL_COMMAND = "npx shadcn@latest add @mantis/base"

const NAV = [
  { label: "Foundations", href: "#foundations" },
  { label: "Components", href: "#components" },
  { label: "Blocks", href: "#blocks" },
  { label: "For agents", href: "#agents" },
]

const BUILT_FOR = ["Claude Code", "Cursor"]

const SWATCHES = [
  { label: "page", className: "bg-background" },
  { label: "card", className: "bg-card" },
  { label: "field", className: "bg-secondary" },
  { label: "brand", className: "bg-brand" },
]

const TILE_PALETTE = ["bg-tile-blue", "bg-tile-purple", "bg-tile-pink", "bg-tile-orange", "bg-tile-mint", "bg-tile-brown"]

const TYPE_ROWS = [
  { sample: "Aa Display", family: "Space Grotesk", className: "font-grotesk text-display-md uppercase" },
  { sample: "Body and titles", family: "Inter", className: "text-lg font-medium" },
  { sample: "--brand: #d1fe17", family: "IBM Plex Mono", className: "font-mono text-base" },
]

const RADII = [
  { label: "8", className: "size-9 rounded-lg" },
  { label: "10", className: "size-12 rounded-control" },
  { label: "16", className: "size-16 rounded-2xl" },
  { label: "24", className: "size-20 rounded-4xl" },
]

const AGENT_FILES = [
  { name: "llms.txt", note: "The full catalog in one file", href: links.llms },
  { name: "design.md", note: "Visual intent and composition recipes", href: links.design },
  { name: "usage/<name>.md", note: "Per-component do, don't and accessibility", href: links.usage("button") },
]

const sectionClass = "mx-auto w-full max-w-7xl scroll-mt-16 px-6 pt-16 pb-24"

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-grotesk text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">{children}</p>
}

function FoundationCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-card-inset [--card-spacing:--spacing(6)]">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function Logo({ className }: { className?: string }) {
  // The wordmark is a wide SVG; its height is set by the caller and the width follows.
  // eslint-disable-next-line @next/next/no-img-element -- a small local SVG gains nothing from the image optimizer
  return <img src="/brand/mantis-logo.svg" alt="Mantis" className={className} />
}

export default function Home() {
  const stats = siteStats()
  const statRows = [
    { value: stats.components, label: "Components on Base UI" },
    { value: stats.blocks, label: "Blocks, installable one by one" },
    { value: stats.pages, label: "Full page templates" },
    { value: stats.icons, label: "Material Symbols icons" },
  ]
  const terminal = [
    { kind: "comment", text: "# Once: add Mantis to components.json, under \"registries\"" },
    { kind: "config", text: REGISTRY_ENTRY },
    { kind: "gap", text: "" },
    { kind: "comment", text: "# Theme and core components" },
    { kind: "command", text: "npx shadcn@latest add @mantis/base" },
    { kind: "gap", text: "" },
    { kind: "comment", text: "# Check the install worked" },
    { kind: "command", text: "npx shadcn@latest add @mantis/hello-card" },
    { kind: "gap", text: "" },
    { kind: "comment", text: "# Let agents search the registry" },
    { kind: "command", text: "npx shadcn@latest mcp init" },
    { kind: "gap", text: "" },
    { kind: "result", text: "✓ MANTIS.md installed with @mantis/base" },
    { kind: "result", text: `✓ ${stats.components} components · ${stats.blocks} blocks · ${stats.pages} pages` },
  ]

  return (
    <div id="top" className="home flex min-h-svh flex-col">
      <AnnouncementBar
        message="Point your coding agent at llms.txt and it builds with Mantis."
        actionLabel="See how"
        actionHref="#agents"
        dismissible={false}
      />

      <header className="sticky top-0 z-40 border-b border-border bg-background/82 backdrop-blur-glass">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-8 px-6">
          <a href="#top" className="shrink-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <Logo className="h-7.5 w-auto" />
          </a>
          <nav aria-label="Sections" className="flex items-center gap-1 overflow-x-auto">
            {NAV.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-(--duration-normal) outline-none hover:bg-glass focus-visible:ring-3 focus-visible:ring-ring/50 ${index === 0 ? "text-brand-text" : "text-foreground"}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex flex-col">
        <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
          <HeroCanvas className="absolute inset-0 -z-10 size-full" />
          <div aria-hidden="true" className="home-hero-vignette absolute inset-0 -z-10" />
          <div aria-hidden="true" className="home-hero-fade absolute inset-x-0 bottom-0 -z-10 h-40" />

          <div className="mx-auto flex w-full max-w-215 flex-col items-center gap-6 px-6 pt-30 pb-22 text-center">
            <a
              href="#agents"
              className="flex h-7.5 items-center gap-2 rounded-full bg-glass pr-3 pl-1.5 text-sm text-(color:--home-pill) transition-[filter] duration-(--duration-normal) outline-none hover:brightness-80 focus-visible:ring-3 focus-visible:ring-ring/50 active:brightness-60"
            >
              <Badge variant="new">New</Badge>
              Agents read Mantis from llms.txt
              <Icon name="arrow_forward" />
            </a>
            <Heading level="hero" id="hero-title" className="home-hero-title">
              Build the next generation of <HeadingAccent>AI products</HeadingAccent>
            </Heading>
            <p className="max-w-150 text-lg leading-relaxed text-(color:--home-body)">
              Mantis is a futuristic design system for AI-powered creative tools and studios. Install components and whole
              studio pages with one command, by hand or by prompting your coding agent.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href="#foundations" className={buttonVariants({ variant: "brand", depth: "raised", size: "xl" })}>
                View foundations
                <Icon name="arrow_forward" />
              </a>
              <a href={links.storybook} className={buttonVariants({ variant: "glass", size: "xl" })}>
                <Icon name="play_circle" />
                Browse in Storybook
              </a>
            </div>
            <InstallBox id="install" command={INSTALL_COMMAND} />
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Built for</span>
              <ul className="flex flex-wrap items-center justify-center gap-2">
                {BUILT_FOR.map((tool) => (
                  <li key={tool} className="flex h-6.5 items-center rounded-full border border-divider px-2.5 text-foreground">
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mx-auto w-full max-w-7xl px-6">
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(--spacing(50),1fr))] items-start gap-x-6 border-y border-border">
              {statRows.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse items-center gap-1 py-9 text-center">
                  <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                  <dd className="font-grotesk text-4xl font-bold">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="foundations" aria-labelledby="foundations-title" className={sectionClass}>
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <Eyebrow>01 · Foundations</Eyebrow>
              <Heading id="foundations-title" className="max-w-150">
                Quiet surfaces, <HeadingAccent>one</HeadingAccent> bold color
              </Heading>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <FoundationCard title="Color" description="Surfaces get lighter as they come forward. Lime marks the one action that matters.">
                <div className="flex flex-col gap-4">
                  <ul className="grid grid-cols-4 gap-2">
                    {SWATCHES.map((swatch) => (
                      <li key={swatch.label} className="flex flex-col gap-2">
                        <div className={`h-20 rounded-xl border border-divider ${swatch.className}`} />
                        <span className="font-mono text-xs text-muted-foreground">{swatch.label}</span>
                      </li>
                    ))}
                  </ul>
                  <div aria-hidden="true" className="flex gap-1">
                    {TILE_PALETTE.map((color) => (
                      <span key={color} className={`h-2 flex-1 rounded-full ${color}`} />
                    ))}
                  </div>
                </div>
              </FoundationCard>
              <FoundationCard title="Type" description="Bold uppercase headlines with calm, easy-to-read body text.">
                <ul className="flex flex-col divide-y divide-border">
                  {TYPE_ROWS.map((row) => (
                    <li key={row.family} className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0">
                      <span className={row.className}>{row.sample}</span>
                      <span className="font-mono text-xs text-muted-foreground">{row.family}</span>
                    </li>
                  ))}
                </ul>
              </FoundationCard>
              <FoundationCard
                title="Shape"
                description="Corners get rounder as things get bigger: chips 8px, controls 10px, cards 16px, dialogs 24px."
              >
                <ul className="flex items-end gap-3">
                  {RADII.map((radius) => (
                    <li key={radius.label} className="flex flex-col items-center gap-2">
                      <div className={`border border-divider bg-secondary ${radius.className}`} />
                      <span className="font-mono text-xs text-muted-foreground">{radius.label}</span>
                    </li>
                  ))}
                </ul>
              </FoundationCard>
              <FoundationCard
                title="Motion"
                description="Buttons dim a little on hover and a little more on press. Feedback is clear, never jumpy."
              >
                <div className="flex h-full flex-wrap items-end gap-2">
                  <Button size="lg">Hover me</Button>
                  <Button size="lg" variant="glass">
                    Press me
                  </Button>
                </div>
              </FoundationCard>
            </div>
          </div>
        </section>

        <section id="components" aria-labelledby="components-title" className={sectionClass}>
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <Eyebrow>02 · Components</Eyebrow>
              <Heading id="components-title" className="max-w-150">
                Compact controls for <HeadingAccent>busy</HeadingAccent> screens
              </Heading>
            </div>
            <ComponentTiles />
          </div>
        </section>

        <section id="blocks" aria-labelledby="blocks-title" className={sectionClass}>
          <BlockGallery
            blockCount={stats.blocks}
            pageCount={stats.pages}
            heading={
              <div className="flex flex-col gap-3">
                <Eyebrow>03 · Blocks and pages</Eyebrow>
                <Heading id="blocks-title" className="max-w-150">
                  Start from a <HeadingAccent>block</HeadingAccent>, not a blank page
                </Heading>
              </div>
            }
          />
        </section>

        <section id="agents" aria-labelledby="agents-title" className={sectionClass}>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Eyebrow>04 · For agents</Eyebrow>
                <Heading id="agents-title">
                  Optimized for agents to <HeadingAccent>build</HeadingAccent>
                </Heading>
              </div>
              <p className="max-w-130 text-base leading-relaxed text-muted-foreground">
                Every component and block ships with a usage guide, do and don&apos;t rules, and token lists written for coding
                agents. Builds fail on off-brand colors, one-off sizes and the wrong icons, so agent-built screens stay as
                consistent as your team&apos;s.
              </p>
              <ul className="flex flex-col divide-y divide-border border-y border-border">
                {AGENT_FILES.map((file) => (
                  <li key={file.name}>
                    <a
                      href={file.href}
                      className="flex items-center justify-between gap-4 py-4 transition-[filter] duration-(--duration-normal) outline-none hover:brightness-80 focus-visible:ring-3 focus-visible:ring-ring/50 active:brightness-60"
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className="font-mono text-sm">{file.name}</span>
                        <span className="text-sm text-muted-foreground">{file.note}</span>
                      </span>
                      <Icon name="arrow_outward" className="text-muted-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <figure className="overflow-hidden rounded-3xl border border-border bg-dialog">
              <figcaption className="flex items-center gap-4 border-b border-border px-5 py-3.5">
                <span aria-hidden="true" className="flex gap-2">
                  <span className="size-2.5 rounded-full bg-secondary" />
                  <span className="size-2.5 rounded-full bg-secondary" />
                  <span className="size-2.5 rounded-full bg-secondary" />
                </span>
                <span className="font-mono text-sm text-muted-foreground">terminal</span>
              </figcaption>
              <div className="overflow-x-auto px-6 py-6 font-mono text-sm leading-loose">
                {terminal.map((line, index) =>
                  line.kind === "gap" ? (
                    <div key={index} aria-hidden="true" className="h-4" />
                  ) : (
                    <div key={index} className={`whitespace-nowrap ${line.kind === "command" || line.kind === "config" ? "text-foreground" : "text-muted-foreground"}`}>
                      {line.kind === "command" ? <span className="text-brand-text">$ </span> : null}
                      {line.text}
                    </div>
                  ),
                )}
              </div>
            </figure>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-10">
          <div className="flex flex-wrap items-center gap-4">
            <Logo className="h-4 w-auto" />
            <p className="text-sm text-muted-foreground">Tokens, components and patterns for AI creative tools.</p>
          </div>
          <span className="font-mono text-xs text-muted-foreground">v{stats.version}</span>
        </div>
      </footer>
    </div>
  )
}
