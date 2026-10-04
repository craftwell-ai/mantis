"use client"

import { useId, useState } from "react"
import { cn } from "@/lib/mantis-cn"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Icon } from "@/components/ui/icon"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "./empty-state"
import { FeedPost, type FeedPostProps } from "./feed-post"
import { LightboxInspector, type LightboxItem } from "./lightbox-inspector"
import { MediaGrid, type MediaGridItem } from "./media-grid"
import { SAMPLE_BRAND_NAME, sampleNavigationWithoutBrand } from "./sample-content"
import { TopNavigation, type TopNavigationProps } from "./top-navigation"

export type ProfileWork = MediaGridItem & Pick<LightboxItem, "prompt" | "info">

export type ProfilePost = Omit<FeedPostProps, "className"> & { id: string }

export type ProfileTab = "generations" | "liked" | "posts"

export type ProfileIdentity = {
  name: string
  /** Shown with an @ in front. */
  handle: string
  bio?: string
  avatarSrc?: string
  location?: string
  /** Counts already formatted for people, such as "12.4K". Two to four. */
  stats: { label: string; value: string }[]
}

export interface ProfilePageProps {
  brandName?: string
  /** Everything the top bar needs except the brand name. */
  navigation?: Omit<TopNavigationProps, "brandName">
  profile?: ProfileIdentity
  /** The viewer is looking at their own profile: Edit profile replaces Follow, and empty states invite them to start. */
  isOwnProfile?: boolean
  /** Whether the viewer follows this person. Ignored on your own profile. */
  defaultFollowing?: boolean
  onFollowChange?: (following: boolean) => void
  onEditProfile?: () => void
  onShareProfile?: () => void
  generations?: ProfileWork[]
  liked?: ProfileWork[]
  posts?: ProfilePost[]
  defaultTab?: ProfileTab
  /** Where the empty Generations tab sends you to make something, on your own profile. */
  createHref?: string
  /** Where the empty Liked tab sends you to find work, on your own profile. */
  exploreHref?: string
  /** Opens the post composer from the empty Posts tab, on your own profile. */
  onNewPost?: () => void
  onRecreate?: (item: ProfileWork) => void
  recreateCost?: number
  className?: string
}

function sampleWork(seed: string, alt: string, width: number, height: number, author: string, prompt: string): ProfileWork {
  return {
    id: seed,
    src: `https://picsum.photos/seed/${seed}/${width}/${height}`,
    alt,
    width,
    height,
    author: { name: author },
    likes: 80 + seed.length * 41,
    prompt,
    info: [
      { label: "Model", value: "Lumen Photo 2" },
      { label: "Size", value: `${width * 2} × ${height * 2}` },
      { label: "Created", value: "Sep 29, 2026" },
    ],
  }
}

const DEFAULT_PROFILE: ProfileIdentity = {
  name: "Mira Okafor",
  handle: "miraframes",
  bio: "Cinematographer turned prompt writer. I make quiet coastal scenes and the occasional neon city at 3am.",
  location: "Lisbon",
  stats: [
    { label: "Generations", value: "1,284" },
    { label: "Followers", value: "12.4K" },
    { label: "Following", value: "318" },
  ],
}

const DEFAULT_GENERATIONS: ProfileWork[] = [
  sampleWork("harbor", "Fishing boats in a harbor at blue hour", 800, 600, "Mira Okafor", "A quiet harbor at blue hour, wooden fishing boats rocking on glassy water, warm cabin lights reflected in long streaks."),
  sampleWork("cliffwalk", "Walker on a cliff path above the sea", 600, 800, "Mira Okafor", "A lone walker on a cliff path above a grey sea, wind in the grass, the horizon soft with spray."),
  sampleWork("neonrain", "Neon shop signs in the rain", 600, 900, "Mira Okafor", "Neon shop signs blurred by rain on a narrow street at 3am, a cyclist passing, puddles holding the colors."),
  sampleWork("tidepool", "Starfish in a clear tide pool", 800, 800, "Mira Okafor", "Overhead shot of a clear tide pool, an orange starfish among green anemones, ripples catching the sun."),
  sampleWork("ferry", "Ferry crossing a misty bay", 900, 600, "Mira Okafor", "A small white ferry crossing a misty bay at dawn, gulls following, hills fading into fog."),
  sampleWork("boathouse", "Wooden boathouse at dusk", 600, 750, "Mira Okafor", "An old wooden boathouse on stilts at dusk, one lamp lit inside, still water mirroring the scene."),
]

const DEFAULT_LIKED: ProfileWork[] = [
  sampleWork("glasshouse", "Glasshouse full of ferns", 600, 800, "Tomas Lindqvist", "A Victorian glasshouse overflowing with ferns, condensation on the panes, soft green light."),
  sampleWork("saltflat", "Salt flat reflecting the sky", 900, 600, "Ana Ruiz", "A salt flat after rain reflecting a pink sky, two tiny figures walking toward the horizon."),
  sampleWork("jazzbar", "Saxophonist in a dim jazz bar", 600, 900, "Kenji Mori", "A saxophonist under a single spotlight in a dim jazz bar, smoke curling through the beam."),
]

const DEFAULT_POSTS: ProfilePost[] = [
  {
    id: "post-1",
    author: { name: "Mira Okafor" },
    postedAt: "2d ago",
    title: "Three ways to keep fog from turning grey",
    text: "Name the light source and its color before you mention fog. \"Warm cabin light through fog\" keeps the haze glowing instead of flat.",
    media: [{ src: "https://picsum.photos/seed/fogtest/1200/675", alt: "Harbor in warm fog, the result of the tip" }],
    likes: 482,
    comments: 37,
    views: 9100,
  },
  {
    id: "post-2",
    author: { name: "Mira Okafor" },
    postedAt: "1w ago",
    text: "Started a series of coastal towns at blue hour. Here are the first two, more on Friday.",
    media: [
      { src: "https://picsum.photos/seed/bluehour1/800/800", alt: "Coastal town at blue hour, first in the series" },
      { src: "https://picsum.photos/seed/bluehour2/800/800", alt: "Second coastal town at blue hour" },
    ],
    likes: 1240,
    comments: 88,
    views: 22400,
  },
]

// The same sample bar as every other template, so the sample product reads as one app.
const DEFAULT_NAVIGATION = sampleNavigationWithoutBrand()

// A person's page: who they are in a sidebar (or on top, on phones), and
// their work in three tabs. Every tab has its own empty state, worded for
// the owner (with a way to start) or for a visitor (no action).
function ProfilePage({
  brandName = SAMPLE_BRAND_NAME,
  navigation = DEFAULT_NAVIGATION,
  profile = DEFAULT_PROFILE,
  isOwnProfile = false,
  defaultFollowing = false,
  onFollowChange,
  onEditProfile,
  onShareProfile,
  generations = DEFAULT_GENERATIONS,
  liked = DEFAULT_LIKED,
  posts = DEFAULT_POSTS,
  defaultTab = "generations",
  createHref = "/image",
  exploreHref = "/explore",
  onNewPost,
  onRecreate,
  recreateCost,
  className,
}: ProfilePageProps) {
  const [following, setFollowing] = useState(defaultFollowing)
  const [viewer, setViewer] = useState<{ items: ProfileWork[]; index: number; open: boolean }>({ items: [], index: 0, open: false })
  const nameId = useId()
  const firstName = profile.name.split(/\s+/)[0]
  const initials = profile.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)

  function openIn(list: ProfileWork[]) {
    return (item: MediaGridItem) =>
      setViewer({ items: list, index: Math.max(0, list.findIndex((entry) => entry.id === item.id)), open: true })
  }

  const tabs: { id: ProfileTab; label: string; count: number }[] = [
    { id: "generations", label: "Generations", count: generations.length },
    { id: "liked", label: "Liked", count: liked.length },
    { id: "posts", label: "Posts", count: posts.length },
  ]

  // Lays the masonry out in four columns at most: the sidebar takes a share of the width.
  const gridClass = "xl:[&_ul]:columns-4"
  // Lime when the empty state starts something new (Start creating); white when it only browses.
  const startLink = (href: string, label: string, variant: "brand" | "default" = "default") => (
    <a href={href} className={cn(buttonVariants({ variant }), "hover:brightness-80 active:brightness-60")}>
      {label}
    </a>
  )

  return (
    <div data-slot="profile-page" className={cn("flex min-h-dvh w-full flex-col bg-background", className)}>
      <TopNavigation brandName={brandName} {...navigation} className="sticky top-0 z-20" />

      <main className="flex flex-1 flex-col gap-6 px-4 pt-4 pb-12 lg:flex-row lg:items-start">
        <aside
          aria-labelledby={nameId}
          className="flex flex-col gap-5 rounded-2xl bg-card p-5 lg:sticky lg:top-18 lg:w-80 lg:shrink-0"
        >
          <div className="flex items-center gap-4 lg:flex-col lg:items-start">
            <Avatar className="size-20 lg:size-24">
              {profile.avatarSrc ? <AvatarImage src={profile.avatarSrc} alt="" /> : null}
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-1">
              <Heading id={nameId} level="sub" render={<h1 />} className="break-words">
                {profile.name}
              </Heading>
              <p className="truncate text-sm text-muted-foreground">@{profile.handle}</p>
            </div>
          </div>

          {profile.bio ? <p className="text-sm text-pretty text-foreground">{profile.bio}</p> : null}
          {profile.location ? (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon name="location_on" />
              {profile.location}
            </p>
          ) : null}

          <dl className="grid grid-cols-3 gap-2 border-y border-separator py-4">
            {profile.stats.map((stat) => (
              // dt first for screen readers; the number reads first on screen.
              <div key={stat.label} className="flex flex-col-reverse items-center gap-0.5 text-center">
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                <dd className="text-base font-semibold text-foreground tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex gap-2">
            {isOwnProfile ? (
              <Button className="flex-1" onClick={onEditProfile}>
                <Icon name="edit" />
                Edit profile
              </Button>
            ) : (
              <Button
                // Following someone is a visitor's main action here, so it is lime until it is done.
                variant={following ? "secondary" : "brand"}
                className="flex-1"
                aria-pressed={following}
                onClick={() => {
                  setFollowing(!following)
                  onFollowChange?.(!following)
                }}
              >
                <Icon name={following ? "check" : "person_add"} />
                {following ? "Following" : "Follow"}
              </Button>
            )}
            <Button variant="glass" size="icon" aria-label={`Share ${firstName}'s profile`} onClick={onShareProfile}>
              <Icon name="share" />
            </Button>
          </div>
        </aside>

        <Tabs defaultValue={defaultTab} className="min-w-0 flex-1 gap-4">
          <div className="overflow-x-auto">
            <TabsList aria-label={`${firstName}'s work`}>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex-none">
                  {tab.label}
                  <span className="text-xs text-muted-foreground tabular-nums">{tab.count}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="generations">
            <h2 className="sr-only">Generations</h2>
            <MediaGrid
              label={`${firstName}'s generations`}
              items={generations}
              onOpen={openIn(generations)}
              className={gridClass}
              empty={
                <EmptyState
                  icon="image"
                  title={isOwnProfile ? "You have not shared anything yet" : `${firstName} has not shared anything yet`}
                  description={
                    isOwnProfile
                      ? "Images and clips you publish show up here for everyone who visits your profile."
                      : "When they publish an image or clip, it will appear here."
                  }
                  headingTag="h3"
                  action={isOwnProfile ? startLink(createHref, "Start creating", "brand") : undefined}
                />
              }
            />
          </TabsContent>

          <TabsContent value="liked">
            <h2 className="sr-only">Liked</h2>
            <MediaGrid
              label={`Work ${firstName} liked`}
              items={liked}
              onOpen={openIn(liked)}
              className={gridClass}
              empty={
                <EmptyState
                  icon="favorite"
                  title={isOwnProfile ? "Nothing liked yet" : `${firstName} has not liked anything yet`}
                  description={
                    isOwnProfile
                      ? "Tap the heart on any picture in Explore to keep it here for later."
                      : "Pictures they like from the community will collect here."
                  }
                  headingTag="h3"
                  action={isOwnProfile ? startLink(exploreHref, "Browse Explore") : undefined}
                />
              }
            />
          </TabsContent>

          <TabsContent value="posts">
            <h2 className="sr-only">Posts</h2>
            {posts.length ? (
              <ul className="flex max-w-2xl flex-col gap-3">
                {posts.map(({ id, ...post }) => (
                  <li key={id}>
                    <FeedPost {...post} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon="forum"
                title={isOwnProfile ? "Write your first post" : `${firstName} has not posted yet`}
                description={
                  isOwnProfile
                    ? "Share a work in progress, a prompt tip or a finished piece with the people who follow you."
                    : "Their posts to the community will show up here."
                }
                headingTag="h3"
                action={
                  isOwnProfile && onNewPost ? (
                    <Button variant="brand" onClick={onNewPost}>
                      <Icon name="add" />
                      New post
                    </Button>
                  ) : undefined
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      <LightboxInspector
        items={viewer.items}
        index={viewer.index}
        onIndexChange={(index) => setViewer((current) => ({ ...current, index }))}
        open={viewer.open}
        onOpenChange={(open) => setViewer((current) => ({ ...current, open }))}
        recreateCost={recreateCost}
        onRecreate={
          onRecreate
            ? (item) => {
                const original = viewer.items.find((entry) => entry.id === item.id)
                if (original) onRecreate(original)
              }
            : undefined
        }
      />
    </div>
  )
}

export { ProfilePage }
