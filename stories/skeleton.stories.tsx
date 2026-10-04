import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Skeleton } from '@/components/ui/skeleton'
import { usage } from '../usage/skeleton.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Skeleton',
  component: Skeleton,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

function ThumbnailGrid() {
  return (
    <div role="region" aria-busy="true" aria-label="Loading uploads" className="grid w-105 grid-cols-4 gap-2">
      {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="aspect-square" />)}
    </div>
  )
}

export const Grid: Story = { render: () => <ThumbnailGrid /> }

export const CardLoading: Story = {
  name: 'Card loading',
  render: () => (
    <div role="region" aria-busy="true" aria-label="Loading project" className="flex w-64 flex-col gap-3 rounded-2xl bg-card p-3">
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair usage={usage} id="match-the-real-shape" doExample={<ThumbnailGrid />} dontExample={<div role="region" aria-busy="true" aria-label="Loading uploads, single bar" className="w-105"><Skeleton className="h-6 w-full" /></div>} />
    </div>
  ),
}
