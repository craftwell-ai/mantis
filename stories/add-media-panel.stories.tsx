import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { EmptyState } from '@/registry/empty-state'
import { AddMediaPanel, type MediaItem } from '@/registry/add-media-panel'
import { usage } from '../usage/add-media-panel.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const media = (prefix: string, label: string, count: number): MediaItem[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
    src: `https://picsum.photos/seed/${prefix}-${index + 1}/240/240`,
    alt: `${label} ${index + 1}`,
  }))

const ITEMS = {
  uploads: media('upload', 'Uploaded photo', 6),
  generations: media('generation', 'Generated image', 10),
  liked: media('liked', 'Liked image', 3),
}

const meta = {
  title: 'Blocks / Add Media Panel',
  component: AddMediaPanel,
  args: { items: ITEMS, onUpload: fn(), onConfirm: fn(), onClose: fn(), confirmLabel: 'Add to references' },
  decorators: [(Story) => <div className="w-full max-w-160"><Story /></div>],
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof AddMediaPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const PickAndConfirm: Story = {
  name: 'Pick and confirm',
  args: { maxSelected: 2 },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('tab', { name: 'Generations' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Generated image 3' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Generated image 1' }))
    await expect(canvas.getByText('2 of 2 selected')).toBeInTheDocument()
    // The limit is reached: other tiles say so instead of silently ignoring the click.
    await expect(canvas.getByRole('button', { name: 'Generated image 2' })).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(canvas.getByRole('button', { name: /Add to references/ }))
    await expect(args.onConfirm).toHaveBeenCalledWith([ITEMS.generations[2], ITEMS.generations[0]])
  },
}

export const Loading: Story = {
  args: { loading: { uploads: true } },
}

export const EmptyUploads: Story = {
  name: 'Empty: uploads',
  args: { items: {} },
}

export const EmptyElements: Story = {
  name: 'Empty: elements',
  args: { defaultTab: 'elements' },
}

export const EmptyLiked: Story = {
  name: 'Empty: liked',
  args: { items: { uploads: ITEMS.uploads }, defaultTab: 'liked' },
}

// Static frames for the Do/Don't pairs, so each side shows only the difference.
function Footer({ brand = false }: { brand?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-dialog p-3">
      <span className="text-sm text-muted-foreground">2 of 4 selected</span>
      <Button size="sm" variant={brand ? 'brand' : 'default'}>
        <Icon name="add" />
        Add to references
      </Button>
    </div>
  )
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair usage={usage} id="confirm-stays-white" doExample={<Footer />} dontExample={<Footer brand />} />
      <DoDontPair
        usage={usage}
        id="empty-tab-explains-itself"
        doExample={
          <EmptyState
            headingTag="h3"
            icon="favorite"
            title="Nothing liked yet"
            description="Like a result from your feed or the community and it is kept here for quick reuse."
          />
        }
        dontExample={<EmptyState headingTag="h3" icon="image" title="No media" description="There is nothing here." />}
      />
    </div>
  ),
}
