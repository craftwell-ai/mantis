import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { IconTile } from '@/components/ui/icon-tile'
import { SettingsNav, type SettingsNavItem } from '@/registry/settings-nav'
import { usage } from '../usage/settings-nav.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const items: SettingsNavItem[] = [
  { id: 'profile', label: 'Profile', icon: 'person', color: 'orange' },
  { id: 'plan', label: 'Plan and billing', icon: 'credit_card', color: 'pink' },
  { id: 'usage', label: 'Credit usage', icon: 'data_usage', color: 'blue' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications', color: 'purple' },
  { id: 'security', label: 'Security', icon: 'shield', color: 'mint' },
  { id: 'preferences', label: 'Studio preferences', icon: 'tune', color: 'brown' },
]

const meta = {
  title: 'Blocks / Settings Nav',
  component: SettingsNav,
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
  args: { items, label: 'Northlight Studio workspace', defaultValue: 'usage' },
} satisfies Meta<typeof SettingsNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithFooter: Story = {
  name: 'With sign-out footer',
  args: {
    className: 'h-96',
    footer: (
      <Button variant="ghost" size="sm" className="w-full justify-start px-2">
        <Icon name="logout" />
        Sign out
      </Button>
    ),
  },
}

export const AsLinks: Story = {
  name: 'As links',
  args: { items: items.map((item) => ({ ...item, href: `#${item.id}` })) },
}

export const ChangingPage: Story = {
  name: 'Changing page',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Security' }))
    await expect(canvas.getByRole('button', { name: 'Security' })).toHaveAttribute('aria-current', 'page')
  },
}

const row = 'flex h-9 items-center gap-2.5 rounded-lg px-2 text-sm font-medium'

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-5xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="stable-tile-colors"
        doExample={<SettingsNav items={items.slice(0, 4)} label="Workspace" defaultValue="profile" />}
        dontExample={
          <ul className="flex flex-col gap-0.5">
            {items.slice(0, 4).map((item) => (
              <li key={item.id} className={row}>
                <IconTile name={item.icon} color="blue" />
                {item.label}
              </li>
            ))}
          </ul>
        }
      />
      <DoDontPair
        usage={usage}
        id="tint-not-lime-for-current"
        doExample={<SettingsNav items={items.slice(0, 3)} label="Account" defaultValue="plan" />}
        dontExample={
          <ul className="flex flex-col gap-0.5">
            {items.slice(0, 3).map((item) => (
              <li key={item.id} className={`${row} ${item.id === 'plan' ? 'bg-brand text-brand-foreground' : ''}`}>
                <IconTile name={item.icon} color={item.color} />
                {item.label}
              </li>
            ))}
          </ul>
        }
      />
    </div>
  ),
}
