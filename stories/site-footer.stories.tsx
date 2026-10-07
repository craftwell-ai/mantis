import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ReactNode } from 'react'
import { expect, within } from 'storybook/test'

import { SiteFooter, type SiteFooterColumn } from '@/registry/site-footer'
import { usage } from '../usage/site-footer.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const columns: SiteFooterColumn[] = [
  {
    title: 'Create',
    links: [
      { label: 'Image studio', href: '#image' },
      { label: 'Video studio', href: '#video' },
      { label: 'Motion presets', href: '#motion' },
      { label: 'Upscaler', href: '#upscale' },
      { label: 'Canvas', href: '#canvas' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Guides', href: '#guides' },
      { label: 'Prompt library', href: '#prompts' },
      { label: 'Changelog', href: '#changelog' },
      { label: 'System status', href: '#status' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Careers', href: '#careers' },
      { label: 'Press kit', href: '#press' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Plans',
    links: [
      { label: 'Pricing', href: '#pricing' },
      { label: 'Teams', href: '#teams' },
      { label: 'Education', href: '#education' },
    ],
  },
]

// Material Symbols has no brand marks, so each network gets a generic symbol
// and its name as the label.
const socials = [
  { label: 'Video channel', href: '#video-channel', icon: 'smart_display' as const },
  { label: 'Photo feed', href: '#photo-feed', icon: 'photo_camera' as const },
  { label: 'Community forum', href: '#forum', icon: 'forum' as const },
  { label: 'Newsletter', href: '#newsletter', icon: 'mail' as const },
]

const legalLinks = [
  { label: 'Privacy', href: '#privacy' },
  { label: 'Terms', href: '#terms' },
  { label: 'Cookies', href: '#cookies' },
]

const meta = {
  title: 'Blocks / Site Footer',
  component: SiteFooter,
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    brandName: 'Lumen',
    tagline: 'Every frame you imagine, made in minutes',
    columns,
    socials,
    legal: '© 2026 Lumen Labs, Inc.',
    legalLinks,
  },
} satisfies Meta<typeof SiteFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Plain: Story = {
  name: 'Plain (in-app pages)',
  args: { tone: 'plain', columns: columns.slice(0, 2) },
}

export const LegalOnly: Story = {
  name: 'Legal line only',
  args: { tone: 'plain', columns: [], socials: [], tagline: undefined },
}

export const Narrow: Story = {
  name: 'Narrow screen',
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
  // The box is narrow but the window is wide: the footer must lay out for the box. Two link columns
  // fit here, so the third starts a new row under the first instead of squeezing in beside it.
  play: async ({ canvasElement }) => {
    const [first, second, third] = within(canvasElement).getAllByRole('navigation').map((column) => column.getBoundingClientRect())
    await expect(second.left).toBeGreaterThanOrEqual(first.right)
    await expect(third.top).toBeGreaterThanOrEqual(first.bottom)
    await expect(third.left).toBe(first.left)
  },
}

// Proves each column is a named group and every social link has a name.
export const Landmarks: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('navigation', { name: 'Create' })).toBeInTheDocument()
    for (const social of socials) await expect(canvas.getByRole('link', { name: social.label })).toBeInTheDocument()
  },
}

// Footers inside a labelled section are not read as extra page footers.
const frame = (label: string, footer: ReactNode) => <section aria-label={label}>{footer}</section>

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-5xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="lime-footer-once"
        doExample={frame('Do: plain footer in the app', <SiteFooter brandName="Lumen" tone="plain" columns={[]} legal="© 2026 Lumen Labs, Inc." legalLinks={legalLinks.slice(0, 2)} />)}
        dontExample={frame('Don’t: lime footer in the app', <SiteFooter brandName="Lumen" columns={[]} legal="© 2026 Lumen Labs, Inc." legalLinks={legalLinks.slice(0, 2)} />)}
      />
      <DoDontPair
        usage={usage}
        id="short-columns"
        doExample={frame('Do: titled columns', <SiteFooter brandName="Lumen" tone="plain" columns={columns.slice(0, 2)} legal="© 2026 Lumen Labs, Inc." />)}
        dontExample={frame(
          'Don’t: one long column',
          <SiteFooter
            brandName="Lumen"
            tone="plain"
            columns={[{ title: 'Links', links: columns.flatMap((column) => column.links) }]}
            legal="© 2026 Lumen Labs, Inc."
          />,
        )}
      />
    </div>
  ),
}
