import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { AppShell } from '@/registry/app-shell'
import { SAMPLE_ACCOUNT, SAMPLE_NAV_LINKS, SampleLibraryPage, sampleNavigation } from '@/registry/sample-content'
import { usage } from '../usage/app-shell.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

// The sample bar on a library page: Canvas and Library take Projects' place,
// and the account menu comes from the shell's own `account` prop.
const navigation = {
  ...sampleNavigation('/library'),
  links: [...SAMPLE_NAV_LINKS.filter((link) => link.href !== '/projects'), { label: 'Canvas', href: '/canvas' }, { label: 'Library', href: '/library' }],
  onSearch: fn(),
  account: undefined,
}

const account = SAMPLE_ACCOUNT

const meta = {
  title: 'Templates / App Shell',
  component: AppShell,
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  // The story frame pads every story; a shell is meant to touch the edges.
  decorators: [(Story, { parameters }) => (parameters.layout === 'fullscreen' ? <div className="-m-6">{Story()}</div> : Story())],
  args: { navigation, account, children: <SampleLibraryPage /> },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// Bare, like a component dropped in from a library: every prop falls back to the sample content.
export const NoProps: Story = {
  name: 'No props',
  render: () => <AppShell />,
}

export const SignedOut: Story = {
  name: 'Signed out',
  args: {
    account: undefined,
    navigation: { ...navigation, credits: undefined, assetsHref: undefined, account: <Button variant="brand" size="sm">Sign up</Button> },
  },
}

export const Phone: Story = {
  name: 'Small screen (390px)',
  decorators: [(Story) => <div className="w-97.5">{Story()}</div>],
}

// Proves the skip link is the first stop and points at the content area.
export const SkipLink: Story = {
  name: 'Skip link',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.tab()
    const skip = canvas.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toHaveFocus()
    const main = canvas.getByRole('main')
    await expect(skip).toHaveAttribute('href', `#${main.id}`)
  },
}

function ShellSketch({ nested }: { nested?: boolean }) {
  return (
    <div className="flex h-48 flex-col overflow-hidden rounded-xl bg-background">
      <div className="h-8 shrink-0 bg-glass" />
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3">
        {nested ? (
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-lg border border-divider p-2">
            {Array.from({ length: 8 }, (_, index) => <div key={index} className="h-6 shrink-0 rounded-md bg-card" />)}
          </div>
        ) : (
          Array.from({ length: 4 }, (_, index) => <div key={index} className="h-6 shrink-0 rounded-md bg-card" />)
        )}
        {nested ? <p className="text-xs text-muted-foreground">Two scroll areas</p> : <p className="text-xs text-muted-foreground">One scroll area</p>}
      </div>
    </div>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair usage={usage} id="one-scroll-area" doExample={<ShellSketch />} dontExample={<ShellSketch nested />} />
    </div>
  ),
}
