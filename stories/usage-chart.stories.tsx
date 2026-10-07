import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { UsageChart, type UsageChartPoint, type UsageChartSeries } from '@/registry/usage-chart'
import { usage } from '../usage/usage-chart.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'

// Invented tools and numbers for the stories only.
const SERIES: UsageChartSeries[] = [
  { key: 'image', label: 'Image studio' },
  { key: 'video', label: 'Video studio' },
  { key: 'upscale', label: 'Upscaler' },
]

const WEEK: UsageChartPoint[] = [
  { label: 'Mon', values: { image: 120, video: 80, upscale: 24 } },
  { label: 'Tue', values: { image: 96, video: 140, upscale: 36 } },
  { label: 'Wed', values: { image: 164, video: 60, upscale: 12 } },
  { label: 'Thu', values: { image: 132, video: 190, upscale: 48 } },
  { label: 'Fri', values: { image: 210, video: 120, upscale: 30 } },
  { label: 'Sat', values: { image: 64, video: 40, upscale: 8 } },
  { label: 'Sun', values: { image: 44, video: 28, upscale: 4 } },
]

const meta = {
  title: 'Blocks / Usage Chart',
  component: UsageChart,
  args: { title: 'Credits spent this week', description: 'Sep 29 to Oct 5 · 1,850 credits', series: SERIES, data: WEEK, unit: 'credits' },
  decorators: [(Story) => <div className="w-full max-w-180"><Story /></div>],
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof UsageChart>

export default meta
type Story = StoryObj<typeof meta>

export const Bars: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('figure', { name: 'Credits spent this week' })).toBeVisible()
    // The numbers are also a table, for people who cannot see the drawing.
    const table = canvas.getByRole('table', { name: /Credits spent this week, in credits/ })
    await expect(within(table).getAllByRole('row')).toHaveLength(8)
    await expect(within(table).getByRole('rowheader', { name: 'Thu' })).toBeInTheDocument()
    await expect(within(canvas.getByRole('list', { name: 'Series' })).getAllByRole('listitem')).toHaveLength(3)
  },
}

export const Lines: Story = { args: { type: 'line', title: 'Credits by tool' } }

export const Areas: Story = { args: { type: 'area', title: 'How the week adds up' } }

export const OneSeries: Story = {
  name: 'One series',
  args: { title: 'Generations per day', description: 'Sep 29 to Oct 5', series: [{ key: 'image', label: 'Generations' }], unit: 'generations' },
}
