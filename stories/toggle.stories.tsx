import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Icon } from '@/components/ui/icon'
import { Toggle } from '@/components/ui/toggle'
import { usage } from '../usage/toggle.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'

const meta = {
  title: 'Components / Toggle',
  component: Toggle,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle variant="ghost" aria-label="Show grid" defaultPressed><Icon name="menu" /></Toggle>
      <Toggle variant="ghost" aria-label="Snap to edges"><Icon name="image" /></Toggle>
    </div>
  ),
}
