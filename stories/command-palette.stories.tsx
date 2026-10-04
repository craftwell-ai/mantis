import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { IconTile } from '@/components/ui/icon-tile'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import {
  CommandPalette,
  type CommandPaletteCategory,
  type CommandPaletteFeatured,
  type CommandPaletteItem,
} from '@/registry/command-palette'
import { usage } from '../usage/command-palette.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const categories: CommandPaletteCategory[] = [
  { value: 'tools', label: 'Tools', icon: 'wand_stars' },
  { value: 'models', label: 'Models', icon: 'star_shine-fill' },
  { value: 'presets', label: 'Presets', icon: 'palette' },
  { value: 'projects', label: 'Projects', icon: 'photo_library' },
]

const items: CommandPaletteItem[] = [
  { id: 'upscale', title: 'Upscale', description: 'Sharpen an image up to 4× without losing detail', icon: 'wand_stars', category: 'tools' },
  { id: 'extend-clip', title: 'Extend clip', description: 'Add up to ten seconds to the end of a video', icon: 'movie', category: 'tools' },
  { id: 'relight', title: 'Relight', description: 'Move the light source after the shot is taken', icon: 'brush', category: 'tools' },
  { id: 'voiceover', title: 'Voiceover', description: 'Turn a script into narration in a voice you pick', icon: 'mic', category: 'tools', badge: { label: 'New', variant: 'new' } },
  { id: 'storyboard', title: 'Storyboard', description: 'Plan a sequence shot by shot before you render', icon: 'photo_library', category: 'tools' },
  { id: 'lumen', title: 'Lumen 2', description: 'Fast, photoreal stills for product shots', icon: 'image', category: 'models' },
  { id: 'drift', title: 'Drift Video', description: 'Smooth camera moves for 5 to 10 second clips', icon: 'videocam', category: 'models', badge: { label: 'Hot', variant: 'hot' } },
  { id: 'sketchbook', title: 'Sketchbook', description: 'Loose, hand-drawn illustration styles', icon: 'brush', category: 'models' },
  { id: 'golden-hour', title: 'Golden hour', description: 'Warm, low sun with long soft shadows', icon: 'palette', category: 'presets' },
  { id: 'noir', title: 'Film noir', description: 'Hard light and deep black-and-white contrast', icon: 'movie', category: 'presets' },
  { id: 'desert-bloom', title: 'Desert Bloom', description: 'Campaign project · edited 2 hours ago', icon: 'photo_library', category: 'projects' },
]

const byId = (id: string) => items.find((item) => item.id === id)!

const featured: CommandPaletteFeatured[] = [
  { id: 'storyboard-studio', title: 'Storyboard studio', description: 'Plan every shot before you render', tag: 'Tool', image: 'https://picsum.photos/seed/storyboard/480/240', alt: 'Placeholder photo for the storyboard studio card' },
  { id: 'drift-video', title: 'Drift video', description: 'Cinematic camera moves from one still', tag: 'Model', image: 'https://picsum.photos/seed/drift/480/240', alt: 'Placeholder photo for the Drift video model card', badge: { label: 'Hot', variant: 'hot' } },
  { id: 'voice-lab', title: 'Voice lab', description: 'Narrate a clip from a written script', tag: 'Tool', image: 'https://picsum.photos/seed/voicelab/480/240', alt: 'Placeholder photo for the voice lab card', badge: { label: 'New', variant: 'new' } },
]

const searchTrigger = (
  <Button variant="glass" className="w-56 justify-start text-muted-foreground">
    <Icon name="search" />
    Search
    <KbdGroup className="ml-auto">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  </Button>
)

const meta = {
  title: 'Blocks / Command Palette',
  component: CommandPalette,
  args: {
    categories,
    items,
    recents: [byId('upscale'), byId('desert-bloom')],
    featured,
    trending: ['voiceover', 'drift', 'relight', 'golden-hour', 'extend-clip', 'lumen'].map(byId),
    trigger: searchTrigger,
    onSelect: fn(),
  },
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof CommandPalette>

export default meta
type Story = StoryObj<typeof meta>

async function openPalette(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const page = within(canvasElement.ownerDocument.body)
  await userEvent.click(canvas.getByRole('button', { name: /Search/ }))
  const dialog = await page.findByRole('dialog', { name: 'Search' })
  // axe runs as soon as play ends; wait for the fade-in so it measures real colors.
  await waitFor(() => expect(getComputedStyle(dialog).opacity).toBe('1'))
  return { page, dialog }
}

export const Closed: Story = {}

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const { page } = await openPalette(canvasElement)
    await expect(page.getByRole('group', { name: 'Featured' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: 'Search' })).toHaveFocus()
  },
}

export const KeyboardSelect: Story = {
  name: 'Keyboard navigation',
  play: async ({ canvasElement, args }) => {
    const { page } = await openPalette(canvasElement)
    const field = page.getByRole('combobox', { name: 'Search' })
    // First row starts highlighted; two steps down lands on the first featured card.
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await expect(page.getByRole('option', { selected: true })).toHaveTextContent('Storyboard studio')
    await expect(field).toHaveAttribute('aria-activedescendant')
    await userEvent.keyboard('{Enter}')
    await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'storyboard-studio' }))
  },
}

export const Searching: Story = {
  name: 'Search results',
  play: async ({ canvasElement }) => {
    const { page } = await openPalette(canvasElement)
    await userEvent.type(page.getByRole('combobox', { name: 'Search' }), 'clip')
    await expect(page.getByRole('group', { name: 'Tools' })).toBeVisible()
    await expect(page.getByRole('option', { name: /Extend clip/ })).toBeVisible()
  },
}

export const FilteredByChip: Story = {
  name: 'Filtered by a chip',
  play: async ({ canvasElement }) => {
    const { page } = await openPalette(canvasElement)
    await userEvent.click(page.getByRole('button', { name: 'Models' }))
    await expect(page.getByRole('group', { name: 'Models' })).toBeVisible()
    await expect(page.queryByRole('group', { name: 'Featured' })).toBeNull()
  },
}

export const NoResults: Story = {
  name: 'No results',
  play: async ({ canvasElement }) => {
    const { page } = await openPalette(canvasElement)
    await userEvent.type(page.getByRole('combobox', { name: 'Search' }), 'hologram')
    await expect(page.getByText(/Nothing matches/)).toBeVisible()
  },
}

function BrowsePanel({ withSuggestions }: { withSuggestions: boolean }) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl border border-glass-border bg-glass-panel p-3">
      <InputGroup className="rounded-xl">
        <InputGroupAddon>
          <Icon name="search" />
        </InputGroupAddon>
        <InputGroupInput aria-label={withSuggestions ? 'Search, with suggestions' : 'Search, empty'} placeholder="Search tools, models and presets" />
      </InputGroup>
      {withSuggestions ? (
        <div className="flex flex-col gap-0.5">
          <span className="px-2 py-1 text-xs text-muted-foreground">Recent</span>
          {[byId('upscale'), byId('voiceover')].map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
              <IconTile name={item.icon} size="lg" />
              <span className="flex flex-col">
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-24" />
      )}
    </div>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="browse-before-typing"
        doExample={<BrowsePanel withSuggestions />}
        dontExample={<BrowsePanel withSuggestions={false} />}
      />
    </div>
  ),
}
