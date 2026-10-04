import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { LightboxInspector, type LightboxItem } from '@/registry/lightbox-inspector'
import { usage } from '../usage/lightbox-inspector.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const ITEMS: LightboxItem[] = [
  {
    id: 'harbor',
    src: 'https://picsum.photos/seed/harbor/1200/800',
    alt: 'Fishing boats moored in a harbor at dusk',
    prompt: 'A quiet harbor at blue hour, wooden fishing boats rocking on glassy water, warm cabin lights reflected in long streaks, light fog over the breakwater, shot on 35mm film.',
    author: { name: 'Mira Okafor' },
    info: [
      { label: 'Model', value: 'Lumen Photo 2' },
      { label: 'Size', value: '1536 × 1024' },
      { label: 'Seed', value: '48213' },
      { label: 'Created', value: 'Sep 30, 2026' },
    ],
  },
  {
    id: 'studio',
    src: 'https://picsum.photos/seed/studio/800/1200',
    alt: 'Portrait of a potter in her studio',
    prompt: 'Environmental portrait of a potter at her wheel, clay on her forearms, shelves of drying bowls behind her, north window light.',
    author: { name: 'Ana Ruiz' },
    info: [
      { label: 'Model', value: 'Lumen Photo 2' },
      { label: 'Size', value: '1024 × 1536' },
      { label: 'Seed', value: '90577' },
      { label: 'Created', value: 'Sep 28, 2026' },
    ],
  },
  {
    id: 'glacier',
    src: 'https://picsum.photos/seed/glacier/1000/1000',
    alt: 'Blue ice cave inside a glacier',
    prompt: 'Inside a glacier ice cave, translucent blue walls rippled like water, a lone climber with a headlamp for scale.',
    author: { name: 'Kenji Mori' },
    info: [
      { label: 'Model', value: 'Lumen Photo 2' },
      { label: 'Size', value: '1024 × 1024' },
      { label: 'Seed', value: '1204' },
      { label: 'Created', value: 'Sep 21, 2026' },
    ],
  },
]

function Viewer({ startOpen = true, withDelete = true }: { startOpen?: boolean; withDelete?: boolean }) {
  const [items, setItems] = useState(ITEMS)
  const [open, setOpen] = useState(startOpen)
  const [index, setIndex] = useState(0)
  return (
    <>
      <Button variant="glass" onClick={() => setOpen(true)}>
        Open viewer
      </Button>
      <LightboxInspector
        items={items}
        index={index}
        onIndexChange={setIndex}
        open={open}
        onOpenChange={setOpen}
        onRecreate={() => {}}
        recreateCost={4}
        onDownload={() => {}}
        onShare={() => {}}
        onUpscale={() => {}}
        onDelete={
          withDelete
            ? (item) => {
                setItems((current) => current.filter((entry) => entry.id !== item.id))
                setIndex((current) => Math.max(0, current - 1))
              }
            : undefined
        }
      />
    </>
  )
}

const meta = {
  title: 'Blocks / Lightbox Inspector',
  component: LightboxInspector,
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) }, story: { inline: false, height: '720px' } } },
} satisfies Meta<typeof LightboxInspector>

export default meta
type Story = StoryObj<typeof meta>

async function findViewer(canvasElement: HTMLElement) {
  const page = within(canvasElement.ownerDocument.body)
  const dialog = await page.findByRole('dialog')
  await waitFor(() => expect(getComputedStyle(dialog).opacity).toBe('1'))
  return { page, dialog: within(dialog) }
}

// Stories render the controlled block through a small wrapper that owns the state.
const ARGS = { items: ITEMS, index: 0, onIndexChange: () => {}, open: true, onOpenChange: () => {} }

export const Default: Story = {
  args: ARGS,
  render: () => <Viewer />,
  play: async ({ canvasElement }) => {
    const { dialog } = await findViewer(canvasElement)
    await expect(dialog.getByRole('heading', { name: 'Prompt' })).toBeVisible()
    await expect(dialog.getByText('48213')).toBeVisible()
  },
}

export const Closed: Story = {
  args: ARGS,
  render: () => <Viewer startOpen={false} />,
}

export const StepThrough: Story = {
  args: ARGS,
  render: () => <Viewer />,
  play: async ({ canvasElement }) => {
    const { dialog } = await findViewer(canvasElement)
    await expect(dialog.getByRole('button', { name: 'Previous' })).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(dialog.getByRole('button', { name: 'Next' }))
    await expect(dialog.getByText('2 of 3')).toBeVisible()
    await expect(dialog.getByText('Ana Ruiz')).toBeVisible()
    await userEvent.keyboard('{ArrowRight}')
    await expect(dialog.getByText('3 of 3')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Next' })).toHaveAttribute('aria-disabled', 'true')
    await userEvent.keyboard('{ArrowLeft}')
    await expect(dialog.getByText('2 of 3')).toBeVisible()
  },
}

export const DeleteConfirmation: Story = {
  args: ARGS,
  render: () => <Viewer />,
  play: async ({ canvasElement }) => {
    const { page, dialog } = await findViewer(canvasElement)
    await userEvent.click(dialog.getByRole('button', { name: 'Delete' }))
    const confirm = await page.findByRole('alertdialog', { name: 'Delete this image?' })
    await waitFor(() => expect(getComputedStyle(confirm).opacity).toBe('1'))
    await userEvent.click(page.getByRole('button', { name: 'Keep image' }))
    await waitFor(() => expect(page.queryByRole('alertdialog')).toBeNull())
    await expect(dialog.getByText('1 of 3')).toBeVisible()
  },
}

export const DoDont: Story = {
  args: ARGS,
  parameters: { layout: 'padded' },
  render: () => (
    <div className="max-w-3xl">
      <DoDontPair
        usage={usage}
        id="recreate-is-the-lime-one"
        doExample={
          <div className="flex flex-col gap-2 rounded-2xl bg-card p-3">
            <Button variant="brand" depth="glossy" size="lg">
              <Icon name="autorenew" />
              Recreate
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="glass"><Icon name="download" />Download</Button>
              <Button variant="glass"><Icon name="share" />Share</Button>
            </div>
          </div>
        }
        dontExample={
          <div className="flex flex-col gap-2 rounded-2xl bg-card p-3">
            <Button variant="brand" size="lg">Recreate</Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="brand">Download</Button>
              <Button variant="brand">Share</Button>
            </div>
          </div>
        }
      />
    </div>
  ),
}
