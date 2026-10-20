import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { CompareSlider } from '@/registry/compare-slider'
import { photo } from '@/registry/sample-content'
import { usage } from '../usage/compare-slider.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'

// The same sample photo three ways: blurred, standing in for a soft original; sharp, standing in for
// the upscaled result; and with its color taken out.
const sharp = photo('compare', 1280, 720)
const soft = `${sharp}&blur=60`
const gray = `${sharp}&sat=-100`

const meta = {
  title: 'Blocks / Compare Slider',
  component: CompareSlider,
  args: {
    before: { src: soft, alt: 'A city street at night, soft and low in detail', label: 'Original' },
    after: { src: sharp, alt: 'The same street, sharp and detailed', label: '4K upscale' },
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
    before: { src: gray, alt: 'A city street at night, in black and white', label: 'Black and white' },
    after: { src: sharp, alt: 'The same street in color', label: 'Colorized' },
    label: 'Black and white and colorized',
  },
  decorators: [(Story) => <div className="w-panel-2xl"><Story /></div>],
}
