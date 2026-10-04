/* eslint-disable @next/next/no-img-element -- placeholder Picsum photos: next/image would make every app allow-list that host first */
// Placeholder content for the page templates, like the sample text baked into
// a Figma component: render a template with no props and it shows a complete,
// believable page for an invented product, Lumen. Every template prop that a
// real app must fill falls back to something in this file. Replace all of it
// with your own data before shipping; none of these people or numbers are real.
//
// Types are written out here instead of imported from the templates, so this
// file can be installed on its own without pulling every template in with it.
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import type { IconName } from "@/components/ui/icon"
import { MediaTile } from "@/components/ui/media-tile"
// Relative on purpose: shadcn installs blocks side by side and leaves relative imports alone.
import { AccountMenu, type AccountMenuProps } from "./account-menu"
import type { GenerationFeedItem } from "./generation-feed"
import type { ProjectCardProps } from "./project-card"
import type { PromptComposerModel, PromptComposerProps } from "./prompt-composer"
import type { Session } from "./session-list"
import type { SiteFooterProps } from "./site-footer"
import type { StudioModel, StudioSettingsPanelProps } from "./studio-settings-panel"
import type { TopNavigationLink, TopNavigationProps } from "./top-navigation"
import type { UsageCategory, UsageEntry, UsageSummaryProps } from "./usage-summary"

/** A Lorem Picsum photo that stays the same for a given seed. */
export const picsum = (seed: string, width: number, height: number) => `https://picsum.photos/seed/${seed}/${width}/${height}`

// ---------------------------------------------------------------------------
// The product and the signed-in person
// ---------------------------------------------------------------------------

export const SAMPLE_BRAND_NAME = "Lumen"

/** Credits left: the account below has used 1,760 of 3,000. */
export const SAMPLE_CREDITS = 1240

export const SAMPLE_ACCOUNT: AccountMenuProps = {
  user: { name: "Maya Okafor", email: "maya@northlight.studio", plan: "Creator", avatarSrc: picsum("avatar", 96, 96) },
  credits: { used: 1760, total: 3000 },
  upsells: [{ icon: "add_circle", label: "Top up credits", actionLabel: "Buy" }],
}

export const SAMPLE_NAV_LINKS: TopNavigationLink[] = [
  { label: "Explore", href: "/explore" },
  { label: "Image", href: "/image" },
  { label: "Video", href: "/video" },
  { label: "Motion", href: "/motion", badge: "New" },
  { label: "Projects", href: "/projects" },
]

/** The top bar without its brand name, for templates that take `brandName` on its own. */
export function sampleNavigationWithoutBrand(activeHref?: string): Omit<TopNavigationProps, "brandName"> {
  return {
    links: SAMPLE_NAV_LINKS,
    // Left out rather than undefined, so a template's own activeHref is not overwritten by a spread.
    ...(activeHref ? { activeHref } : {}),
    onSearch: () => {},
    pricing: { label: "Pricing", href: "/pricing", saleTag: "30% off" },
    assetsHref: "/assets",
    credits: SAMPLE_CREDITS,
    creditsHref: "/usage",
    account: <AccountMenu {...SAMPLE_ACCOUNT} />,
  }
}

/** The signed-in top bar; `activeHref` marks the page being shown. */
export function sampleNavigation(activeHref?: string): TopNavigationProps {
  return { brandName: SAMPLE_BRAND_NAME, ...sampleNavigationWithoutBrand(activeHref) }
}

export const SAMPLE_FOOTER: Omit<SiteFooterProps, "brandName"> = {
  tagline: "Every frame you imagine, made in minutes",
  columns: [
    {
      title: "Create",
      links: [
        { label: "Image studio", href: "/image" },
        { label: "Video studio", href: "/video" },
        { label: "Motion presets", href: "/motion" },
        { label: "Canvas", href: "/canvas" },
      ],
    },
    {
      title: "Learn",
      links: [
        { label: "Guides", href: "/guides" },
        { label: "Prompt library", href: "/prompts" },
        { label: "Changelog", href: "/changelog" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Plans",
      links: [
        { label: "Pricing", href: "/pricing" },
        { label: "Teams", href: "/teams" },
        { label: "Education", href: "/education" },
      ],
    },
  ],
  socials: [
    { label: "Video channel", href: "/social/video", icon: "smart_display" },
    { label: "Photo feed", href: "/social/photos", icon: "photo_camera" },
    { label: "Community forum", href: "/community", icon: "forum" },
  ],
  legal: "© 2026 Lumen Labs, Inc.",
  legalLinks: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
}

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

export const SAMPLE_IMAGE_MODELS: PromptComposerModel[] = [
  { value: "draft", label: "Draft", creditsPerImage: 1 },
  { value: "standard", label: "Standard", creditsPerImage: 2 },
  { value: "detail", label: "Detail", creditsPerImage: 4 },
]

export const SAMPLE_VIDEO_MODELS: StudioModel[] = [
  { value: "lumen-3", label: "Lumen 3", description: "Smooth camera moves and lifelike light, up to 10 seconds", icon: "movie", featured: true, badge: "new", creditsPerSecond: 3 },
  { value: "ember-fast", label: "Ember Fast", description: "Quick drafts in seconds, for testing an idea", icon: "bolt", featured: true, creditsPerSecond: 1 },
  { value: "loop-studio", label: "Loop Studio", description: "Seamless short loops for backgrounds and social posts", icon: "animation", creditsPerSecond: 2 },
]

// ---------------------------------------------------------------------------
// Image studio and studio home
// ---------------------------------------------------------------------------

/** The image composer, set up with the sample models and balance. */
export const SAMPLE_IMAGE_COMPOSER: PromptComposerProps = {
  models: SAMPLE_IMAGE_MODELS,
  defaultModel: "standard",
  creditBalance: SAMPLE_CREDITS,
  onGenerate: () => {},
}

export const SAMPLE_GENERATIONS: GenerationFeedItem[] = [
  ["harbor", "Fishing boats moored in a harbor at dusk", "A quiet harbor at blue hour, wooden boats on glassy water, warm cabin lights in long reflections, light fog.", "2 min ago"],
  ["atrium", "Sunlit concrete atrium with hanging plants", "Brutalist concrete atrium in late afternoon sun, trailing plants on every balcony, one figure crossing the courtyard.", "14 min ago"],
  ["ceramics", "Glazed ceramic bowls stacked on a workbench", "Hand-thrown bowls with a drippy green glaze on a flour-dusted workbench, soft window light.", "1 hour ago"],
  ["canyon", "Red canyon walls under a stormy sky", "Slot canyon walls glowing red under a breaking storm, wide angle, dust catching the light.", "yesterday"],
  ["tram", "A vintage tram on a rainy city street", "A green tram turning a corner on a rain-soaked cobbled street at night, shop signs reflected in puddles.", "Sep 30"],
  ["orchard", "Rows of apple trees in morning mist", "An apple orchard at sunrise, mist between the rows, a ladder leaning on one tree.", "Sep 29"],
  ["studio", "A painter’s studio with canvases against the wall", "A cluttered painter’s studio, north light, half-finished portraits leaning on the wall.", "Sep 28"],
  ["dunes", "Wind-shaped sand dunes at noon", "Pale dunes under a hard noon sun, ripples in the sand, a single line of footprints.", "Sep 27"],
].map(([id, alt, prompt, createdAt]) => ({
  id,
  src: picsum(id, 800, 800),
  alt,
  prompt,
  model: "Standard",
  settings: ["1:1", "2 images"],
  createdAt,
}))

/** A project on studio home: a project card's props plus a stable id. */
export type SampleProject = Omit<ProjectCardProps, "className"> & { id: string }

export const SAMPLE_PROJECTS: SampleProject[] = [
  ["night-market", "Night Market Teaser", "2 hours ago"],
  ["spring-catalog", "Spring Catalog Stills", "yesterday"],
  ["coffee-launch", "Cold Brew Launch Ads", "Sep 30"],
  ["album-cover", "Album Cover Drafts", "Sep 28"],
  ["travel-reel", "Lisbon Travel Reel", "Sep 24"],
].map(([id, name, lastEdited]) => ({
  id,
  name,
  lastEdited,
  thumbnail: { src: picsum(`project-${id}`, 640, 360) },
  href: `#${id}`,
  onRename: () => {},
  onDuplicate: () => {},
  onDelete: () => {},
}))

// ---------------------------------------------------------------------------
// Video studio
// ---------------------------------------------------------------------------

/** The video settings rail, with the sample models, a chosen preset and the balance. */
export const SAMPLE_VIDEO_SETTINGS: StudioSettingsPanelProps = {
  models: SAMPLE_VIDEO_MODELS,
  preset: { title: "Slow dolly in", description: "The camera glides toward the subject", image: picsum("preset", 704, 256), imageAlt: "Placeholder frame for the selected preset" },
  onChangePreset: () => {},
  onAddReference: () => {},
  creditBalance: SAMPLE_CREDITS,
  onGenerate: () => {},
}

export type SampleClip = {
  id: string
  posterSrc: string
  alt: string
  prompt: string
  model: string
  settings: string[]
  createdAt: string
}

export const SAMPLE_CLIPS: SampleClip[] = [
  ["ferry", "A ferry pulling away from a pier at sunset", "The camera rises slowly from the pier as the ferry pulls away, gulls crossing the low sun, water glittering.", "3 min ago"],
  ["market", "A night market street lit by paper lanterns", "Slow push down a crowded night market, lantern light swaying, steam rising from food stalls.", "20 min ago"],
  ["glacier", "Blue glacier ice cracking into the sea", "Wide shot of a glacier face, a slab of blue ice breaking away and crashing into the water.", "1 hour ago"],
  ["dancer", "A dancer turning in an empty warehouse", "A dancer spins in an empty warehouse, dust in the window light, the camera circling once.", "yesterday"],
  ["vineyard", "Drone shot over vineyard rows in autumn", "Drone glides low over autumn vineyard rows toward a stone farmhouse.", "Sep 29"],
].map(([id, alt, prompt, createdAt]) => ({
  id,
  posterSrc: picsum(`clip-${id}`, 1280, 720),
  alt,
  prompt,
  model: "Lumen 3",
  settings: ["5s", "16:9", "720p"],
  createdAt,
}))

// ---------------------------------------------------------------------------
// Asset library
// ---------------------------------------------------------------------------

export type SampleAsset = {
  id: string
  src: string
  alt: string
  name: string
  kind: "image" | "video" | "upload"
  detail?: string
  duration?: string
}

export const SAMPLE_ASSETS: SampleAsset[] = (
  [
    ["harbor-dusk", "Harbor at dusk", "Fishing boats in a harbor at dusk", "image", "2048 × 2048"],
    ["ferry-sunset", "Ferry leaving the pier", "A ferry leaving a pier at sunset", "video", "1280 × 720", "0:05"],
    ["product-mug", "mug-front.png", "A white ceramic mug on a plain table", "upload", "PNG · 2.4 MB"],
    ["ceramics", "Glazed bowls", "Glazed ceramic bowls on a workbench", "image", "2048 × 2048"],
    ["market-night", "Night market push-in", "A lantern-lit night market street", "video", "1920 × 1080", "0:08"],
    ["portrait-ref", "portrait-reference.jpg", "A portrait photo used as a face reference", "upload", "JPG · 1.1 MB"],
    ["canyon", "Canyon storm", "Red canyon walls under a stormy sky", "image", "1536 × 2048"],
    ["orchard", "Orchard in mist", "Apple trees in morning mist", "image", "2048 × 1536"],
    ["glacier", "Glacier calving", "Glacier ice breaking into the sea", "video", "1280 × 720", "0:10"],
    ["logo-sketch", "moodboard-03.webp", "A moodboard of fabric swatches", "upload", "WEBP · 860 KB"],
  ] as const
).map(([id, name, alt, kind, detail, duration]) => ({
  id,
  name,
  alt,
  kind,
  detail,
  duration,
  src: picsum(`asset-${id}`, 600, 600),
}))

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const SAMPLE_WORKSPACE_LABEL = "Northlight Studio workspace"

export type SampleSettingsProfile = {
  name: string
  username: string
  email: string
  avatarSrc?: string
  publishByDefault?: boolean
}

export const SAMPLE_SETTINGS_PROFILE: SampleSettingsProfile = {
  name: "Maya Okafor",
  username: "mayamakes",
  email: "maya@northlight.studio",
  avatarSrc: picsum("avatar", 160, 160),
  publishByDefault: false,
}

export const SAMPLE_SESSIONS: Session[] = [
  { id: "mac", device: "laptop", client: "Chrome", os: "macOS 15", location: "Lisbon, Portugal", lastActive: "Active now", current: true },
  { id: "iphone", device: "phone", client: "Safari", os: "iOS 18", location: "Lisbon, Portugal", lastActive: "2 hours ago" },
  { id: "studio-pc", device: "desktop", client: "Firefox", os: "Windows 11", location: "Berlin, Germany", lastActive: "Sep 21" },
]

const USAGE_CATEGORIES: UsageCategory[] = [
  { id: "image", label: "Image studio", credits: 412 },
  { id: "video", label: "Video studio", credits: 268 },
  { id: "upscale", label: "Upscaler", credits: 96 },
  { id: "voice", label: "Voiceover", credits: 54 },
]

const USAGE_ENTRIES: UsageEntry[] = Array.from({ length: 12 }, (_, index) => ({
  id: `entry-${index}`,
  credits: [27, 8, 36, 12][index % 4],
  categoryId: USAGE_CATEGORIES[index % USAGE_CATEGORIES.length].id,
  action: index % 5 === 3 ? "refunded" : "spent",
  date: `Oct ${2 - Math.floor(index / 6)}, ${(index % 12) + 1}:${String((index * 7) % 60).padStart(2, "0")} PM`,
}))

export const SAMPLE_USAGE: UsageSummaryProps = {
  categories: USAGE_CATEGORIES,
  entries: USAGE_ENTRIES,
  stats: [{ label: "Generations", value: "64", icon: "image" }],
}

// ---------------------------------------------------------------------------
// Sidebar shell
// ---------------------------------------------------------------------------

export const SAMPLE_SIDEBAR_LABEL = "Studio"

export type SampleSidebarSection = {
  label?: string
  items: { label: string; href: string; icon: IconName; badge?: string }[]
}

export const SAMPLE_SIDEBAR_SECTIONS: SampleSidebarSection[] = [
  {
    items: [
      { label: "Overview", href: "#overview", icon: "grid_view" },
      { label: "Projects", href: "#projects", icon: "folder" },
      { label: "Generations", href: "#generations", icon: "photo_library" },
      { label: "Favorites", href: "#favorites", icon: "favorite" },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Image studio", href: "#image-studio", icon: "image" },
      { label: "Video studio", href: "#video-studio", icon: "movie" },
      { label: "Upscaler", href: "#upscaler", icon: "high_res" },
      { label: "Voiceover", href: "#voiceover", icon: "mic", badge: "New" },
    ],
  },
  {
    label: "Recent projects",
    items: [
      { label: "Autumn lookbook", href: "#autumn-lookbook", icon: "layers" },
      { label: "Product teaser", href: "#product-teaser", icon: "smart_display" },
      { label: "Storyboard draft", href: "#storyboard-draft", icon: "view_agenda" },
    ],
  },
]

// ---------------------------------------------------------------------------
// Canvas
// ---------------------------------------------------------------------------

export const SAMPLE_CANVAS_PROJECT_NAME = "Autumn lookbook"

export type SampleCanvasLayer = {
  id: string
  name: string
  kind: "image" | "video" | "text" | "shape" | "note"
  hidden?: boolean
  frame?: { x: number; y: number; width: number; height: number }
}

export const SAMPLE_CANVAS_LAYERS: SampleCanvasLayer[] = [
  { id: "hero", name: "Hero frame", kind: "image", frame: { x: 0, y: 0, width: 360, height: 240 } },
  { id: "detail", name: "Close-up detail", kind: "image", frame: { x: 392, y: 0, width: 200, height: 240 } },
  { id: "teaser", name: "Teaser clip", kind: "video", frame: { x: 0, y: 272, width: 280, height: 160 } },
  { id: "note", name: "Feedback note", kind: "note", frame: { x: 312, y: 272, width: 200, height: 140 } },
  { id: "title", name: "Board title", kind: "text", hidden: true },
]

const LIBRARY_SHOTS = ["harbor", "dunes", "neon", "forest", "studio", "portrait", "alley", "glacier", "market", "orchard", "tram", "canyon"]

/** Sample page for app-shell's content area: a library grid of past generations. */
export function SampleLibraryPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Heading level="title" render={<h1 />}>Your library</Heading>
          <p className="text-sm text-muted-foreground">Everything you generated this month, newest first.</p>
        </div>
        <Button variant="secondary" size="sm">Select</Button>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {LIBRARY_SHOTS.map((slug) => (
          <li key={slug}>
            <MediaTile aspect="portrait" radius="2xl" className="bg-card" src={picsum(slug, 480, 600)} alt={`Placeholder for a generated image (${slug})`} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Sample page for app-shell-sidebar's content area: a grid of project covers. */
export function SampleProjectsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <Heading level="title" render={<h1 />}>Projects</Heading>
        <p className="text-sm text-muted-foreground">Boards and sequences you are working on, most recently opened first.</p>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {["lookbook", "teaser", "storyboard", "portraits", "campaign", "moodboard"].map((slug) => (
          <li key={slug} className="flex flex-col gap-2">
            <MediaTile aspect="video" radius="2xl" className="bg-card" src={picsum(slug, 640, 400)} alt={`Placeholder cover for the ${slug} project`} />
            <p className="text-sm font-medium capitalize">{slug}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Sample board for canvas-shell: frames and a note. The shell has no canvas engine; a real app draws its own. */
export function SampleCanvasBoard() {
  return (
    <div className="relative h-108 w-148">
      <img src={picsum("hero", 720, 480)} alt="Placeholder for the hero frame" className="absolute top-0 left-0 h-60 w-90 rounded-xl object-cover ring-2 ring-ring" />
      <img src={picsum("detail", 400, 480)} alt="Placeholder for a close-up detail" className="absolute top-0 left-98 h-60 w-50 rounded-xl object-cover" />
      <img src={picsum("teaser", 560, 320)} alt="Placeholder for the teaser clip's first frame" className="absolute top-68 left-0 h-40 w-70 rounded-xl object-cover" />
      <div className="absolute top-68 left-78 flex h-35 w-50 flex-col gap-1 rounded-xl bg-card p-3 text-sm">
        <p className="font-medium">Feedback</p>
        <p className="text-muted-foreground">Warmer light on the hero, and try a slower push-in on the clip.</p>
      </div>
    </div>
  )
}
