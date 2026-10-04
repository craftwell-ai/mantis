import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { ProjectCard } from '@/registry/project-card'
import { usage } from '../usage/project-card.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Blocks / Project Card',
  component: ProjectCard,
  args: {
    className: 'w-72',
    name: 'Night Market Teaser',
    lastEdited: '2 hours ago',
    lastEditedDateTime: '2026-10-02T09:14:00Z',
    thumbnail: { src: 'https://picsum.photos/seed/project/640/360' },
    href: '#night-market-teaser',
    onRename: () => {},
    onDuplicate: () => {},
    onDelete: () => {},
  },
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof ProjectCard>

export default meta
type Story = StoryObj<typeof meta>

// Overlays are portaled to <body>, outside the story's canvas. They fade in
// and axe runs as soon as play ends, so wait for full opacity before ending.
async function openMenu(canvasElement: HTMLElement, projectName: string) {
  const page = within(canvasElement.ownerDocument.body)
  await userEvent.click(within(canvasElement).getByRole('button', { name: `More actions for ${projectName}` }))
  const menu = await page.findByRole('menu')
  await waitFor(() => expect(getComputedStyle(menu).opacity).toBe('1'))
  return page
}

async function waitUntilShown(element: HTMLElement) {
  await waitFor(() => expect(getComputedStyle(element).opacity).toBe('1'))
}

export const Default: Story = {}

export const WithoutThumbnail: Story = {
  args: { name: 'Paper Lantern Shorts', lastEdited: 'Sep 30', thumbnail: undefined },
}

export const LongName: Story = {
  args: { name: 'Autumn campaign: storefront loops, cutdowns and alternate endings', lastEdited: 'yesterday' },
}

export const MenuOpen: Story = {
  play: async ({ canvasElement }) => {
    const page = await openMenu(canvasElement, 'Night Market Teaser')
    await expect(page.getByRole('menuitem', { name: 'Rename' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeVisible()
  },
}

function RenamableCard() {
  const [name, setName] = useState('Night Market Teaser')
  return (
    <ProjectCard
      name={name}
      lastEdited="2 hours ago"
      thumbnail={{ src: 'https://picsum.photos/seed/project/640/360' }}
      onRename={setName}
      onDuplicate={() => {}}
      onDelete={() => {}}
    />
  )
}

export const Rename: Story = {
  render: () => <div className="w-72"><RenamableCard /></div>,
  play: async ({ canvasElement }) => {
    const page = await openMenu(canvasElement, 'Night Market Teaser')
    await userEvent.click(page.getByRole('menuitem', { name: 'Rename' }))
    const dialog = await page.findByRole('dialog', { name: 'Rename project' })
    await waitUntilShown(dialog)

    const field = page.getByLabelText('Project name')
    await expect(field).toHaveValue('Night Market Teaser')

    // An empty name is refused with a message tied to the field.
    await userEvent.clear(field)
    await userEvent.click(page.getByRole('button', { name: 'Save name' }))
    await expect(field).toHaveAccessibleDescription('Give the project a name so you can find it later.')

    await userEvent.type(field, 'Harbor Lights Reel')
    await userEvent.click(page.getByRole('button', { name: 'Save name' }))
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull())
    await expect(within(canvasElement).getByRole('heading', { name: 'Harbor Lights Reel' })).toBeVisible()
  },
}

export const DeleteConfirmation: Story = {
  play: async ({ canvasElement }) => {
    const page = await openMenu(canvasElement, 'Night Market Teaser')
    await userEvent.click(page.getByRole('menuitem', { name: 'Delete' }))
    const confirm = await page.findByRole('alertdialog', { name: 'Delete Night Market Teaser?' })
    await waitUntilShown(confirm)
    await expect(page.getByRole('button', { name: 'Keep project' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Delete project' })).toBeVisible()
  },
}

const PROJECTS = [
  { id: 'night-market', name: 'Night Market Teaser', lastEdited: '2 hours ago', seed: 'night-market' },
  { id: 'paper-lantern', name: 'Paper Lantern Shorts', lastEdited: 'yesterday', seed: 'paper-lantern' },
  { id: 'glass-harbor', name: 'Glass Harbor', lastEdited: 'Sep 28', seed: 'glass-harbor' },
]

function ProjectLibrary() {
  const [projects, setProjects] = useState(PROJECTS)
  return (
    <section aria-label="Your projects" className="grid w-200 grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          name={project.name}
          lastEdited={project.lastEdited}
          thumbnail={{ src: `https://picsum.photos/seed/${project.seed}/640/360` }}
          href={`#${project.id}`}
          onRename={(name) => setProjects((current) => current.map((item) => (item.id === project.id ? { ...item, name } : item)))}
          onDuplicate={() =>
            setProjects((current) => [
              ...current,
              { ...project, id: `${project.id}-copy-${current.length}`, name: `${project.name} copy`, lastEdited: 'just now' },
            ])
          }
          onDelete={() => setProjects((current) => current.filter((item) => item.id !== project.id))}
        />
      ))}
    </section>
  )
}

export const Library: Story = {
  parameters: { layout: 'padded' },
  render: () => <ProjectLibrary />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)

    // Duplicate acts at once, with no confirmation.
    let menuPage = await openMenu(canvasElement, 'Glass Harbor')
    await userEvent.click(menuPage.getByRole('menuitem', { name: 'Duplicate' }))
    await expect(await canvas.findByRole('heading', { name: 'Glass Harbor copy' })).toBeVisible()

    // Keeping the project leaves it in place.
    menuPage = await openMenu(canvasElement, 'Paper Lantern Shorts')
    await userEvent.click(menuPage.getByRole('menuitem', { name: 'Delete' }))
    await waitUntilShown(await page.findByRole('alertdialog'))
    await userEvent.click(page.getByRole('button', { name: 'Keep project' }))
    await waitFor(() => expect(page.queryByRole('alertdialog')).toBeNull())
    await expect(canvas.getByRole('heading', { name: 'Paper Lantern Shorts' })).toBeVisible()

    // Confirming removes it.
    menuPage = await openMenu(canvasElement, 'Paper Lantern Shorts')
    await userEvent.click(menuPage.getByRole('menuitem', { name: 'Delete' }))
    await waitUntilShown(await page.findByRole('alertdialog'))
    await userEvent.click(page.getByRole('button', { name: 'Delete project' }))
    await waitFor(() => expect(page.queryByRole('alertdialog')).toBeNull())
    await expect(canvas.queryByRole('heading', { name: 'Paper Lantern Shorts' })).toBeNull()
  },
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="max-w-3xl">
      <DoDontPair
        usage={usage}
        id="actions-in-the-menu"
        doExample={
          <ProjectCard
            name="Glass Harbor"
            lastEdited="Sep 28"
            thumbnail={{ src: 'https://picsum.photos/seed/glass-harbor/640/360' }}
            onRename={() => {}}
            onDuplicate={() => {}}
            onDelete={() => {}}
          />
        }
        dontExample={
          <div className="flex flex-col gap-3">
            <img src="https://picsum.photos/seed/glass-harbor/640/360" alt="" className="aspect-video w-full rounded-2xl object-cover" />
            <div className="px-1">
              <p className="text-sm font-medium">Glass Harbor</p>
              <p className="text-xs text-muted-foreground">Edited Sep 28</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline">
                <Icon name="edit" />
                Rename
              </Button>
              <Button size="sm" variant="outline">
                <Icon name="content_copy" />
                Duplicate
              </Button>
              <Button size="sm" variant="destructive">
                <Icon name="delete" />
                Delete
              </Button>
            </div>
          </div>
        }
      />
    </div>
  ),
}
