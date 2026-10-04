import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { HeadingAccent } from '@/components/ui/heading'
import { HowItWorks } from '@/registry/how-it-works'
import { usage } from '../usage/how-it-works.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const STEPS = [
  {
    title: 'Drop in a still',
    description: 'Upload a photo or pick one from your generations to set the first frame.',
    media: { src: 'https://picsum.photos/seed/upload/800/450', alt: 'A still photo of a coastline ready to upload' },
  },
  {
    title: 'Choose a motion',
    description: 'Pick a camera move such as a slow push-in or orbit, or describe your own.',
    media: { src: 'https://picsum.photos/seed/motion/800/450', alt: 'Camera motion presets shown as small previews' },
  },
  {
    title: 'Get your clip',
    description: 'Generate and download a six-second clip in 1080p, ready to cut into your edit.',
    media: { src: 'https://picsum.photos/seed/clip/800/450', alt: 'The finished video clip playing in a frame' },
  },
]

const meta = {
  title: 'Blocks / How It Works',
  component: HowItWorks,
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    title: (
      <>
        Turn a photo into <HeadingAccent>motion</HeadingAccent>
      </>
    ),
    description: 'Three steps from a single image to a shareable clip. No timeline, no keyframes.',
    steps: STEPS,
    className: 'max-w-5xl',
  },
} satisfies Meta<typeof HowItWorks>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3)
    await expect(canvas.getByRole('heading', { level: 3, name: 'Choose a motion' })).toBeVisible()
  },
}

export const WithoutDescription: Story = {
  args: { description: undefined, title: 'How it works' },
}

export const LongCopy: Story = {
  args: {
    steps: STEPS.map((step, index) =>
      index === 1
        ? { ...step, description: 'Pick a camera move such as a slow push-in, an orbit around your subject or a handheld drift, then set how fast it moves.' }
        : step,
    ),
  },
}

export const DoDont: Story = {
  render: () => (
    <div className="max-w-4xl">
      <DoDontPair
        usage={usage}
        id="one-sentence-per-step"
        doExample={<HowItWorks title="How it works" steps={STEPS.slice(0, 2)} />}
        dontExample={
          <HowItWorks
            title="How it works"
            steps={[
              {
                ...STEPS[0],
                title: 'First you will need to upload a still image',
                description:
                  'Start by uploading a photo from your computer, or choose any image you made earlier from your generations. Larger images work better, and you can crop later. Supported formats include PNG, JPG and WebP up to 20 MB.',
              },
              STEPS[1],
            ]}
          />
        }
      />
    </div>
  ),
}
