import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test'

import { buttonVariants } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { AccountMenu } from '@/registry/account-menu'
import { usage } from '../usage/account-menu.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Blocks / Account Menu',
  component: AccountMenu,
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    user: { name: 'Maya Okafor', email: 'maya@northlight.studio', plan: 'Creator', avatarSrc: 'https://picsum.photos/seed/avatar/96/96' },
    credits: { used: 1760, total: 3000 },
    upsells: [
      { icon: 'add_circle', label: 'Top up credits', actionLabel: 'Buy' },
      { icon: 'bolt', label: 'Faster queue', actionLabel: 'Upgrade' },
    ],
    items: [
      { icon: 'person', label: 'Profile' },
      { icon: 'settings', label: 'Settings' },
      { icon: 'forum', label: 'Community', badge: 'New' },
      { icon: 'help', label: 'Help and feedback' },
    ],
    onSignOut: fn(),
    onCredits: fn(),
  },
  // Room below the avatar so the open menu fits without scrolling.
  decorators: [(Story) => <div className="flex min-h-130 w-80 items-start justify-end">{Story()}</div>],
} satisfies Meta<typeof AccountMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// The menu fades in and axe runs as soon as play ends; wait for full opacity
// so it measures the real colors, not a half-faded frame.
const settled = async () => {
  const menu = await screen.findByRole('menu')
  await waitFor(() => expect(getComputedStyle(menu).opacity).toBe('1'))
}

export const Open: Story = {
  args: { defaultOpen: true },
  play: settled,
}

export const AlmostOutOfCredits: Story = {
  name: 'Almost out of credits',
  args: { defaultOpen: true, credits: { used: 2890, total: 3000 } },
  play: settled,
}

export const NoPictureNoUpsells: Story = {
  name: 'Initials, no upsells',
  args: {
    defaultOpen: true,
    user: { name: 'Jonas Petrov-Lindqvist', email: 'jonas.petrov-lindqvist@studio-collective.example', plan: 'Free' },
    upsells: [],
  },
  play: settled,
}

// Proves the menu opens from the avatar, states the balance, and signs out.
export const SigningOut: Story = {
  name: 'Signing out',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Account menu for Maya Okafor' }))
    await expect(await screen.findByRole('menuitem', { name: /1,240 left/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }))
    await expect(args.onSignOut).toHaveBeenCalledTimes(1)
    // Let the menu finish closing so axe sees the page, not the exit animation.
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  },
}

// Flat drawings of the menu for the Do/Don't frames; a real menu is a popup
// and only one can be open at a time.
function MenuSketch({ rows }: { rows: ({ icon: IconName; label: string; pill?: string; lime?: boolean } | 'separator')[] }) {
  return (
    <div className="flex w-56 flex-col gap-0.5 rounded-xl border border-separator bg-popover p-1.5 text-sm font-medium">
      {rows.map((row, index) =>
        row === 'separator' ? (
          <Separator key={index} className="my-1" />
        ) : (
          <div key={row.label} className="flex h-8 items-center gap-2 px-2">
            <Icon name={row.icon} className="text-muted-foreground" />
            {row.label}
            {row.pill ? (
              <span className={buttonVariants({ variant: row.lime ? 'brand' : 'glass', size: 'xs', className: 'ml-auto' })}>{row.pill}</span>
            ) : null}
          </div>
        ),
      )}
    </div>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  decorators: [],
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="sign-out-last"
        doExample={
          <MenuSketch
            rows={[
              { icon: 'settings', label: 'Settings' },
              { icon: 'help', label: 'Help and feedback' },
              'separator',
              { icon: 'logout', label: 'Sign out' },
            ]}
          />
        }
        dontExample={
          <MenuSketch
            rows={[
              { icon: 'logout', label: 'Sign out' },
              { icon: 'settings', label: 'Settings' },
              { icon: 'help', label: 'Help and feedback' },
            ]}
          />
        }
      />
      <DoDontPair
        usage={usage}
        id="few-upsells"
        doExample={
          <MenuSketch
            rows={[
              { icon: 'add_circle', label: 'Top up credits', pill: 'Buy', lime: true },
              { icon: 'bolt', label: 'Faster queue', pill: 'Upgrade' },
            ]}
          />
        }
        dontExample={
          <MenuSketch
            rows={[
              { icon: 'add_circle', label: 'Top up credits', pill: 'Buy', lime: true },
              { icon: 'bolt', label: 'Faster queue', pill: 'Upgrade', lime: true },
              { icon: 'rocket_launch', label: 'Go yearly', pill: 'Save', lime: true },
              { icon: 'smart_display', label: '4K exports', pill: 'Unlock', lime: true },
            ]}
          />
        }
      />
    </div>
  ),
}
