import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Icon } from '@/components/ui/icon'
import { RadioGroup, RadioGroupCard, RadioGroupItem } from '@/components/ui/radio-group'
import { usage } from '../usage/radio-group.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Radio Group',
  component: RadioGroup,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

function Option({ value, label }: { value: string; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <RadioGroupItem value={value} />
      {label}
    </label>
  )
}

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="private" aria-label="Project visibility">
      <Option value="private" label="Private" />
      <Option value="public" label="Public" />
    </RadioGroup>
  ),
}

function VisibilityCards() {
  return (
    <RadioGroup defaultValue="private" aria-label="Project visibility" className="grid-cols-2">
      <RadioGroupCard value="private">
        <Icon name="lock" className="size-5 text-muted-foreground" />
        <span className="font-semibold">Private</span>
        <span data-contrast-exempt className="text-muted-foreground">Only you and invited collaborators can open it.</span>
      </RadioGroupCard>
      <RadioGroupCard value="public">
        <Icon name="public" className="size-5 text-muted-foreground" />
        <span className="font-semibold">Public</span>
        <span data-contrast-exempt className="text-muted-foreground">Anyone with the link can view it.</span>
      </RadioGroupCard>
    </RadioGroup>
  )
}

export const Cards: Story = { render: () => <div className="w-120"><VisibilityCards /></div> }

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="cards-for-explained-choices"
        doExample={<div className="w-105"><VisibilityCards /></div>}
        dontExample={
          <RadioGroup defaultValue="16:9" aria-label="Aspect ratio" className="grid-cols-3">
            {['16:9', '1:1', '9:16'].map((v) => <RadioGroupCard key={v} value={v}><span className="font-semibold">{v}</span></RadioGroupCard>)}
          </RadioGroup>
        }
      />
    </div>
  ),
}
