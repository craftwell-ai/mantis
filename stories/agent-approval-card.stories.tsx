import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { AgentApprovalCard, type AgentApprovalStep } from '@/registry/agent-approval-card'
import { usage } from '../usage/agent-approval-card.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const generations: AgentApprovalStep[] = [
  {
    id: 'shot-1',
    description: 'Amber glass dropper bottle on wet black slate, single soft key light from the left, shallow depth of field, droplets on the glass.',
    thumbnail: { src: 'https://picsum.photos/seed/bottle/112/112', alt: 'Reference photo the agent will use for the first shot' },
    details: ['Lumen 2', '4:5', '2K'],
    credits: 4,
  },
  {
    id: 'shot-2',
    description: 'Same bottle from a three-quarter angle on raw linen, morning window light, a sprig of dried eucalyptus behind it.',
    details: ['Lumen 2', '4:5', '2K'],
    credits: 4,
  },
  {
    id: 'shot-3',
    description: 'Close-up of the dropper tip releasing one drop, backlit, dark warm background, macro lens look.',
    details: ['Lumen 2', '1:1', '2K'],
    credits: 4,
  },
]

const renames: AgentApprovalStep[] = [
  { id: 'rename', description: 'Rename 14 files in Desert Bloom › Selects to "desert-bloom-01" through "desert-bloom-14", in the order they were made.', details: ['14 files', 'Desert Bloom'] },
  { id: 'move', description: 'Move the 6 rejected takes to a new folder named "Archive", so they stop showing in the selects grid.', details: ['6 files', 'New folder'] },
]

const meta = {
  title: 'Blocks / Agent Approval Card',
  component: AgentApprovalCard,
  args: {
    title: 'Generate 3 product shots',
    steps: generations,
    kind: 'spend',
    creditBalance: 120,
    onApprove: fn(),
    onStop: fn(),
    onReply: fn(),
  },
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
  render: (args) => (
    <div className="max-w-2xl">
      <AgentApprovalCard {...args} />
    </div>
  ),
} satisfies Meta<typeof AgentApprovalCard>

export default meta
type Story = StoryObj<typeof meta>

export const SpendsCredits: Story = { name: 'Spends credits' }

export const ChangesData: Story = {
  name: 'Changes data',
  args: { title: 'Tidy the Desert Bloom selects', steps: renames, kind: 'change' },
}

export const NotEnoughCredits: Story = {
  name: 'Not enough credits',
  args: { creditBalance: 6 },
}

export const Free: Story = {
  name: 'Free step',
  args: { title: 'Draft a shot list', steps: [{ id: 'list', description: 'Write a six-shot list for a 20-second launch teaser, with a camera move and duration for each shot.', details: ['Text only'], credits: 0 }] },
}

export const Approved: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Always allow' }))
    await userEvent.click(canvas.getByRole('button', { name: /^Approve/ }))
    await expect(canvas.getByRole('status')).toHaveTextContent('will not ask again')
    await expect(args.onApprove).toHaveBeenCalledWith({ alwaysAllow: true })
  },
}

export const Stopped: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    canvas.getByRole('button', { name: /^Approve/ }).focus()
    await userEvent.keyboard('{Escape}')
    await expect(canvas.getByRole('status')).toHaveTextContent('no credits were spent')
    await expect(args.onStop).toHaveBeenCalled()
  },
}

function ApproveRow({ title, lime }: { title: string; lime: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-separator bg-card p-3 text-sm">
      <Icon name="smart_toy" className="size-4 text-muted-foreground" />
      <span className="flex-1 font-medium">{title}</span>
      <Button size="sm" variant="ghost">Stop</Button>
      <Button size="sm" variant={lime ? 'brand' : 'default'} depth={lime ? 'glossy' : 'flat'}>
        Approve
      </Button>
    </div>
  )
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="lime-only-when-it-spends"
        doExample={<ApproveRow title="Rename 14 files" lime={false} />}
        dontExample={<ApproveRow title="Rename 14 files" lime />}
      />
    </div>
  ),
}
