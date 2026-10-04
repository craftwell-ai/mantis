import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { UsageSummary, type UsageCategory, type UsageEntry } from '@/registry/usage-summary'
import { usage } from '../usage/usage-summary.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const categories: UsageCategory[] = [
  { id: 'image', label: 'Image studio', credits: 412 },
  { id: 'video', label: 'Video studio', credits: 268 },
  { id: 'upscale', label: 'Upscaler', credits: 96 },
  { id: 'voice', label: 'Voiceover', credits: 54 },
  { id: 'lipsync', label: 'Lip sync', credits: 38 },
  { id: 'relight', label: 'Relight', credits: 22 },
  { id: 'storyboard', label: 'Storyboard', credits: 15 },
]

const tools = categories.map((category) => category.id)
// Deterministic fake history so screenshots and tests stay stable.
const entries: UsageEntry[] = Array.from({ length: 34 }, (_, index) => {
  const refunded = index % 7 === 3
  const day = 2 - Math.floor(index / 6)
  return {
    id: `entry-${index}`,
    credits: [27, 8, 36, 0.5, 12, 18][index % 6],
    categoryId: tools[index % tools.length],
    action: refunded ? 'refunded' : 'spent',
    date: `${day > 0 ? `Oct ${day}` : `Sep ${30 + day}`}, ${(index % 12) + 1}:${String((index * 7) % 60).padStart(2, '0')} PM`,
  }
})

const meta = {
  title: 'Blocks / Usage Summary',
  component: UsageSummary,
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    categories,
    entries,
    stats: [
      { label: 'Generations', value: '188', icon: 'image' },
      { label: 'Refunded', value: '108', icon: 'refresh' },
    ],
  },
  decorators: [(Story) => <div className="max-w-4xl"><Story /></div>],
} satisfies Meta<typeof UsageSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = {
  args: { loading: true },
}

export const Empty: Story = {
  name: 'No usage yet',
  args: { categories: categories.map((category) => ({ ...category, credits: 0 })), entries: [], stats: [] },
}

export const Paging: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Page 1 of 4')).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }))
    await expect(canvas.getByText('Page 2 of 4')).toBeInTheDocument()
  },
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-5xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="legend-states-the-share"
        doExample={
          <div className="flex flex-col gap-3">
            <div aria-hidden="true" className="flex h-2 gap-0.5 overflow-hidden rounded-full">
              <span className="w-3/5 bg-chart-1" />
              <span className="w-2/5 bg-chart-2" />
            </div>
            <ul className="flex gap-4 text-xs">
              <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2 rounded-full bg-chart-1" />Image studio <span className="text-muted-foreground">60%</span></li>
              <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2 rounded-full bg-chart-2" />Video studio <span className="text-muted-foreground">40%</span></li>
            </ul>
          </div>
        }
        dontExample={
          <div role="img" aria-label="Unlabelled bar of colored segments" className="flex h-2 gap-0.5 overflow-hidden rounded-full">
            <span className="w-3/5 bg-chart-1" />
            <span className="w-2/5 bg-chart-2" />
          </div>
        }
      />
    </div>
  ),
}
