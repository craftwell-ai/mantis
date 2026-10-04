import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { MediaTile } from '@/components/ui/media-tile'
import { Spinner } from '@/components/ui/spinner'
import { usage } from '../usage/media-tile.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const photo = (slug: string, w = 480, h = 480) => `https://picsum.photos/seed/${slug}/${w}/${h}`

const meta = {
  title: 'Components / Media Tile',
  component: MediaTile,
  args: { src: photo('harbor'), alt: 'Placeholder photo of a harbor at dusk' },
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof MediaTile>

export default meta
type Story = StoryObj<typeof meta>

// One tile at the width it has in a three-column grid.
const single: Story['decorators'] = [(Story) => <div className="w-64"><Story /></div>]

export const Default: Story = { decorators: single }

export const Aspects: Story = {
  decorators: [(Story) => <div className="w-180"><Story /></div>],
  render: () => (
    <div className="grid grid-cols-4 items-start gap-3">
      {(['square', 'video', 'portrait', 'landscape'] as const).map((aspect) => (
        <div key={aspect} className="flex flex-col gap-1.5">
          <MediaTile aspect={aspect} src={photo(aspect, 480, 480)} alt={`Placeholder photo in the ${aspect} frame`} />
          <p className="text-xs text-muted-foreground">{aspect}</p>
        </div>
      ))}
    </div>
  ),
}

export const TitledPreset: Story = {
  decorators: single,
  name: 'Title and badge',
  args: {
    aspect: 'video',
    src: photo('dolly', 640, 360),
    alt: 'Placeholder still for the slow dolly preset',
    title: 'Slow dolly in',
    badge: <span className="flex rounded-md bg-overlay"><Badge variant="new">New</Badge></span>,
  },
}

export const Selectable: Story = {
  name: 'Picking one',
  decorators: [(Story) => <div className="w-150"><Story /></div>],
  render: function Render() {
    const [picked, setPicked] = useState('neon')
    return (
      <ul className="grid grid-cols-3 gap-2">
        {['neon', 'dunes', 'forest'].map((slug) => (
          <li key={slug}>
            <MediaTile
              aspect="video"
              src={photo(slug, 640, 360)}
              alt=""
              title={slug}
              label={`${slug} look`}
              selected={picked === slug}
              onClick={() => setPicked(slug)}
            />
          </li>
        ))}
      </ul>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'neon look' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(canvas.getByRole('button', { name: 'dunes look' }))
    await expect(canvas.getByRole('button', { name: 'dunes look' })).toHaveAttribute('aria-pressed', 'true')
    await expect(canvas.getByRole('button', { name: 'neon look' })).toHaveAttribute('aria-pressed', 'false')
  },
}

export const PickOrder: Story = {
  decorators: single,
  name: 'Pick order instead of a check',
  args: {
    selected: true,
    onClick: () => {},
    indicator: (
      <span className="flex size-5 items-center justify-center rounded-full bg-brand text-2xs font-bold text-brand-foreground tabular-nums">2</span>
    ),
  },
}

export const WithActions: Story = {
  decorators: single,
  name: 'Hover actions',
  args: {
    onClick: () => {},
    label: 'Open the harbor generation',
    actions: (
      <>
        <Button variant="glass" size="icon-sm" className="backdrop-blur-glass" aria-label="Download the harbor generation">
          <Icon name="download" />
        </Button>
        <Button variant="glass" size="icon-sm" className="backdrop-blur-glass" aria-label="Reuse the harbor prompt">
          <Icon name="autorenew" />
        </Button>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The open control and the actions are siblings, so neither is nested in the other.
    const open = canvas.getByRole('button', { name: 'Open the harbor generation' })
    await expect(open.querySelector('button')).toBeNull()
    await userEvent.tab()
    await expect(open).toHaveFocus()
  },
}

export const AsLink: Story = {
  decorators: single,
  name: 'As a link',
  args: { href: '#harbor', label: 'Open the harbor project', aspect: 'video', radius: '2xl', src: photo('harbor', 640, 360) },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Open the harbor project' })
    await expect(link.tagName).toBe('A')
  },
}

export const VideoAndLoading: Story = {
  name: 'Custom media and loading',
  decorators: [(Story) => <div className="w-130"><Story /></div>],
  render: () => (
    <div className="grid grid-cols-2 gap-3">
      <MediaTile
        aspect="video"
        detail={<span className="inline-flex h-6 items-center gap-1 rounded-full bg-overlay px-2 text-xs font-medium text-foreground tabular-nums"><Icon name="play_arrow" />0:08</span>}
      >
        {/* A poster stands in for the clip here; pass a <video> the same way. */}
        <img src={photo('clip', 640, 360)} alt="Placeholder first frame of a clip" className="size-full object-cover" />
      </MediaTile>
      <MediaTile aspect="video">
        <span className="flex size-full items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
          <Spinner label="Generating" />
          <span aria-hidden="true">Generating</span>
        </span>
      </MediaTile>
    </div>
  ),
}

export const DoDont: Story = {
  decorators: [(Story) => <div className="max-w-3xl"><Story /></div>],
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="media-first"
        doExample={<MediaTile aspect="video" src={photo('canyon', 640, 360)} alt="" title="Canyon light" />}
        dontExample={
          <div className="flex items-center gap-3 rounded-xl bg-field p-3">
            <MediaTile radius="lg" className="size-10 shrink-0" src={photo('canyon', 80, 80)} alt="" />
            <p className="text-sm">Canyon light: warm sun raking across red rock walls late in the day.</p>
          </div>
        }
      />
      <DoDontPair
        usage={usage}
        id="lime-means-selected"
        doExample={<MediaTile aspect="video" src={photo('tram', 640, 360)} alt="" title="Tram ride" label="Tram ride" selected onClick={() => {}} />}
        dontExample={<MediaTile aspect="video" className="ring-foreground" src={photo('tram', 640, 360)} alt="" title="Tram ride" label="Tram ride" onClick={() => {}} />}
      />
      <DoDontPair
        usage={usage}
        id="one-corner-badge"
        doExample={<MediaTile aspect="video" src={photo('market', 640, 360)} alt="" title="Night market" badge={<span className="flex rounded-md bg-overlay"><Badge variant="new">New</Badge></span>} />}
        dontExample={
          <MediaTile
            aspect="video"
            src={photo('market', 640, 360)}
            alt=""
            title="Night market"
            badge={
              <span className="flex gap-1">
                <Badge variant="new">New</Badge>
                <Badge variant="hot">Hot</Badge>
                <Badge variant="sale">-40%</Badge>
                <Badge variant="tag">Pro</Badge>
              </span>
            }
          />
        }
      />
    </div>
  ),
}
