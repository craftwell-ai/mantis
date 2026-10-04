import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { LandingPage } from '@/registry/landing-page'
import { usage } from '../usage/landing-page.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'

const meta = {
  title: 'Templates / Landing Page',
  component: LandingPage,
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof LandingPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    await expect(canvas.getByRole('link', { name: 'Create a free account' })).toHaveAttribute('href', '/sign-up')
  },
}

export const ToolPage: Story = {
  name: 'Tool page',
  args: {
    hero: {
      eyebrow: 'Relight',
      headline: 'Move the sun after the shoot',
      accent: 'the sun',
      description: 'Upload a photo, drag the light where you want it, and get the same scene at golden hour, noon or night.',
      primaryAction: { label: 'Try Relight free', href: '/sign-up' },
      media: [{ src: 'https://picsum.photos/seed/relight-hero/1280/720', alt: 'Placeholder for a photo relit from noon to sunset' }],
    },
    cta: {
      title: 'Relight your first photo today',
      accent: 'first photo',
      action: { label: 'Try Relight free', href: '/sign-up' },
    },
  },
}

// Bare, like a component dropped in from a library: every prop falls back to the sample content.
export const NoProps: Story = {
  name: 'No props',
  render: () => <LandingPage />,
}
