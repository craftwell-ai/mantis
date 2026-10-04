import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Stepper } from '@/components/ui/stepper'
import { usage } from '../usage/stepper.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Stepper',
  component: Stepper,
  args: { label: 'batch size' },
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

export const BatchSize: Story = { name: 'Batch size', args: { defaultValue: 1, max: 4 } }

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="show-the-maximum"
        doExample={<Stepper label="batch size" defaultValue={2} max={4} />}
        dontExample={<span className="inline-flex h-10 items-center rounded-xl border border-chip-border bg-chip px-4 text-sm font-medium">2</span>}
      />
    </div>
  ),
}
