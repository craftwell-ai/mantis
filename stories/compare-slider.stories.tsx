import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { CompareSlider } from '@/registry/compare-slider'
import { usage } from '../usage/compare-slider.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'

// The same placeholder photo twice: once blurred, standing in for a soft original, and once sharp,
// standing in for the upscaled result. A fixed photo id is used so both sides are the same picture.
const sharp = 'https://picsum.photos/id/1039/1280/720'
const soft = 'https://picsum.photos/id/1039/1280/720?blur=4'
const gray = 'https://picsum.photos/id/1039/1280/720?grayscale'

const meta = {
  title: 'Blocks / Compare Slider',
  component: CompareSlider,
  args: {
    before: { src: soft, alt: 'A waterfall in a green valley, soft and low in detail', label: 'Original' },
    after: { src: sharp, alt: 'The same waterfall, sharp and detailed', label: '4K upscale' },
    label: 'Original and 4K upscale',
  },
  decorators: [(Story) => <div className="w-full max-w-180"><Story /></div>],
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof CompareSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const divider = await canvas.findByRole('slider', { name: 'Original and 4K upscale' })
    await expect(divider).toHaveAttribute('aria-valuenow', '50')
    await expect(canvas.getByText('Original')).toBeVisible()
    await expect(canvas.getByText('4K upscale')).toBeVisible()
  },
}

// The arrow keys move the divider, so the comparison works without a pointer.
export const WithTheKeyboard: Story = {
  name: 'With the keyboard',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const divider = await canvas.findByRole('slider', { name: 'Original and 4K upscale' })
    divider.focus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await expect(divider).toHaveAttribute('aria-valuenow', '60')
  },
}

export const StartingOffCentre: Story = {
  name: 'Starting off centre',
  args: { defaultPosition: 25 },
}

export const ColorChange: Story = {
  name: 'A color change, square',
  args: {
    aspect: 'square',
    before: { src: gray, alt: 'A waterfall in a valley, in black and white', label: 'Black and white' },
    after: { src: sharp, alt: 'The same waterfall in color', label: 'Colorized' },
    label: 'Black and white and colorized',
  },
  decorators: [(Story) => <div className="w-96"><Story /></div>],
}
