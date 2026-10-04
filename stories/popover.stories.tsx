import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { usage } from '../usage/popover.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Popover',
  component: Popover,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

const durations = ['4s', '6s', '8s', '10s']

function DurationPopover({ open }: { open?: boolean }) {
  return (
    <Popover open={open}>
      <PopoverTrigger render={<Button variant="glass" />}>
        <Icon name="progress_activity" />
        6s
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <PopoverHeader className="px-1 pt-1">
          <PopoverTitle>Clip length</PopoverTitle>
          <PopoverDescription>Longer clips cost more credits.</PopoverDescription>
        </PopoverHeader>
        <div className="grid grid-cols-4 gap-1">
          {durations.map((d) => (
            <Button key={d} size="sm" variant={d === '6s' ? 'default' : 'ghost'}>{d}</Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const Default: Story = { render: () => <div className="pb-44"><DurationPopover open /></div> }

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="stay-small"
        doExample={
          <div className="flex w-56 flex-col gap-2 rounded-2xl border border-separator bg-background p-2 text-sm shadow-popover">
            <span className="px-1 font-medium">Clip length</span>
            <div className="grid grid-cols-4 gap-1">{durations.map((d) => <Button key={d} size="sm" variant={d === '6s' ? 'default' : 'ghost'}>{d}</Button>)}</div>
          </div>
        }
        dontExample={
          <div className="flex w-56 flex-col gap-2 rounded-2xl border border-separator bg-background p-2 text-sm shadow-popover">
            <span className="px-1 font-medium">All generation settings</span>
            {['Model', 'Aspect ratio', 'Quality', 'Resolution', 'Clip length', 'Motion strength', 'Seed', 'Batch size'].map((row) => (
              <div key={row} className="flex items-center justify-between px-1 text-muted-foreground"><span>{row}</span><span>Auto</span></div>
            ))}
          </div>
        }
      />
    </div>
  ),
}
