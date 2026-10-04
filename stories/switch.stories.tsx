import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Switch } from '@/components/ui/switch'
import { usage } from '../usage/switch.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Switch',
  component: Switch,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

function Labeled({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Switch defaultChecked={defaultChecked} />
      {label}
    </label>
  )
}

export const On: Story = { render: () => <Labeled label="Sound" defaultChecked /> }
export const Off: Story = { render: () => <Labeled label="Enhance prompt" /> }

// The labeled 40px row the reference uses for plan add-ons.
export const InRow: Story = {
  name: 'In a bordered row',
  render: () => (
    <label className="flex h-10 w-48 items-center gap-2 rounded-lg border border-glass-border px-2 text-sm">
      <Switch defaultChecked />
      Priority queue
    </label>
  ),
}

export const Large: Story = {
  name: 'Large (billing period)',
  render: () => (
    <label className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground">Monthly</span>
      <Switch size="lg" defaultChecked aria-label="Bill annually" />
      <span>Annual</span>
    </label>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair usage={usage} id="label-the-setting" doExample={<Labeled label="Sound" defaultChecked />} dontExample={<Switch defaultChecked aria-label="Sound" />} />
    </div>
  ),
}
