import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, screen, userEvent, within } from 'storybook/test'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AccountMenu } from '@/registry/account-menu'
import { TopNavigation } from '@/registry/top-navigation'
import { usage } from '../usage/top-navigation.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const links = [
  { label: 'Explore', href: '#explore' },
  { label: 'Image', href: '#image' },
  { label: 'Video', href: '#video' },
  { label: 'Motion', href: '#motion', badge: 'New' },
  { label: 'Canvas', href: '#canvas' },
  { label: 'Library', href: '#library' },
]

const account = (
  <AccountMenu
    user={{ name: 'Maya Okafor', email: 'maya@northlight.studio', plan: 'Creator', avatarSrc: 'https://picsum.photos/seed/avatar/96/96' }}
    credits={{ used: 1760, total: 3000 }}
    upsells={[{ icon: 'add_circle', label: 'Top up credits', actionLabel: 'Buy' }]}
  />
)

const meta = {
  title: 'Blocks / Top Navigation',
  component: TopNavigation,
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    brandName: 'Lumen',
    links,
    activeHref: '#image',
    onSearch: fn(),
    pricing: { label: 'Pricing', href: '#pricing', saleTag: '30% off' },
    assetsHref: '#assets',
    credits: 1240,
    creditsHref: '#usage',
    account,
  },
} satisfies Meta<typeof TopNavigation>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SignedOut: Story = {
  name: 'Signed out',
  args: {
    assetsHref: undefined,
    credits: undefined,
    account: <Button variant="brand" size="sm">Sign up</Button>,
  },
}

export const NoSale: Story = {
  name: 'Pricing without a sale',
  args: { pricing: { label: 'Pricing', href: '#pricing' } },
}

export const Phone: Story = {
  name: 'Small screen',
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
}

// Proves ⌘K and the search pill both open search.
export const OpeningSearch: Story = {
  name: 'Opening search',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.keyboard('{Meta>}k{/Meta}')
    await expect(args.onSearch).toHaveBeenCalledTimes(1)
    const pills = canvas.getAllByRole('button', { name: /Search/ })
    await userEvent.click(pills.find((pill) => pill.checkVisibility()) ?? pills[0])
    await expect(args.onSearch).toHaveBeenCalledTimes(2)
  },
}

// Proves the active link is marked for assistive tech, not only by color.
export const ActiveLink: Story = {
  name: 'Active link',
  // Wide enough for the links to show whatever the test window's size.
  decorators: [(Story) => <div className="w-300">{Story()}</div>],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nav = canvas.getByRole('navigation', { name: 'Main' })
    await expect(within(nav).getByRole('link', { name: 'Image' })).toHaveAttribute('aria-current', 'page')
  },
}

// The menu sheet that replaces the links below 1024px.
export const MenuSheet: Story = {
  name: 'Menu sheet (small screen)',
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }))
    const dialog = await screen.findByRole('dialog')
    await expect(within(dialog).getByRole('link', { name: /Motion/ })).toBeInTheDocument()
  },
}

// Flat drawings of the link row for the Do/Don't frames, which are narrower
// than the width where the real bar shows its links.
function LinkSketch({ items }: { items: { label: string; lime?: boolean; badge?: boolean }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-sm font-medium">
      {items.map((item) => (
        <span key={item.label} className={`flex h-8 items-center gap-1.5 px-2 ${item.lime ? 'text-brand-text' : 'text-muted-foreground'}`}>
          {item.label}
          {item.badge ? <Badge variant="new">New</Badge> : null}
        </span>
      ))}
    </div>
  )
}

// The right end of a signed-out bar, for the sign-up Do/Don't.
function SignedOutSketch({ limePricing }: { limePricing?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant={limePricing ? 'brand' : 'glass'} size="sm">
        Pricing
      </Button>
      <Button variant="brand" size="sm">
        Sign up
      </Button>
    </div>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="one-lime-link"
        doExample={<LinkSketch items={[{ label: 'Explore' }, { label: 'Image', lime: true }, { label: 'Video' }, { label: 'Motion' }]} />}
        dontExample={<LinkSketch items={[{ label: 'Explore' }, { label: 'Image', lime: true }, { label: 'Video' }, { label: 'Motion', lime: true }]} />}
      />
      <DoDontPair
        usage={usage}
        id="lime-sign-up-when-signed-out"
        doExample={<SignedOutSketch />}
        dontExample={<SignedOutSketch limePricing />}
      />
      <DoDontPair
        usage={usage}
        id="few-new-badges"
        doExample={<LinkSketch items={[{ label: 'Explore' }, { label: 'Image', lime: true }, { label: 'Video' }, { label: 'Motion', badge: true }]} />}
        dontExample={
          <LinkSketch
            items={[
              { label: 'Explore', badge: true },
              { label: 'Image', lime: true, badge: true },
              { label: 'Video', badge: true },
              { label: 'Motion', badge: true },
            ]}
          />
        }
      />
    </div>
  ),
}
