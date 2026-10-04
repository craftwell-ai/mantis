import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { FeatureGrid, type Feature } from '@/registry/feature-grid'
import { usage } from '../usage/feature-grid.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const features: Feature[] = [
  {
    title: 'Camera moves',
    description: 'Dolly, orbit or crane through a scene with one setting.',
    image: { src: 'https://picsum.photos/seed/camera/800/600', alt: 'Placeholder for a clip made with a camera move' },
    href: '#camera',
    badge: 'New',
  },
  {
    title: 'Relight',
    description: 'Change the time of day on a photo without reshooting it.',
    image: { src: 'https://picsum.photos/seed/relight/800/600', alt: 'Placeholder for a relit photograph' },
    href: '#relight',
  },
  {
    title: 'Consistent characters',
    description: 'Keep one face and outfit across every shot in a story.',
    image: { src: 'https://picsum.photos/seed/character/800/600', alt: 'Placeholder for a character shown in several scenes' },
    href: '#characters',
  },
  {
    title: 'Upscale to 4K',
    description: 'Sharpen any generation for print or a big screen.',
    image: { src: 'https://picsum.photos/seed/upscale/800/600', alt: 'Placeholder for an upscaled detail shot' },
    href: '#upscale',
  },
  {
    title: 'Lip sync',
    description: 'Match a voiceover to a face in any clip.',
    image: { src: 'https://picsum.photos/seed/lipsync/800/600', alt: 'Placeholder for a speaking portrait' },
    href: '#lipsync',
  },
  {
    title: 'Storyboards',
    description: 'Turn a script into a frame-by-frame plan in minutes.',
    image: { src: 'https://picsum.photos/seed/storyboard/800/600', alt: 'Placeholder for a storyboard frame' },
    href: '#storyboards',
  },
]

const meta = {
  title: 'Blocks / Feature Grid',
  component: FeatureGrid,
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    title: 'Everything you need to finish the film',
    accent: 'finish',
    description: 'Each tool works on its own or as a step in the same project.',
    features,
  },
} satisfies Meta<typeof FeatureGrid>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const FourColumns: Story = {
  name: 'Four columns',
  args: { columns: 4, features: features.slice(0, 4) },
}

export const WithoutLinks: Story = {
  name: 'Without links',
  args: { features: features.slice(0, 3).map((feature) => ({ ...feature, href: undefined })) },
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-5xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="image-first-cards"
        doExample={<FeatureGrid title="Tools" features={features.slice(0, 2)} columns={2} />}
        dontExample={
          <div className="grid grid-cols-2 gap-3">
            {features.slice(0, 2).map((feature) => (
              <Card key={feature.title} className="px-4">
                <Icon name="star_shine-fill" className="size-6" />
                <p className="font-medium">{feature.title}</p>
                <p className="text-muted-foreground">{feature.description} It also handles batches, presets, history, sharing and many more workflows for every kind of team.</p>
              </Card>
            ))}
          </div>
        }
      />
    </div>
  ),
}
