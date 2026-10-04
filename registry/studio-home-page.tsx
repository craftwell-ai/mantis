"use client"

import { useId, type ReactNode } from "react"
import { cn } from "@/lib/mantis-cn"

import { Button, buttonVariants } from "@/components/ui/button"
import { Heading, HeadingAccent } from "@/components/ui/heading"
import { Icon } from "@/components/ui/icon"
import { Skeleton } from "@/components/ui/skeleton"
// Relative on purpose: shadcn installs blocks side by side and leaves relative imports alone.
import { EmptyState } from "./empty-state"
import { ProjectCard, type ProjectCardProps } from "./project-card"
import { PromptComposer, type PromptComposerProps } from "./prompt-composer"
import { SAMPLE_IMAGE_COMPOSER, SAMPLE_PROJECTS, sampleNavigation } from "./sample-content"
import { TopNavigation, type TopNavigationProps } from "./top-navigation"

export type StudioHomeProject = Omit<ProjectCardProps, "className"> & { id: string }

export interface StudioHomePageProps {
  /** Everything the top bar needs; set `activeHref` to this page's link. Leave out to show the sample product's bar. */
  navigation?: TopNavigationProps
  /** The composer under the hero: models, credit balance, `generating` and `onGenerate`. Leave out for the sample models. */
  composer?: PromptComposerProps
  /** The person's projects, most recently edited first. Leave out for sample projects; pass `[]` for the empty state. */
  projects?: StudioHomeProject[]
  /** First load: the grid shows skeleton cards. */
  loading?: boolean
  /** Starts an empty project. Shown as the first tile of the grid and as the empty state's button. */
  onNewProject?: () => void
  /** Where "View all" goes. Leave out to hide the link. */
  allProjectsHref?: string
  /** The hero headline. Uppercase display type; wrap one word in `HeadingAccent` for lime. */
  heroTitle?: ReactNode
  /** One short line under the headline. */
  heroDescription?: ReactNode
  /** Heading of the projects section. */
  projectsTitle?: ReactNode
  className?: string
}

const SKELETON_COUNT = 6
const SAMPLE_NAVIGATION = sampleNavigation("/projects")

// Studio home (docs/inventory.md §4): an uppercase hero with one lime word,
// the composer right under it so the first thing to do is write, then the
// person's recent projects as a grid of project cards that opens with a
// dashed "New project" tile, or the empty state before there are any.
function StudioHomePage({
  navigation = SAMPLE_NAVIGATION,
  composer = SAMPLE_IMAGE_COMPOSER,
  projects = SAMPLE_PROJECTS,
  loading = false,
  onNewProject,
  allProjectsHref,
  heroTitle = (
    <>
      Every project starts with a <HeadingAccent>sentence</HeadingAccent>
    </>
  ),
  heroDescription = "Write what you want to see. Each idea gets its own project, so you can come back and keep going.",
  projectsTitle = "Recent projects",
  className,
}: StudioHomePageProps) {
  const projectsId = useId()
  const isEmpty = !loading && projects.length === 0

  return (
    <div data-slot="studio-home-page" className={cn("flex min-h-svh flex-col bg-background text-foreground", className)}>
      <TopNavigation {...navigation} />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 px-4 pt-12 pb-16 md:gap-16 md:pt-20">
        <section className="flex flex-col items-center gap-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <Heading level="hero" render={<h1 />} className="max-w-4xl">
              {heroTitle}
            </Heading>
            {heroDescription ? (
              <p className="max-w-md text-sm text-pretty text-muted-foreground md:text-base">{heroDescription}</p>
            ) : null}
          </div>
          <PromptComposer {...composer} className={cn("w-full max-w-3xl text-left", composer.className)} />
        </section>

        <section aria-labelledby={projectsId} aria-busy={loading || undefined} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h2 id={projectsId} className="text-title-md text-foreground">
              {projectsTitle}
            </h2>
            {allProjectsHref && !isEmpty ? (
              <a
                href={allProjectsHref}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "ml-auto hover:brightness-80 active:brightness-60")}
              >
                View all
                <Icon name="arrow_forward" />
              </a>
            ) : null}
          </div>

          {isEmpty ? (
            <EmptyState
              icon="folder"
              title="No projects yet"
              description="Generate from the composer above, or start an empty project to collect references and takes in one place."
              headingTag="h3"
              action={
                onNewProject ? (
                  // Glass, not white: the composer's lime Generate is already this view's filled button.
                  <Button variant="glass" onClick={onNewProject}>
                    <Icon name="add" />
                    New project
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {onNewProject && !loading ? (
                <li>
                  <NewProjectTile onClick={onNewProject} />
                </li>
              ) : null}
              {loading
                ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
                    <li key={index} className="flex flex-col gap-3">
                      <Skeleton className="aspect-video rounded-2xl" />
                      <Skeleton className="h-4 w-1/2" />
                    </li>
                  ))
                : projects.map(({ id, ...project }) => (
                    <li key={id}>
                      <ProjectCard {...project} />
                    </li>
                  ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}

// The grid's first tile, shaped like a project card so the row stays even.
function NewProjectTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/new flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-glass-border text-sm font-medium text-foreground outline-none transition-[filter,background-color] duration-(--duration-normal) hover:bg-glass active:brightness-60 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-glass text-xl">
        <Icon name="add" />
      </span>
      New project
    </button>
  )
}

export { StudioHomePage }
