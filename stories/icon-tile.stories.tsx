import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { IconTile } from '@/components/ui/icon-tile'
import { usage } from '../usage/icon-tile.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Icon Tile',
  component: IconTile,
  args: { name: 'image' },
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof IconTile>

export default meta
type Story = StoryObj<typeof meta>

const nav = [
  { label: 'Profile', name: 'menu', color: 'blue' },
  { label: 'Gifts', name: 'star_shine-fill', color: 'orange' },
  { label: 'Subscription', name: 'check_circle', color: 'pink' },
  { label: 'Usage', name: 'progress_activity', color: 'mint' },
  { label: 'Promo code', name: 'add', color: 'purple' },
] as const

export const SettingsNav: Story = {
  name: 'In a settings nav',
  render: () => (
    <ul className="flex w-48 flex-col gap-1 text-sm">
      {nav.map((item) => (
        <li key={item.label} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-glass">
          <IconTile name={item.name} color={item.color} />
          {item.label}
        </li>
      ))}
    </ul>
  ),
}

export const Colors: Story = {
  render: () => (
    <div className="flex gap-2">
      {(['blue', 'purple', 'pink', 'orange', 'mint', 'brown', 'neutral'] as const).map((c) => <IconTile key={c} name="image" color={c} size="lg" />)}
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="tile-beside-label"
        doExample={<span className="flex items-center gap-2 text-sm"><IconTile name="menu" color="blue" />Profile</span>}
        dontExample={<div className="flex gap-2"><IconTile name="menu" color="blue" size="lg" /><IconTile name="check_circle" color="pink" size="lg" /></div>}
      />
    </div>
  ),
}
