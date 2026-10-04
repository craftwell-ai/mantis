import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { PricingPage } from '@/registry/pricing-page'
import { usage } from '../usage/pricing-page.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'

const meta = {
  title: 'Templates / Pricing Page',
  component: PricingPage,
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  args: { onSubscribe: fn() },
} satisfies Meta<typeof PricingPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('timer')).toBeInTheDocument()
    const question = canvas.getByRole('button', { name: 'Do unused credits roll over?' })
    await userEvent.click(question)
    await expect(question).toHaveAttribute('aria-expanded', 'true')
  },
}

export const NoOffer: Story = {
  name: 'Without an offer',
  args: { offer: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole('region', { name: 'Offer' })).not.toBeInTheDocument()
  },
}

export const OfferEnded: Story = {
  name: 'Offer ended',
  args: {
    offer: {
      message: 'Launch pricing has ended. Thanks to everyone who joined early.',
      endsAt: '2026-01-01T00:00:00Z',
      countdownLabel: 'Ends in',
    },
  },
}

export const Subscribing: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Choose Creator' }))
    await expect(args.onSubscribe).toHaveBeenCalledWith('creator', 'yearly')
  },
}

// Bare, like a component dropped in from a library: every prop falls back to the sample content.
export const NoProps: Story = {
  name: 'No props',
  render: () => <PricingPage />,
}
