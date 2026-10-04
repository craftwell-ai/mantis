import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, waitFor, within } from 'storybook/test'

import { Countdown } from '@/registry/countdown'
import { usage } from '../usage/countdown.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

// Targets are computed when a story renders, so the clock always has time left.
const inFromNow = (hours: number, minutes = 0, seconds = 0) => Date.now() + ((hours * 60 + minutes) * 60 + seconds) * 1000

const meta = {
  title: 'Blocks / Countdown',
  component: Countdown,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
  args: { target: 0, label: 'Launch pricing ends in' },
  render: (args) => <Countdown {...args} target={inFromNow(2, 14, 5)} />,
} satisfies Meta<typeof Countdown>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Compact: Story = {
  name: 'Compact (sm)',
  args: { size: 'sm', label: 'Ends in' },
}

export const Ended: Story = {
  render: (args) => <Countdown {...args} target={Date.now() - 1000} />,
}

// Proves the timer reaches zero, swaps its label and calls onExpire once.
export const ReachesZero: Story = {
  name: 'Reaches zero',
  args: { onExpire: fn() },
  render: (args) => <Countdown {...args} target={inFromNow(0, 0, 2)} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Launch pricing ends in')).toBeInTheDocument()
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('This offer has ended'), { timeout: 5000 })
    await expect(args.onExpire).toHaveBeenCalledTimes(1)
  },
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="one-timer-per-view"
        doExample={<Countdown target={inFromNow(5, 40)} label="Launch pricing ends in" />}
        dontExample={
          <div className="flex flex-col gap-2">
            <Countdown target={inFromNow(5, 40)} label="Starter discount ends in" size="sm" />
            <Countdown target={inFromNow(5, 40)} label="Creator discount ends in" size="sm" />
            <Countdown target={inFromNow(2, 10)} label="Team bonus ends in" size="sm" />
          </div>
        }
      />
      <DoDontPair
        usage={usage}
        id="say-what-ends"
        doExample={<Countdown target={inFromNow(1, 5)} label="Launch pricing ends in" />}
        dontExample={<Countdown target={inFromNow(1, 5)} label="Hurry!" />}
      />
    </div>
  ),
}
