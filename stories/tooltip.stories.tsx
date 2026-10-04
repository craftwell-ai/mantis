import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usage } from '../usage/tooltip.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Tooltip',
  component: Tooltip,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
  decorators: [(Story) => <TooltipProvider><Story /></TooltipProvider>],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

function AddMedia({ open, label = 'Add media' }: { open?: boolean; label?: string }) {
  return (
    <Tooltip open={open}>
      <TooltipTrigger render={<Button variant="glass" size="icon-sm" aria-label="Add media" />}>
        <Icon name="add" />
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

export const Default: Story = { render: () => <div className="pt-12"><AddMedia open /></div> }

export const OnHover: Story = { render: () => <div className="pt-12"><AddMedia /></div> }

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="name-the-control"
        doExample={<div className="pt-10"><AddMedia open /></div>}
        dontExample={<div className="pt-16"><AddMedia open label="Click here to upload images, videos or audio from your device or the asset library" /></div>}
      />
    </div>
  ),
}
