import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { GenerationFeed, type GenerationFeedItem } from '@/registry/generation-feed'
import { usage } from '../usage/generation-feed.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const ITEMS: GenerationFeedItem[] = [
  {
    id: 'harbor',
    src: 'https://picsum.photos/seed/harbor/800/800',
    alt: 'Fishing boats moored in a harbor at dusk',
    prompt: 'A quiet harbor at blue hour, wooden fishing boats rocking on glassy water, warm cabin lights reflected in long streaks, light fog over the breakwater, shot on 35mm film.',
    model: 'Lumen Photo 2',
    settings: ['1:1', '2K', '4 images'],
    createdAt: '2 min ago',
    createdAtDateTime: '2026-10-02T10:12:00Z',
  },
  {
    id: 'atrium',
    src: 'https://picsum.photos/seed/atrium/800/800',
    alt: 'Sunlit concrete atrium with hanging plants',
    prompt: 'Brutalist concrete atrium flooded with late afternoon sun, trailing plants from every balcony, a single figure crossing the courtyard, architectural photography.',
    model: 'Lumen Photo 2',
    settings: ['1:1', '2K'],
    createdAt: '14 min ago',
  },
  {
    id: 'ceramics',
    src: 'https://picsum.photos/seed/ceramics/800/800',
    alt: 'Glazed ceramic bowls stacked on a workbench',
    prompt: 'Hand-thrown ceramic bowls with drippy celadon glaze stacked on a flour-dusted workbench, soft window light, shallow depth of field.',
    model: 'Lumen Photo 2',
    settings: ['1:1', '1K'],
    createdAt: '1 hour ago',
  },
  {
    id: 'canyon',
    src: 'https://picsum.photos/seed/canyon/800/800',
    alt: 'Red canyon walls under a stormy sky',
    prompt: 'Slot canyon walls glowing red under a breaking storm, wide angle, dust in the air catching light.',
    model: 'Drift Video 1.5',
    settings: ['1:1', '1080p', '6s'],
    createdAt: 'yesterday',
  },
  {
    id: 'tram',
    src: 'https://picsum.photos/seed/tram/800/800',
    alt: 'A vintage tram on a rainy city street',
    prompt: 'A vintage green tram turning a corner on a rain-soaked cobbled street at night, neon shop signs, cinematic.',
    model: 'Drift Video 1.5',
    settings: ['1:1', '1080p', '8s'],
    createdAt: 'Sep 30',
  },
  {
    id: 'orchard',
    src: 'https://picsum.photos/seed/orchard/800/800',
    alt: 'Rows of apple trees in morning mist',
    prompt: 'Rows of apple trees in early morning mist, ladders against the trunks, baskets half full, muted autumn palette.',
    model: 'Lumen Photo 2',
    settings: ['1:1', '2K'],
    createdAt: 'Sep 29',
  },
]

const meta = {
  title: 'Blocks / Generation Feed',
  component: GenerationFeed,
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    items: ITEMS,
    title: 'Your generations',
    onOpen: fn(),
    onDownload: fn(),
    onReuse: fn(),
  },
} satisfies Meta<typeof GenerationFeed>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ListView: Story = {
  args: { defaultView: 'list' },
}

export const StillGenerating: Story = {
  args: {
    items: [
      { id: 'queued', alt: 'Lighthouse on a cliff, still generating', prompt: 'A lighthouse on a sea cliff in a gale, waves exploding below, long exposure.', model: 'Lumen Photo 2', settings: ['1:1', '2K'], createdAt: 'just now', status: 'generating' },
      ...ITEMS,
    ],
  },
}

export const Loading: Story = {
  args: { items: [], loading: true },
}

export const LoadingList: Story = {
  args: { items: [], loading: true, defaultView: 'list' },
}

export const Empty: Story = {
  args: { items: [] },
}

export const SwitchLayoutAndZoom: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByLabelText('Tile size')
    await expect(slider).toHaveAttribute('aria-valuenow', '220')
    // Base UI keeps the thumb hidden until it has measured the track, so wait for it before focusing.
    await waitFor(() => expect(getComputedStyle(slider).visibility).toBe('visible'))
    slider.focus()
    await waitFor(() => expect(slider).toHaveFocus())
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await waitFor(() => expect(slider).toHaveAttribute('aria-valuenow', '260'))

    await userEvent.click(canvas.getByRole('button', { name: 'List' }))
    await expect(canvas.queryByLabelText('Tile size')).toBeNull()
    await expect(canvas.getByText(/quiet harbor at blue hour/)).toBeVisible()

    await userEvent.click(canvas.getAllByRole('button', { name: 'Reuse prompt' })[0])
    await expect(args.onReuse).toHaveBeenCalledWith(expect.objectContaining({ id: 'harbor' }))
  },
}

export const OpenFromGrid: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Open: Rows of apple trees in morning mist' }))
    await expect(args.onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'orchard' }))
  },
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="media-first-chrome-quiet"
        doExample={<GenerationFeed items={ITEMS.slice(0, 4)} defaultTileSize={120} onDownload={() => {}} onReuse={() => {}} />}
        dontExample={
          <ul className="grid grid-cols-2 gap-3">
            {ITEMS.slice(0, 2).map((item) => (
              <li key={item.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3">
                <img src={item.src} alt={item.alt} className="aspect-square w-full rounded-lg object-cover" />
                <p className="text-sm font-medium">{item.model}</p>
                <div className="flex gap-1">
                  <Button size="xs" variant="outline">Open</Button>
                  <Button size="xs" variant="outline">Save</Button>
                </div>
              </li>
            ))}
          </ul>
        }
      />
      <DoDontPair
        usage={usage}
        id="no-lime-per-entry"
        doExample={
          <div className="flex gap-2">
            <Button variant="glass" size="sm">
              <Icon name="autorenew" />
              Reuse prompt
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="download" />
              Download
            </Button>
          </div>
        }
        dontExample={
          <div className="flex flex-col gap-2">
            {['Harbor at dusk', 'Concrete atrium'].map((name) => (
              <div key={name} className="flex items-center justify-between gap-2">
                <span className="text-sm">{name}</span>
                <Button variant="brand" size="sm">Recreate</Button>
              </div>
            ))}
          </div>
        }
      />
    </div>
  ),
}
