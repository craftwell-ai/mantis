import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Icon } from '@/components/ui/icon'
import { PresetGallery, type GalleryModelTab, type GalleryPreset } from '@/registry/preset-gallery'
import { usage } from '../usage/preset-gallery.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

// Invented models and presets for the stories only; a product passes its own.
const MODELS: GalleryModelTab[] = [
  { value: 'lumen-3', label: 'Lumen 3' },
  { value: 'ember-fast', label: 'Ember Fast' },
  { value: 'loop-studio', label: 'Loop Studio' },
]

const preset = (value: string, title: string, models: string[], isNew = false): GalleryPreset => ({
  value,
  title,
  models,
  isNew,
  image: `https://picsum.photos/seed/${value}/480/270`,
  imageAlt: `Placeholder frame for the ${title} preset`,
})

const PRESETS: GalleryPreset[] = [
  preset('dolly', 'Slow dolly in', ['lumen-3', 'ember-fast']),
  preset('orbit', 'Orbit shot', ['lumen-3'], true),
  preset('film', 'Super 8 film', ['lumen-3', 'loop-studio']),
  preset('neon', 'Neon rain', ['ember-fast']),
  preset('crash', 'Crash zoom', ['lumen-3', 'ember-fast']),
  preset('paper', 'Paper cutout', ['loop-studio']),
  preset('handheld', 'Handheld run', ['lumen-3']),
  preset('timelapse', 'Cloud timelapse', ['loop-studio', 'ember-fast']),
  preset('ink', 'Ink bleed', ['loop-studio'], true),
]

const meta = {
  title: 'Blocks / Preset Gallery',
  component: PresetGallery,
  args: { presets: PRESETS, models: MODELS, defaultValue: 'film', onValueChange: fn() },
  decorators: [(Story) => <div className="w-full max-w-200"><Story /></div>],
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof PresetGallery>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const PickAPreset: Story = {
  name: 'Pick a preset',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Super 8 film' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(canvas.getByRole('button', { name: 'Orbit shot' }))
    await expect(args.onValueChange).toHaveBeenCalledWith('orbit')
    await expect(canvas.getByRole('button', { name: 'Orbit shot' })).toHaveAttribute('aria-pressed', 'true')
    await expect(canvas.getByRole('button', { name: 'Super 8 film' })).toHaveAttribute('aria-pressed', 'false')
  },
}

export const FilterByModel: Story = {
  name: 'Filter by model',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('tab', { name: 'Loop Studio' }))
    // The All panel stays mounted while it fades out, so wait for it to go.
    await waitFor(() => expect(canvas.queryByRole('button', { name: 'Neon rain' })).toBeNull())
    await expect(canvas.getByRole('button', { name: 'Paper cutout' })).toBeInTheDocument()
  },
}

export const NoSearchResults: Story = {
  name: 'No search results',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Search presets' }), 'underwater')
    await expect(canvas.getByText('No presets called "underwater"')).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }))
    await expect(canvas.getByRole('button', { name: 'Slow dolly in' })).toBeInTheDocument()
  },
}

export const Loading: Story = {
  args: { loading: true },
}

// Static tiles for the Do/Don't pairs.
function Tile({ title, selected = false, check = true, below = false }: { title: string; selected?: boolean; check?: boolean; below?: boolean }) {
  const image = (
    <img src="https://picsum.photos/seed/orbit/480/270" alt="Placeholder frame for the example preset" className={below ? 'size-16 rounded-lg object-cover' : 'absolute inset-0 -z-10 size-full object-cover'} />
  )
  if (below) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-card p-2">
        {image}
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs text-muted-foreground">The camera circles the subject</span>
        </div>
      </div>
    )
  }
  return (
    <div className={`relative isolate flex aspect-video w-full flex-col justify-end overflow-hidden rounded-xl p-3 ring-2 ${selected ? 'ring-brand' : 'ring-transparent'}`}>
      {image}
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-overlay to-transparent" />
      {selected && check ? (
        <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-brand text-brand-foreground">
          <Icon name="check" className="size-3.5" />
        </span>
      ) : null}
      <span className="font-grotesk text-label-caps text-foreground uppercase">{title}</span>
    </div>
  )
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair usage={usage} id="title-on-the-image" doExample={<Tile title="Orbit shot" />} dontExample={<Tile title="Orbit shot" below />} />
      <DoDontPair
        usage={usage}
        id="mark-selection-twice"
        doExample={<Tile title="Orbit shot" selected />}
        dontExample={<Tile title="Orbit shot" selected check={false} />}
      />
    </div>
  ),
}
