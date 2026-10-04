import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { usage } from '../usage/progress.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Progress',
  component: Progress,
  args: { value: 38 },
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

function CreditMeter() {
  return (
    <Progress value={38} className="w-64 justify-between text-sm">
      <ProgressLabel>Credits left</ProgressLabel>
      <ProgressValue>{() => '230 of 600'}</ProgressValue>
    </Progress>
  )
}

export const Credits: Story = { render: () => <CreditMeter /> }

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair usage={usage} id="state-the-numbers" doExample={<CreditMeter />} dontExample={<Progress value={38} aria-label="Credits left" className="w-64" />} />
    </div>
  ),
}
