import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test'

import { ExplorePage } from '@/registry/explore-page'
import { usage } from '../usage/explore-page.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'

const meta = {
  title: 'Templates / Explore Page',
  component: ExplorePage,
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    hasMore: true,
    onLoadMore: fn(),
    onLike: fn(),
    onRecreate: fn(),
    recreateCost: 4,
    onDownload: fn(),
    onShare: fn(),
  },
} satisfies Meta<typeof ExplorePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// Bare, like a component dropped in from a library: every prop falls back to the sample content.
export const NoProps: Story = {
  name: 'No props',
  render: () => <ExplorePage />,
}

export const Loading: Story = {
  args: { items: [], loading: true, hasMore: false },
}

export const EmptyCategory: Story = {
  name: 'Empty category',
  args: { items: [], hasMore: false, defaultCategory: 'product' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { level: 2, name: 'No product shared yet' })).toBeVisible()
  },
}

// Filtering narrows the grid, and the viewer steps only through what is shown.
export const FilterAndOpen: Story = {
  name: 'Filter, then open the viewer',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('tab', { name: 'Landscapes' }))
    const grid = canvas.getByRole('region', { name: 'Landscapes from the community' })
    await expect(within(grid).getAllByRole('listitem')).toHaveLength(2)
    await userEvent.click(within(grid).getByRole('button', { name: /^Open Wind-carved sand dunes/ }))
    const dialog = await screen.findByRole('dialog')
    // The viewer fades in; wait for it rather than catching it mid-animation.
    await waitFor(() => expect(within(dialog).getByText('1 of 2')).toBeVisible())
    await userEvent.click(within(dialog).getByRole('button', { name: /Recreate/ }))
    await expect(args.onRecreate).toHaveBeenCalledWith(expect.objectContaining({ id: 'dunes' }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  },
}

export const LikeUpdatesCount: Story = {
  name: 'Like updates the count',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const like = canvas.getByRole('button', { name: /Like Wind-carved sand dunes at sunrise/ })
    await expect(like).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(like)
    await waitFor(() => expect(canvas.getByRole('button', { name: /Like Wind-carved sand dunes at sunrise/ })).toHaveAttribute('aria-pressed', 'true'))
    await expect(args.onLike).toHaveBeenCalledWith(expect.objectContaining({ id: 'dunes' }), true)
  },
}
