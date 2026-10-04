import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Switch } from '@/components/ui/switch'
import {
  SAMPLE_ACCOUNT,
  SAMPLE_NAV_LINKS,
  SAMPLE_SESSIONS,
  SAMPLE_SETTINGS_PROFILE,
  SAMPLE_USAGE,
  SAMPLE_WORKSPACE_LABEL,
  sampleNavigation,
} from '@/registry/sample-content'
import { SettingsPage } from '@/registry/settings-page'
import { usage } from '../usage/settings-page.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

// The sample bar on settings: no section is current, there is no sale tag or
// assets link, and the account comes from the page's `account` prop.
const navigation = {
  ...sampleNavigation(),
  links: [...SAMPLE_NAV_LINKS.slice(0, 3), { label: 'Library', href: '/library' }],
  onSearch: fn(),
  pricing: { label: 'Pricing', href: '/pricing' },
  assetsHref: undefined,
  account: undefined,
}

// No top-up offer in the menu here.
const account = { user: SAMPLE_ACCOUNT.user, credits: SAMPLE_ACCOUNT.credits }

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const meta = {
  title: 'Templates / Settings Page',
  component: SettingsPage,
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  decorators: [(Story, { parameters }) => (parameters.layout === 'fullscreen' ? <div className="-m-6">{Story()}</div> : Story())],
  args: {
    navigation,
    account,
    workspaceLabel: SAMPLE_WORKSPACE_LABEL,
    profile: SAMPLE_SETTINGS_PROFILE,
    onSaveProfile: () => wait(300),
    passwordLastChanged: '3 months ago',
    sessions: SAMPLE_SESSIONS,
    onSignOutSession: () => wait(300),
    onSignOutOthers: () => wait(300),
    usage: SAMPLE_USAGE,
    onDeleteAccount: fn(),
    onSignOut: fn(),
  },
} satisfies Meta<typeof SettingsPage>

export default meta
type Story = StoryObj<typeof meta>

export const Profile: Story = {}

// Bare, like a component dropped in from a library: every prop falls back to the sample content.
export const NoProps: Story = {
  name: 'No props',
  render: () => <SettingsPage />,
}

export const Notifications: Story = { args: { defaultSection: 'notifications' } }

export const Security: Story = { args: { defaultSection: 'security' } }

export const Usage: Story = { args: { defaultSection: 'usage' } }

export const Phone: Story = {
  name: 'Small screen (390px)',
  decorators: [(Story) => <div className="w-97.5">{Story()}</div>],
}

// Proves the nav switches the page and moves focus to the new heading.
export const SwitchingPages: Story = {
  name: 'Switching pages',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nav = canvas.getByRole('navigation', { name: 'Northlight Studio workspace' })
    await userEvent.click(within(nav).getByRole('button', { name: 'Security' }))
    const heading = canvas.getByRole('heading', { level: 1, name: 'Security' })
    await waitFor(() => expect(heading).toHaveFocus())
    await expect(canvas.getByRole('heading', { name: /Where you.re signed in/ })).toBeInTheDocument()
    await expect(within(nav).getByRole('button', { name: 'Security' })).toHaveAttribute('aria-current', 'page')
  },
}

export const SavingProfile: Story = {
  name: 'Saving the profile',
  args: { onSaveProfile: () => wait(20) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const name = canvas.getByLabelText('Display name')
    await userEvent.clear(name)
    await userEvent.type(name, 'Maya O.')
    await userEvent.click(canvas.getByRole('button', { name: 'Save profile' }))
    await expect(await canvas.findByText('Profile saved.')).toBeInTheDocument()
  },
}

function CardSketch({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-card p-4">
      <p className="text-sm font-medium">{title}</p>
      {rows.map((row) => (
        <div key={row} className="flex items-center justify-between gap-3 border-t border-divider pt-2 text-xs">
          {row}
          <Switch size="default" aria-label={row} />
        </div>
      ))}
    </div>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="one-card-per-topic"
        doExample={
          <div className="flex flex-col gap-3">
            <CardSketch title="Sharing" rows={['Show new generations on my profile']} />
            <CardSketch title="Sign-in" rows={['Two-step sign-in']} />
          </div>
        }
        dontExample={
          <CardSketch title="Settings" rows={['Show new generations on my profile', 'Two-step sign-in', 'Weekly digest', 'Product news']} />
        }
      />
    </div>
  ),
}
