import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Heading, HeadingAccent } from '@/components/ui/heading'
import { MarketingHero } from '@/registry/marketing-hero'
import { usage } from '../usage/marketing-hero.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const media = [
  { src: 'https://picsum.photos/seed/hero/1280/720', alt: 'Placeholder for a wide generated film still, the main showcase image' },
  { src: 'https://picsum.photos/seed/hero-portrait/640/360', alt: 'Placeholder for a generated portrait example' },
  { src: 'https://picsum.photos/seed/hero-product/640/360', alt: 'Placeholder for a generated product shot example' },
]

const meta = {
  title: 'Blocks / Marketing Hero',
  component: MarketingHero,
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    eyebrow: 'Video studio',
    headline: 'Direct every shot from one sentence',
    accent: 'one sentence',
    description: 'Describe the scene, pick a camera move and get a ten-second clip you can cut straight into your edit.',
    primaryAction: { label: 'Start for free', href: '#start' },
    secondaryAction: { label: 'See examples', href: '#examples' },
    media,
  },
} satisfies Meta<typeof MarketingHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SingleImage: Story = {
  name: 'One image',
  args: { media: media.slice(0, 1) },
}

export const TextOnly: Story = {
  name: 'Without media',
  args: { media: [], eyebrow: undefined, secondaryAction: undefined },
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-5xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="one-lime-word"
        doExample={<Heading level="sub" render={<p />}>Direct every shot from <HeadingAccent>one sentence</HeadingAccent></Heading>}
        dontExample={<Heading level="sub" render={<p />}><HeadingAccent>Direct</HeadingAccent> every shot from <HeadingAccent>one sentence</HeadingAccent></Heading>}
      />
    </div>
  ),
}
