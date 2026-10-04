import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PromoModal } from '@/registry/promo-modal'
import { usage } from '../usage/promo-modal.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

// About 9 hours 41 minutes out, from when the story loads.
const inNineHours = () => Date.now() + (9 * 60 + 41) * 60 * 1000

const meta = {
  title: 'Blocks / Promo Modal',
  component: PromoModal,
  args: {
    headline: 'Render without the wait',
    description: 'Upgrade to Studio and your generations skip the queue, all year, at a lower price.',
    benefits: ['Priority rendering on every model', '3,000 credits each month', '4K exports and commercial use'],
    image: { src: 'https://picsum.photos/seed/promo/896/352', alt: 'Placeholder photo for the Studio plan offer' },
    price: 14,
    originalPrice: 24,
    deadline: inNineHours(),
    finePrint: 'Then $24 a month after 12 months. Cancel any time from Settings › Billing.',
    trigger: <Button variant="glass">See the offer</Button>,
    onClaim: fn(),
  },
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof PromoModal>

export default meta
type Story = StoryObj<typeof meta>

async function openModal(canvasElement: HTMLElement, name: string) {
  const canvas = within(canvasElement)
  const page = within(canvasElement.ownerDocument.body)
  await userEvent.click(canvas.getByRole('button', { name: 'See the offer' }))
  const dialog = await page.findByRole('dialog', { name })
  await waitFor(() => expect(getComputedStyle(dialog).opacity).toBe('1'))
  return within(dialog)
}

export const Closed: Story = {}

export const Open: Story = {
  play: async ({ canvasElement, args }) => {
    const dialog = await openModal(canvasElement, 'Render without the wait')
    await expect(dialog.getByRole('timer')).toHaveAccessibleName(/Offer ends in 9 hours/)
    await userEvent.click(dialog.getByRole('button', { name: 'Claim 42% off' }))
    await expect(args.onClaim).toHaveBeenCalled()
  },
}

export const Ended: Story = {
  name: 'Offer ended',
  args: { deadline: Date.now() - 1000 },
  play: async ({ canvasElement }) => {
    const dialog = await openModal(canvasElement, 'Render without the wait')
    await expect(dialog.getByRole('button', { name: 'This offer has ended' })).toHaveAttribute('aria-disabled', 'true')
  },
}

function ClaimRow({ lime }: { lime: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-dialog p-4">
      <Badge variant="sale">42% off</Badge>
      <Button variant={lime ? 'brand' : 'commerce-pink'} depth="raised" size="xl" className="w-full">
        Claim 42% off
      </Button>
    </div>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair usage={usage} id="lime-to-claim-pink-for-the-sale" doExample={<ClaimRow lime />} dontExample={<ClaimRow lime={false} />} />
    </div>
  ),
}
