import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Badge } from '@/components/ui/badge'
import { IconTile } from '@/components/ui/icon-tile'
import { ModelPicker, type ModelPickerModel } from '@/registry/model-picker'
import { usage } from '../usage/model-picker.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

// Invented models for the stories only; a product passes its own list.
const MODELS: ModelPickerModel[] = [
  { value: 'lumen-3', label: 'Lumen 3', description: 'Smooth camera moves and lifelike light, up to 10 seconds', icon: 'movie', featured: true, badge: 'new' },
  { value: 'halcyon', label: 'Halcyon', description: 'Portraits and faces that stay the same from shot to shot', icon: 'photo_camera', featured: true },
  { value: 'ember-fast', label: 'Ember Fast', description: 'Quick drafts in seconds, for testing an idea', icon: 'bolt', featured: true, badge: 'hot' },
  { value: 'quill-sketch', label: 'Quill Sketch', description: 'Turns line drawings into finished illustration', icon: 'brush' },
  { value: 'driftwood', label: 'Driftwood', description: 'Wide landscapes and weather with natural color', icon: 'landscape' },
  { value: 'loop-studio', label: 'Loop Studio', description: 'Seamless short loops for backgrounds and social posts', icon: 'animation' },
  { value: 'haze', label: 'Haze', description: 'Dreamy, soft-focus looks with film grain', icon: 'blur_on' },
]

const meta = {
  title: 'Blocks / Model Picker',
  component: ModelPicker,
  args: { models: MODELS, defaultValue: 'halcyon', onValueChange: fn() },
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof ModelPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Chip: Story = {}

export const Open: Story = {
  decorators: [(Story) => <div className="pb-120"><Story /></div>],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('combobox', { name: 'Model' }))
    const list = await page.findByRole('listbox')
    // axe runs as soon as play ends; wait for the fade so it measures real colors.
    await waitFor(() => expect(getComputedStyle(list.closest('[data-slot="combobox-content"]') ?? list).opacity).toBe('1'))
    await expect(page.getByRole('option', { name: /Halcyon/ })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByText('Featured')).toBeVisible()
    await expect(page.getByText('All models')).toBeVisible()
  },
}

export const SearchAndPick: Story = {
  name: 'Search and pick',
  decorators: [(Story) => <div className="pb-120"><Story /></div>],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    const trigger = canvas.getByRole('combobox', { name: 'Model' })
    await userEvent.click(trigger)
    // Search matches descriptions too: "line drawings" finds Quill Sketch.
    await userEvent.type(await page.findByRole('combobox', { name: 'Search models' }), 'line drawings')
    await waitFor(() => expect(page.getAllByRole('option')).toHaveLength(1))
    await userEvent.click(page.getByRole('option', { name: /Quill Sketch/ }))
    await expect(args.onValueChange).toHaveBeenCalledWith('quill-sketch')
    await waitFor(() => expect(trigger).toHaveTextContent('Quill Sketch'))
    await waitFor(() => expect(page.queryByRole('listbox')).toBeNull())
  },
}

export const NoResults: Story = {
  name: 'No results',
  decorators: [(Story) => <div className="pb-72"><Story /></div>],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('combobox', { name: 'Model' }))
    await userEvent.type(await page.findByRole('combobox', { name: 'Search models' }), 'xylophone')
    await expect(await page.findByText('No models match that search.')).toBeVisible()
    const popup = canvasElement.ownerDocument.querySelector('[data-slot="combobox-content"]')
    await waitFor(() => expect(getComputedStyle(popup ?? document.body).opacity).toBe('1'))
  },
}

export const Row: Story = {
  name: 'Row trigger (settings rail)',
  args: { trigger: 'row', defaultValue: 'lumen-3' },
  decorators: [(Story) => <div className="w-80 rounded-2xl bg-card p-3"><Story /></div>],
}

export const WithoutFeatured: Story = {
  name: 'No featured models',
  args: { models: MODELS.map((model) => ({ ...model, featured: false })), defaultValue: 'driftwood' },
  decorators: [(Story) => <div className="pb-120"><Story /></div>],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('combobox', { name: 'Model' }))
    const list = await page.findByRole('listbox')
    await waitFor(() => expect(getComputedStyle(list.closest('[data-slot="combobox-content"]') ?? list).opacity).toBe('1'))
    await expect(page.queryByText('Featured')).toBeNull()
  },
}

// A static row for the Do/Don't pairs, so each side shows only the difference.
function ModelRow({ name, description, badges = [] }: { name: string; description: string; badges?: ('new' | 'hot')[] }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-popover p-2">
      <IconTile name="movie" size="lg" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          {name}
          {badges.includes('new') ? <Badge variant="new">New</Badge> : null}
          {badges.includes('hot') ? <Badge variant="neutral">Hot</Badge> : null}
        </span>
        <span className="truncate text-xs text-muted-foreground">{description}</span>
      </div>
    </div>
  )
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="describe-what-it-is-for"
        doExample={<ModelRow name="Lumen 3" description="Smooth camera moves and lifelike light" />}
        dontExample={<ModelRow name="Lumen 3" description="Our best model yet, version 3.0" />}
      />
      <DoDontPair
        usage={usage}
        id="one-badge-per-row"
        doExample={<ModelRow name="Lumen 3" description="Smooth camera moves and lifelike light" badges={['new']} />}
        dontExample={<ModelRow name="Lumen 3" description="Smooth camera moves and lifelike light" badges={['new', 'hot']} />}
      />
    </div>
  ),
}
