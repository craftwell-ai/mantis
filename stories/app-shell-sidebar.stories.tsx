import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, screen, userEvent, within } from 'storybook/test'

import { buttonVariants } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/ui/icon'
import { AppShellSidebar } from '@/registry/app-shell-sidebar'
import { SAMPLE_ACCOUNT, SAMPLE_CREDITS, SAMPLE_NAV_LINKS, SAMPLE_SIDEBAR_LABEL, SAMPLE_SIDEBAR_SECTIONS, SampleProjectsPage, sampleNavigation } from '@/registry/sample-content'
import { usage } from '../usage/app-shell-sidebar.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

// The sample bar inside the Studio area: a Studio link stands in for Motion and
// Projects, there is no sale tag or assets link, and the account comes from `account`.
const navigation = {
  ...sampleNavigation('/studio'),
  links: [...SAMPLE_NAV_LINKS.slice(0, 3), { label: 'Studio', href: '/studio', badge: 'New' }, { label: 'Library', href: '/library' }],
  onSearch: fn(),
  pricing: { label: 'Pricing', href: '/pricing' },
  assetsHref: undefined,
  account: undefined,
}

// Initials instead of a photo, and no top-up offer in the menu.
const account = { user: { ...SAMPLE_ACCOUNT.user, avatarSrc: undefined }, credits: SAMPLE_ACCOUNT.credits }

const footer = (
  <div className="flex flex-col gap-2 rounded-xl bg-card p-3">
    <p className="text-sm font-medium">{SAMPLE_CREDITS.toLocaleString('en-US')} credits left</p>
    <p className="text-xs text-muted-foreground">Your credits renew on October 14.</p>
    <a href="#pricing" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
      See plans
    </a>
  </div>
)

const meta = {
  title: 'Templates / App Shell Sidebar',
  component: AppShellSidebar,
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  decorators: [(Story, { parameters }) => (parameters.layout === 'fullscreen' ? <div className="-m-6">{Story()}</div> : Story())],
  args: {
    navigation,
    account,
    sidebarLabel: SAMPLE_SIDEBAR_LABEL,
    sections: SAMPLE_SIDEBAR_SECTIONS,
    activeHref: '#projects',
    sidebarFooter: footer,
    children: <SampleProjectsPage />,
  },
} satisfies Meta<typeof AppShellSidebar>

export default meta
type Story = StoryObj<typeof meta>

// Wide enough for the sidebar to sit beside the page, whatever the test window.
const wide = (Story: () => React.ReactNode) => <div className="w-320">{Story()}</div>

export const Default: Story = { decorators: [wide] }

// Bare, like a component dropped in from a library: every prop falls back to the sample content.
export const NoProps: Story = {
  name: 'No props',
  render: () => <AppShellSidebar />,
}

export const Collapsed: Story = {
  decorators: [wide],
  args: { defaultCollapsed: true },
}

export const Phone: Story = {
  name: 'Small screen (390px)',
  decorators: [(Story) => <div className="w-97.5">{Story()}</div>],
}

// Proves collapsing keeps every row named and the current row marked.
export const Collapsing: Story = {
  decorators: [wide],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Collapse sidebar' }))
    await expect(canvas.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument()
    const nav = canvas.getByRole('navigation', { name: 'Studio' })
    await expect(within(nav).getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page')
    await expect(within(nav).getByRole('link', { name: /Voiceover.*New/ })).toBeInTheDocument()
  },
}

// Below 1024px the sidebar opens in a sheet from the bar above the content.
export const SidebarSheet: Story = {
  name: 'Sidebar sheet (small screen)',
  decorators: [(Story) => <div className="w-97.5">{Story()}</div>],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /Open Studio menu/ }))
    const dialog = await screen.findByRole('dialog')
    await expect(within(dialog).getByRole('link', { name: 'Autumn lookbook' })).toBeInTheDocument()
  },
}

function RailSketch({ icons, limeIndex }: { icons: IconName[]; limeIndex?: number }) {
  return (
    <ul className="flex w-14 flex-col items-center gap-1 rounded-xl bg-background p-2">
      {icons.map((icon, index) => (
        <li
          key={index}
          className={`flex size-10 items-center justify-center rounded-lg ${
            index === 1 ? (limeIndex === 1 ? 'bg-brand text-brand-foreground' : 'bg-glass text-foreground') : 'text-muted-foreground'
          }`}
        >
          <Icon name={icon} className="size-5" />
        </li>
      ))}
    </ul>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="icon-on-every-row"
        doExample={<RailSketch icons={['grid_view', 'folder', 'photo_library', 'favorite']} />}
        dontExample={<RailSketch icons={['folder', 'folder', 'folder', 'folder']} />}
      />
      <DoDontPair
        usage={usage}
        id="sidebar-not-lime"
        doExample={<RailSketch icons={['grid_view', 'folder', 'photo_library', 'favorite']} />}
        dontExample={<RailSketch icons={['grid_view', 'folder', 'photo_library', 'favorite']} limeIndex={1} />}
      />
    </div>
  ),
}
