import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { NotificationsPanel, type NotificationEntry } from '@/registry/notifications-panel'
import { usage } from '../usage/notifications-panel.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const notifications: NotificationEntry[] = [
  {
    id: 'invite-1',
    actor: { name: 'Mara Quinn', avatar: 'https://picsum.photos/seed/mara/64/64' },
    message: 'invited you to edit Desert Bloom',
    time: '4m',
    unread: true,
    request: { status: 'pending' },
  },
  {
    id: 'render-1',
    icon: 'movie',
    message: 'Your 8-second clip "Harbor at dusk" finished rendering.',
    time: '12m',
    unread: true,
  },
  {
    id: 'comment-1',
    actor: { name: 'Leo Park' },
    message: 'commented on Neon Orchard: "The second frame is the one."',
    time: '1h',
    unread: true,
  },
  {
    id: 'access-1',
    actor: { name: 'Ines Duarte' },
    message: 'asked to view Studio Moodboards',
    time: '3h',
    unread: false,
    request: { status: 'pending' },
  },
  {
    id: 'like-1',
    actor: { name: 'Sam Okafor', avatar: 'https://picsum.photos/seed/sam/64/64' },
    message: 'liked your image Paper Lanterns',
    time: 'Yesterday',
    unread: false,
  },
]

const meta = {
  title: 'Blocks / Notifications Panel',
  component: NotificationsPanel,
  args: {
    notifications,
    onOpenNotification: fn(),
    onRespond: fn(),
    onMarkAllRead: fn(),
  },
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof NotificationsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {}

export const Open: Story = {
  render: (args) => (
    <div className="flex h-140 w-110 justify-end">
      <NotificationsPanel {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Notifications, 3 unread' }))
    const panel = await page.findByRole('region', { name: 'Notifications' })
    const popup = panel.closest('[data-slot=popover-content]') as HTMLElement
    await waitFor(() => expect(getComputedStyle(popup).opacity).toBe('1'))
  },
}

export const Inline: Story = {
  args: { mode: 'inline' },
}

export const AnswerRequest: Story = {
  name: 'Answering a request',
  args: { mode: 'inline' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('tab', { name: /Requests/ }))
    const [accept] = canvas.getAllByRole('button', { name: 'Accept' })
    await userEvent.click(accept)
    await expect(canvas.getByRole('status')).toHaveTextContent('Accepted')
    await expect(args.onRespond).toHaveBeenCalledWith(expect.objectContaining({ id: 'invite-1' }), 'accepted')
  },
}

export const AllRead: Story = {
  name: 'Marked all as read',
  args: { mode: 'inline' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Mark all as read' }))
    await userEvent.click(canvas.getByRole('tab', { name: /Unread/ }))
    await expect(canvas.getByText("You're all caught up")).toBeVisible()
    await expect(args.onMarkAllRead).toHaveBeenCalled()
  },
}

export const Empty: Story = {
  args: { mode: 'inline', notifications: [] },
}

function RequestRow({ loud }: { loud: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-glass px-2 py-2.5 text-sm">
      <Avatar>
        <AvatarFallback>MQ</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <p>
          <span className="font-medium">Mara Quinn</span> invited you to edit Desert Bloom
        </p>
        {loud ? (
          <div className="flex gap-2">
            <Button size="xs">Accept</Button>
            <Button size="xs">Decline</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button size="xs" variant="secondary">Accept</Button>
            <Button size="xs" variant="ghost">Decline</Button>
          </div>
        )}
      </div>
    </div>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair usage={usage} id="answer-requests-in-place" doExample={<RequestRow loud={false} />} dontExample={<RequestRow loud />} />
    </div>
  ),
}
