import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { AnnouncementBar } from '@/registry/announcement-bar'
import { Countdown } from '@/registry/countdown'
import { usage } from '../usage/announcement-bar.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Blocks / Announcement Bar',
  component: AnnouncementBar,
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    message: 'Motion presets are here: turn any still into a five-second loop.',
    actionLabel: 'Try them in Studio',
    actionHref: '#studio',
    onDismiss: fn(),
  },
} satisfies Meta<typeof AnnouncementBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithCountdown: Story = {
  name: 'With countdown',
  args: {
    message: 'Launch pricing: 30% off every yearly plan.',
    actionLabel: 'See plans',
    actionHref: '#pricing',
    aside: <Countdown size="sm" label="Ends in" target={Date.now() + 3 * 60 * 60 * 1000} />,
  },
}

export const NotDismissible: Story = {
  name: 'Not dismissible',
  args: {
    message: 'Rendering will pause for maintenance on Sunday from 02:00 to 03:00 UTC.',
    actionLabel: 'Read the status page',
    dismissible: false,
  },
}

export const LongMessageOnPhone: Story = {
  name: 'Long message, narrow screen',
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
}

// Proves the close button removes the bar and reports it.
export const Dismissing: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss announcement' }))
    await expect(canvas.queryByRole('region', { name: 'Announcement' })).not.toBeInTheDocument()
    await expect(args.onDismiss).toHaveBeenCalledTimes(1)
  },
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="one-bar-at-a-time"
        doExample={<AnnouncementBar label="Example: one bar" message="Motion presets are here." actionLabel="Try them" actionHref="#a" />}
        dontExample={
          <div className="flex flex-col">
            <AnnouncementBar label="Example: first bar" message="Motion presets are here." actionLabel="Try them" actionHref="#b" />
            <AnnouncementBar label="Example: second bar" message="30% off yearly plans." actionLabel="See plans" actionHref="#c" />
          </div>
        }
      />
      <DoDontPair
        usage={usage}
        id="one-line-message"
        doExample={<AnnouncementBar label="Example: short message" message="Motion presets are here." actionLabel="Try them in Studio" actionHref="#d" />}
        dontExample={
          <AnnouncementBar
            label="Example: long message"
            message="We have shipped motion presets, a new upscaler, faster queues for Creator plans, and a redesigned asset library, plus a long list of fixes you can read about on our changelog page."
            actionLabel="Read more"
            actionHref="#e"
          />
        }
      />
    </div>
  ),
}
