import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { SessionList, type Session } from '@/registry/session-list'
import { usage } from '../usage/session-list.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const sessions: Session[] = [
  { id: 'mac', device: 'laptop', client: 'Chrome', os: 'macOS 15', location: 'Lisbon, Portugal', lastActive: 'Active now', current: true },
  { id: 'iphone', device: 'phone', client: 'Safari', os: 'iOS 18', location: 'Lisbon, Portugal', lastActive: '2 hours ago' },
  { id: 'ipad', device: 'tablet', client: 'Mantis for iPad', os: 'iPadOS 18', location: 'Porto, Portugal', lastActive: 'Yesterday' },
  { id: 'studio-pc', device: 'desktop', client: 'Firefox', os: 'Windows 11', location: 'Berlin, Germany', lastActive: 'Sep 21' },
]

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const meta = {
  title: 'Blocks / Session List',
  component: SessionList,
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
  args: { sessions, onSignOut: () => wait(400), onSignOutOthers: () => wait(400) },
} satisfies Meta<typeof SessionList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const OnlyThisDevice: Story = {
  name: 'Only this device',
  args: { sessions: sessions.slice(0, 1) },
}

export const SignOutOne: Story = {
  name: 'Signing out one device',
  args: { onSignOut: () => wait(20) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /Sign out Firefox on Windows 11/ }))
    await expect(await canvas.findByText('Signed out of Firefox on Windows 11.')).toBeInTheDocument()
    await expect(canvas.queryByText('Berlin, Germany')).not.toBeInTheDocument()
  },
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-5xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="mark-this-device"
        doExample={<SessionList sessions={sessions.slice(0, 2)} />}
        dontExample={
          <ul className="flex flex-col gap-3 rounded-2xl bg-card p-5">
            {sessions.slice(0, 2).map((session) => (
              <li key={session.id} className="flex items-center gap-3 text-sm">
                <Icon name="computer" />
                <span className="flex-1">{session.client} on {session.os}</span>
                <Button variant="ghost" size="sm">Sign out</Button>
              </li>
            ))}
          </ul>
        }
      />
    </div>
  ),
}
