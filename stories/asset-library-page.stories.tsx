import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Checkbox } from '@/components/ui/checkbox'
import { AssetLibraryPage } from '@/registry/asset-library-page'
import { SAMPLE_ASSETS, picsum, sampleNavigation } from '@/registry/sample-content'
import { usage } from '../usage/asset-library-page.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Templates / Asset Library Page',
  component: AssetLibraryPage,
  // The global preview wrapper pads every story by 24px; full-page stories cancel it to show edge to edge.
  decorators: [(Story, context) => (context.parameters.layout === 'fullscreen' ? <div className="-m-6"><Story /></div> : <Story />)],
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    navigation: sampleNavigation('/assets'),
    assets: SAMPLE_ASSETS,
    onUpload: fn(),
    onOpen: fn(),
    onDownload: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof AssetLibraryPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// Bare, like a component dropped in from a library: every prop falls back to the sample content.
export const NoProps: Story = {
  name: 'No props',
  render: () => <AssetLibraryPage />,
}

export const Empty: Story = {
  name: 'Empty library',
  args: { assets: [] },
}

export const Loading: Story = {
  args: { assets: [], loading: true },
}

// Selecting two tiles brings up the selection bar; Download gets both.
export const Selecting: Story = {
  name: 'Selecting assets',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Harbor at dusk' }))
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Glazed bowls' }))
    const bar = canvas.getByRole('region', { name: 'Selection' })
    await expect(within(bar).getByText('2 selected')).toBeInTheDocument()
    await userEvent.click(within(bar).getByRole('button', { name: 'Download' }))
    await expect(args.onDownload).toHaveBeenCalledWith([SAMPLE_ASSETS[0], SAMPLE_ASSETS[3]])
  },
}

// Filtering by tab and searching by name; a miss shows a way back.
export const FilterAndSearch: Story = {
  name: 'Filtering and searching',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('tab', { name: 'Videos' }))
    const videos = canvas.getByRole('list', { name: 'Videos assets' })
    await expect(within(videos).getAllByRole('listitem')).toHaveLength(3)
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Search assets by name' }), 'zebra')
    await expect(canvas.getByRole('heading', { name: /Nothing named/ })).toBeInTheDocument()
    // The field's own x has the same name; use the one the no-match state offers.
    await userEvent.click(within(canvas.getByRole('tabpanel')).getByRole('button', { name: 'Clear search' }))
    await waitFor(() => expect(canvas.getByRole('list', { name: 'Videos assets' })).toBeInTheDocument())
  },
}

function TileSketch({ marked }: { marked: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {['a', 'b', 'c'].map((seed, index) => (
        <div key={seed} className={`relative aspect-square overflow-hidden rounded-lg ${marked && index === 1 ? 'ring-2 ring-ring' : ''}`}>
          <img src={picsum(`tile-${seed}`, 160, 160)} alt="" className={`size-full object-cover ${!marked && index === 1 ? 'opacity-50' : ''}`} />
          {index === 1 ? (
            <span className="absolute top-1.5 left-1.5 flex rounded-md bg-overlay">
              <Checkbox size="sm" checked aria-label={marked ? 'Selected example' : 'Selected example, dimmed'} />
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair usage={usage} id="selection-is-lime-and-checked" doExample={<TileSketch marked />} dontExample={<TileSketch marked={false} />} />
    </div>
  ),
}
