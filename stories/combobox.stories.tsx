import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox'
import { usage } from '../usage/combobox.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Combobox',
  component: Combobox,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

const presets = ['Neon Drift', 'Soft Dusk', 'Hand-held 35', 'Paper Lantern', 'Glass Harbor', 'Night Market', 'Slow Orbit', 'Rain Window']

function PresetPicker({ open, defaultInputValue }: { open?: boolean; defaultInputValue?: string }) {
  return (
    <Combobox items={presets} open={open} defaultInputValue={defaultInputValue}>
      <ComboboxInput placeholder="Search presets" aria-label="Preset" className="w-64" />
      <ComboboxContent>
        <ComboboxEmpty>No presets match that name. Try a mood such as dusk or neon.</ComboboxEmpty>
        <ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export const Closed: Story = { render: () => <PresetPicker /> }

export const Open: Story = { render: () => <div className="pb-80"><PresetPicker open /></div> }

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="helpful-empty-result"
        doExample={<div className="w-64 rounded-xl border border-separator bg-popover p-3 text-sm text-muted-foreground">No presets match &quot;zz&quot;. Try a mood such as dusk or neon.</div>}
        dontExample={<div className="h-12 w-64 rounded-xl border border-separator bg-popover" />}
      />
    </div>
  ),
}
