import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { usage } from '../usage/toggle-group.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Toggle Group',
  component: ToggleGroup,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof ToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Segment: Story = {
  render: () => (
    <ToggleGroup defaultValue={['2x']} aria-label="Upscale factor">
      {['1x', '2x', '4x'].map((v) => <ToggleGroupItem key={v} value={v}>{v}</ToggleGroupItem>)}
    </ToggleGroup>
  ),
}

export const SegmentWide: Story = {
  name: 'Segment (two panels)',
  render: () => (
    <ToggleGroup defaultValue={['visuals']} aria-label="Settings section" size="lg">
      <ToggleGroupItem value="visuals" className="w-28">Visuals</ToggleGroupItem>
      <ToggleGroupItem value="sound" className="w-28">Sound</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const OutlineTiles: Story = {
  name: 'Outline tiles (aspect ratio)',
  render: () => (
    <ToggleGroup variant="outline" size="lg" spacing={2} defaultValue={['16:9']} aria-label="Aspect ratio">
      {['16:9', '1:1', '9:16'].map((v) => <ToggleGroupItem key={v} value={v} className="w-16">{v}</ToggleGroupItem>)}
    </ToggleGroup>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="few-short-options"
        doExample={<ToggleGroup defaultValue={['2x']} aria-label="Upscale factor">{['1x', '2x', '4x'].map((v) => <ToggleGroupItem key={v} value={v}>{v}</ToggleGroupItem>)}</ToggleGroup>}
        dontExample={<ToggleGroup defaultValue={['Cinematic wide']} aria-label="Style">{['Cinematic wide', 'Documentary handheld', 'Studio portrait', 'Anime cel', 'Vintage film', 'Neon noir'].map((v) => <ToggleGroupItem key={v} value={v}>{v}</ToggleGroupItem>)}</ToggleGroup>}
      />
    </div>
  ),
}
