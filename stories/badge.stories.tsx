import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Badge } from '@/components/ui/badge'
import { usage } from '../usage/badge.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Badge',
  component: Badge,
  args: { children: 'New' },
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const New: Story = { args: { variant: 'new', children: 'New' } }
export const Neutral: Story = { args: { variant: 'neutral', children: '2K' } }
export const Tag: Story = { args: { variant: 'tag', children: 'Beta' } }
export const Sale: Story = { args: { variant: 'sale', children: '30% off' } }
export const Hot: Story = { args: { variant: 'hot', children: 'Hot' } }
export const Value: Story = { args: { variant: 'value', children: 'Best value' } }
export const Gold: Story = { args: { variant: 'gold', children: 'Creator program' } }

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="new">New</Badge>
      <Badge variant="neutral">2K</Badge>
      <Badge variant="tag">Beta</Badge>
      <Badge variant="sale">30% off</Badge>
      <Badge variant="hot">Hot</Badge>
      <Badge variant="value">Best value</Badge>
      <Badge variant="gold">Creator program</Badge>
      <Badge variant="outline">Draft</Badge>
      <Badge variant="destructive">Failed</Badge>
    </div>
  ),
}

export const InContext: Story = {
  name: 'In context',
  render: () => (
    <div className="flex flex-col gap-3 text-sm">
      <span className="inline-flex items-center gap-2">Motion presets <Badge variant="new">New</Badge></span>
      <span className="inline-flex items-center gap-2">Pricing <Badge variant="sale">30% off</Badge></span>
      <span className="inline-flex items-center gap-2">Studio plan <Badge variant="value">Best value</Badge></span>
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="one-badge-per-item"
        doExample={<span className="inline-flex items-center gap-2 text-sm">Neon Drift preset <Badge variant="new">New</Badge></span>}
        dontExample={
          <span className="inline-flex items-center gap-2 text-sm">
            Neon Drift preset <Badge variant="new">New</Badge><Badge variant="hot">Hot</Badge><Badge variant="sale">30% off</Badge>
          </span>
        }
      />
      <DoDontPair
        usage={usage}
        id="commerce-badges-for-commerce"
        doExample={<span className="inline-flex items-center gap-2 text-sm">Creator plan <Badge variant="sale">30% off</Badge></span>}
        dontExample={<span className="inline-flex items-center gap-2 text-sm">Upscale <Badge variant="sale">Fast</Badge></span>}
      />
    </div>
  ),
}
