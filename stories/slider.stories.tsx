import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Icon } from '@/components/ui/icon'
import { Slider } from '@/components/ui/slider'
import { usage } from '../usage/slider.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Slider',
  component: Slider,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

function GridZoom() {
  return (
    <div className="flex w-44 items-center gap-2 text-muted-foreground">
      <Icon name="remove" className="size-3.5" />
      <Slider defaultValue={[60]} aria-label="Grid zoom" />
      <Icon name="add" className="size-3.5" />
    </div>
  )
}

export const Default: Story = { render: () => <GridZoom /> }

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair usage={usage} id="show-the-ends" doExample={<GridZoom />} dontExample={<div className="w-36"><Slider defaultValue={[60]} aria-label="Grid zoom" /></div>} />
    </div>
  ),
}
