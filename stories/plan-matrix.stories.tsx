import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { PlanMatrix, type PlanMatrixPlan, type PlanMatrixSection } from '@/registry/plan-matrix'
import { PricingCard } from '@/registry/pricing-card'
import { usage } from '../usage/plan-matrix.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

// Placeholder plans and prices; swap in the real numbers.
const plans: PlanMatrixPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For trying ideas out on weekends.',
    monthlyPrice: 12,
    yearlyPrice: 10,
    features: ['800 credits every month', 'One generation at a time', 'HD exports'],
  },
  {
    id: 'creator',
    name: 'Creator',
    description: 'For people publishing new images and clips every week.',
    monthlyPrice: 29,
    yearlyPrice: 24,
    features: ['3,000 credits every month', 'Four generations at once', '4K upscaling on every export', 'Commercial use'],
  },
  {
    id: 'studio',
    name: 'Studio',
    description: 'For small teams sharing one library and one credit pool.',
    monthlyPrice: 79,
    yearlyPrice: 64,
    features: ['10,000 pooled credits', 'Three seats included', 'Shared brand kits', 'Priority queue'],
  },
]

const sections: PlanMatrixSection[] = [
  {
    title: 'Generation',
    rows: [
      { feature: 'Monthly credits', values: { starter: '800', creator: '3,000', studio: '10,000' } },
      { feature: 'Generations running at once', values: { starter: '1', creator: '4', studio: '8' } },
      { feature: 'Video up to 10 seconds', values: { starter: false, creator: true, studio: true } },
      { feature: 'Priority queue at busy hours', values: { starter: false, creator: false, studio: true } },
    ],
  },
  {
    title: 'Exports',
    rows: [
      { feature: 'Maximum resolution', values: { starter: 'HD', creator: '4K', studio: '4K' } },
      { feature: 'No watermark', values: { starter: false, creator: true, studio: true } },
      { feature: 'Commercial use', values: { starter: false, creator: true, studio: true } },
    ],
  },
  {
    title: 'Teamwork',
    rows: [
      { feature: 'Seats', values: { starter: '1', creator: '1', studio: '3' } },
      { feature: 'Shared brand kits', values: { starter: false, creator: false, studio: true } },
    ],
  },
]

const meta = {
  title: 'Blocks / Plan Matrix',
  component: PlanMatrix,
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
  args: { plans, sections, highlightedPlanId: 'creator' },
} satisfies Meta<typeof PlanMatrix>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const BilledMonthly: Story = {
  name: 'Billed monthly',
  args: { defaultBilling: 'monthly' },
}

// One switch must move every card's price.
export const SwitchingBilling: Story = {
  name: 'Switching billing',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('$24')).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'Monthly' }))
    await expect(canvas.getByText('$29')).toBeInTheDocument()
    await expect(canvas.getByText('$12')).toBeInTheDocument()
    await expect(canvas.getAllByRole('group', { name: 'Billing period' })).toHaveLength(1)
  },
}

export const TwoPlans: Story = {
  name: 'Two plans',
  args: {
    plans: plans.slice(0, 2),
    sections: sections.slice(0, 2),
  },
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-5xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="one-switch-for-the-page"
        doExample={<PlanMatrix plans={plans.slice(0, 2)} sections={[]} comparisonTitle="Compare plans" />}
        dontExample={
          <div className="grid gap-3 sm:grid-cols-2">
            {plans.slice(0, 2).map((plan) => (
              <PricingCard key={plan.id} planName={plan.name} monthlyPrice={plan.monthlyPrice} yearlyPrice={plan.yearlyPrice} features={plan.features.slice(0, 1)} defaultBilling={plan.id === 'starter' ? 'monthly' : 'yearly'} />
            ))}
          </div>
        }
      />
      <DoDontPair
        usage={usage}
        id="highlight-one-plan"
        doExample={<PlanMatrix plans={plans.slice(0, 2)} sections={[]} highlightedPlanId="creator" comparisonTitle="All plans" />}
        dontExample={
          <div className="grid gap-3 sm:grid-cols-2">
            {plans.slice(0, 2).map((plan) => (
              <div key={plan.id} className="rounded-2xl bg-brand p-0.5">
                <p className="py-1 text-center text-xs font-semibold text-brand-foreground">Most popular</p>
                <PricingCard planName={plan.name} monthlyPrice={plan.monthlyPrice} yearlyPrice={plan.yearlyPrice} features={plan.features.slice(0, 1)} hideBillingToggle className="rounded-xl" />
              </div>
            ))}
          </div>
        }
      />
    </div>
  ),
}
