import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Checkbox } from '@/components/ui/checkbox'
import { usage } from '../usage/checkbox.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Checkbox',
  component: Checkbox,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

function Row({ label, ...props }: { label: string } & React.ComponentProps<typeof Checkbox>) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox {...props} />
      {label}
    </label>
  )
}

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Row label="Export as PNG" />
      <Row label="Export as MP4" defaultChecked />
      <Row label="Include all variations" indeterminate />
      <Row label="Archived formats" disabled />
    </div>
  ),
}

export const Primary: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Row label="This device" variant="primary" defaultChecked />
      <Row label="Studio laptop" variant="primary" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Checkbox size="xs" defaultChecked aria-label="Extra small" />
      <Checkbox size="sm" defaultChecked aria-label="Small" />
      <Checkbox size="md" defaultChecked aria-label="Medium" />
      <Checkbox size="lg" defaultChecked aria-label="Large" />
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="label-every-box"
        doExample={<div className="flex flex-col gap-2"><Row label="Export as PNG" defaultChecked /><Row label="Export as MP4" /></div>}
        dontExample={<div className="flex flex-col gap-2 text-sm"><span className="text-muted-foreground">Export formats</span><div className="flex gap-2"><Checkbox defaultChecked aria-label="PNG" /><Checkbox aria-label="MP4" /></div></div>}
      />
    </div>
  ),
}
