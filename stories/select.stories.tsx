import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Icon } from '@/components/ui/icon'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usage } from '../usage/select.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Select',
  component: Select,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const ratios = [
  { value: 'auto', label: 'Auto' },
  { value: '16:9', label: '16:9' },
  { value: '3:2', label: '3:2' },
  { value: '1:1', label: '1:1' },
  { value: '2:3', label: '2:3' },
  { value: '9:16', label: '9:16' },
]

function AspectSelect({ open }: { open?: boolean }) {
  return (
    <Select defaultValue="auto" items={ratios} open={open}>
      <SelectTrigger aria-label="Aspect ratio">
        <Icon name="image" className="size-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Aspect ratio</SelectLabel>
          {ratios.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export const Closed: Story = { render: () => <AspectSelect /> }

export const Open: Story = { render: () => <div className="pb-72"><AspectSelect open /></div> }

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="show-current-value"
        doExample={<AspectSelect />}
        dontExample={
          <button type="button" className="flex h-10 items-center gap-1 rounded-xl border border-chip-border bg-chip px-3 text-sm font-medium text-chip-foreground">
            Aspect ratio <Icon name="keyboard_arrow_down" className="size-4" />
          </button>
        }
      />
    </div>
  ),
}
