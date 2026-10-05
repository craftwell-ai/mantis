"use client"

import dynamic from "next/dynamic"
import * as React from "react"

import { Pagination } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { links } from "@/lib/site"
import { Countdown } from "@/registry/countdown"
import { PlanMatrix, type PlanMatrixPlan, type PlanMatrixSection } from "@/registry/plan-matrix"
import { PromptComposer } from "@/registry/prompt-composer"
import { SAMPLE_IMAGE_COMPOSER, SAMPLE_USAGE, SAMPLE_VIDEO_SETTINGS } from "@/registry/sample-content"
import { StudioSettingsPanel } from "@/registry/studio-settings-panel"
import { UsageSummary } from "@/registry/usage-summary"

// Six whole pages are a lot of code, so they load only when the Page templates tab is opened.
const PagePreview = dynamic(() => import("./page-previews").then((module) => module.PagePreview), { ssr: false })

type GalleryItem = {
  slug: string
  title: string
  description: string
  /** Width the real block or page is rendered at before it is scaled down to the card. */
  stageWidth: number
  /** Blocks sit in the middle of the stage; pages start at its top edge. */
  centered: boolean
  render: () => React.ReactNode
}

// Sample plans for the preview only; a real pricing page passes its own.
const PREVIEW_PLANS: PlanMatrixPlan[] = [
  { id: "starter", name: "Starter", description: "For trying ideas out.", monthlyPrice: 12, yearlyPrice: 10, features: ["800 credits a month", "One generation at a time", "HD exports"] },
  { id: "creator", name: "Creator", description: "For publishing every week.", monthlyPrice: 29, yearlyPrice: 24, features: ["3,000 credits a month", "Four generations at once", "4K upscaling"] },
  { id: "studio", name: "Studio", description: "For small teams.", monthlyPrice: 79, yearlyPrice: 64, features: ["10,000 pooled credits", "Three seats included", "Shared brand kits"] },
]
const PREVIEW_SECTIONS: PlanMatrixSection[] = [
  {
    title: "Generation",
    rows: [
      { feature: "Monthly credits", values: { starter: "800", creator: "3,000", studio: "10,000" } },
      { feature: "Priority queue", values: { starter: false, creator: false, studio: true } },
    ],
  },
]

const PREVIEW_JOBS = [
  { name: "Neon bloom set", tool: "Image", status: "Done", credits: 48 },
  { name: "Tunnel push-in", tool: "Video", status: "Rendering", credits: 120 },
  { name: "Portrait retouch", tool: "Edit", status: "Done", credits: 12 },
  { name: "Upscale to 4K", tool: "Upscale", status: "Failed", credits: 0 },
]

function TablePreview() {
  return (
    <div className="flex w-180 flex-col gap-3 rounded-2xl bg-card p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job</TableHead>
            <TableHead>Tool</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Credits</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {PREVIEW_JOBS.map((job) => (
            <TableRow key={job.name}>
              <TableCell className="font-medium">{job.name}</TableCell>
              <TableCell>{job.tool}</TableCell>
              <TableCell>{job.status}</TableCell>
              <TableCell className="text-right tabular-nums">{job.credits}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination page={1} pageCount={8} onPageChange={() => {}} pageSize={10} pageSizes={[10, 25, 50]} onPageSizeChange={() => {}} />
    </div>
  )
}

function CountdownPreview() {
  // The deadline is set once, in the browser, so the server and client never disagree about the time.
  const [target] = React.useState(() => Date.now() + (2 * 60 + 14) * 60 * 1000)
  return <Countdown target={target} label="Launch pricing ends in" />
}

const BLOCKS: GalleryItem[] = [
  {
    slug: "prompt-composer",
    title: "Prompt composer",
    description: "Write a prompt, pick a model, size and count, then generate.",
    stageWidth: 800,
    centered: true,
    render: () => <PromptComposer {...SAMPLE_IMAGE_COMPOSER} className="w-180" />,
  },
  {
    slug: "countdown",
    title: "Countdown",
    description: "A real deadline shown as hour, minute and second tiles beside the offer it ends.",
    stageWidth: 440,
    centered: true,
    render: () => <CountdownPreview />,
  },
  {
    slug: "table",
    title: "Table + pagination",
    description: "Rows people scan and act on, with status in words, numbers aligned right and a compact pager.",
    stageWidth: 800,
    centered: true,
    render: () => <TablePreview />,
  },
  {
    slug: "plan-matrix",
    title: "Plan matrix",
    description: "Compare two to four plans with a monthly and yearly switch.",
    stageWidth: 1360,
    centered: false,
    render: () => (
      <div className="p-10">
        <PlanMatrix plans={PREVIEW_PLANS} sections={PREVIEW_SECTIONS} highlightedPlanId="creator" />
      </div>
    ),
  },
  {
    slug: "usage-summary",
    title: "Usage summary",
    description: "Credits spent this period, split by tool, with a daily history.",
    stageWidth: 1040,
    centered: false,
    render: () => (
      <div className="p-10">
        <UsageSummary {...SAMPLE_USAGE} />
      </div>
    ),
  },
  {
    slug: "studio-settings-panel",
    title: "Studio settings",
    description: "The column beside the canvas that sets up a video: preset, model, aspect, motion and sound.",
    stageWidth: 560,
    centered: false,
    // Taller than the card, so it shows from the top: preset, references and prompt.
    render: () => (
      <div className="flex justify-center pt-8">
        <StudioSettingsPanel {...SAMPLE_VIDEO_SETTINGS} className="w-88" />
      </div>
    ),
  },
]

const PAGES: GalleryItem[] = [
  { slug: "landing-page", title: "Landing page", description: "Hero, feature grid, how it works and the marketing footer.", stageWidth: 1280, centered: false, render: () => <PagePreview slug="landing-page" /> },
  { slug: "canvas-shell", title: "Canvas", description: "An infinite canvas with floating tools for wiring steps into a workflow.", stageWidth: 1280, centered: false, render: () => <PagePreview slug="canvas-shell" /> },
  { slug: "profile-page", title: "Profile", description: "Someone's public page: banner, stats, follow, and the posts they share.", stageWidth: 1280, centered: false, render: () => <PagePreview slug="profile-page" /> },
  { slug: "asset-library-page", title: "Asset library", description: "Uploads and saved elements in folders, with a list view and bulk actions.", stageWidth: 1280, centered: false, render: () => <PagePreview slug="asset-library-page" /> },
  { slug: "pricing-page", title: "Pricing", description: "Plans, a countdown offer and the plan matrix.", stageWidth: 1280, centered: false, render: () => <PagePreview slug="pricing-page" /> },
  { slug: "settings-page", title: "Settings", description: "Left nav with icon tiles and stacked settings cards.", stageWidth: 1280, centered: false, render: () => <PagePreview slug="settings-page" /> },
]

/**
 * Renders the real block or page at its working width, then scales it down to fit the card. The copy
 * is for looking at only: it is hidden from assistive technology and cannot be focused or clicked.
 */
function ScaledPreview({ item }: { item: GalleryItem }) {
  const frameRef = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(0)

  React.useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / item.stageWidth))
    observer.observe(frame)
    return () => observer.disconnect()
  }, [item.stageWidth])

  return (
    <div
      ref={frameRef}
      aria-hidden="true"
      inert
      className="pointer-events-none relative aspect-16/10 overflow-hidden rounded-2xl border border-border bg-background select-none"
    >
      {/* Nothing is rendered until the card has been measured, which also keeps it out of the server HTML. */}
      {scale > 0 ? (
        <div
          className={item.centered ? "absolute top-0 left-0 flex origin-top-left items-center justify-center" : "absolute top-0 left-0 origin-top-left"}
          style={{ width: item.stageWidth, height: (item.stageWidth * 10) / 16, transform: `scale(${scale})` }}
        >
          {item.render()}
        </div>
      ) : null}
    </div>
  )
}

function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <li className="group relative flex flex-col gap-3">
      <ScaledPreview item={item} />
      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-grotesk text-sm font-bold uppercase">
            {/* The link stretches over the whole card, so the picture is clickable too. */}
            <a href={links.usage(item.slug)} className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50">
              {item.title}
            </a>
          </h3>
          <span className="truncate font-mono text-xs text-muted-foreground">@mantis/{item.slug}</span>
        </div>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </div>
    </li>
  )
}

/** The blocks and page templates section: a heading, a two-way switch and a grid of live previews. */
function BlockGallery({ heading, blockCount, pageCount }: { heading: React.ReactNode; blockCount: number; pageCount: number }) {
  const [tab, setTab] = React.useState("blocks")
  const items = tab === "blocks" ? BLOCKS : PAGES

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        {heading}
        <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
          <TabsList variant="pill" aria-label="What to show">
            <TabsTrigger value="blocks">Blocks · {blockCount}</TabsTrigger>
            <TabsTrigger value="pages">Page templates · {pageCount}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,--spacing(80)),1fr))] gap-x-4 gap-y-6">
        {items.map((item) => (
          <GalleryCard key={item.slug} item={item} />
        ))}
      </ul>
    </div>
  )
}

export { BlockGallery }
