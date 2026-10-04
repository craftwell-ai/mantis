import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { PricingCard } from '@/registry/pricing-card'
import { usage } from '../usage/pricing-card.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

// Placeholder prices and copy for the Creator plan; swap in the real numbers.
const creator = {
  planName: 'Creator',
  description: 'For people publishing new images and clips every week.',
  monthlyPrice: 29,
  yearlyPrice: 24,
  features: [
    '3,000 credits every month',
    'Up to 4 generations running at once',
    '4K upscaling on every export',
    'Commercial use of everything you make',
    'Priority queue during busy hours',
  ],
  badge: 'Best value',
  ctaLabel: 'Subscribe to Creator',
}

const meta = {
  title: 'Blocks / Pricing Card',
  component: PricingCard,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
  args: creator,
} satisfies Meta<typeof PricingCard>

export default meta
type Story = StoryObj<typeof meta>

export const Creator: Story = {}

export const BilledMonthly: Story = {
  args: { defaultBilling: 'monthly' },
}

// Proves the toggle swaps the price and the billing line.
export const SwitchingBilling: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('$24')).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'Monthly' }))
    await expect(canvas.getByText('$29')).toBeInTheDocument()
    await expect(canvas.getByText('Billed every month. Cancel any time.')).toBeInTheDocument()
  },
}

export const PlanRow: Story = {
  name: 'Plan row',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <PricingCard
        planName="Starter"
        description="For trying ideas out on weekends."
        monthlyPrice={12}
        yearlyPrice={10}
        features={['800 credits every month', 'One generation at a time', 'HD exports']}
        ctaLabel="Subscribe to Starter"
      />
      <PricingCard {...creator} />
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="one-best-value"
        doExample={
          <div className="flex flex-col gap-3">
            <PricingCard planName="Starter" monthlyPrice={12} yearlyPrice={10} features={['HD exports']} />
            <PricingCard planName="Creator" monthlyPrice={29} yearlyPrice={24} features={['4K exports']} badge="Best value" />
          </div>
        }
        dontExample={
          <div className="flex flex-col gap-3">
            <PricingCard planName="Starter" monthlyPrice={12} yearlyPrice={10} features={['HD exports']} badge="Best value" />
            <PricingCard planName="Creator" monthlyPrice={29} yearlyPrice={24} features={['4K exports']} badge="Best value" />
          </div>
        }
      />
      <DoDontPair
        usage={usage}
        id="lime-to-buy"
        doExample={<Button variant="brand" depth="raised" size="xl" className="w-full">Subscribe to Creator</Button>}
        dontExample={<Button variant="commerce-blue" depth="raised" size="xl" className="w-full">Subscribe to Creator</Button>}
      />
    </div>
  ),
}
