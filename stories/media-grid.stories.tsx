import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { MediaGrid, type MediaGridItem } from '@/registry/media-grid'
import { usage } from '../usage/media-grid.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const SHAPES: [string, string, number, number][] = [
  ['lantern', 'Paper lanterns over a night market', 600, 800],
  ['dune', 'Wind-carved sand dunes at sunrise', 800, 600],
  ['studio', 'Portrait of a potter in her studio', 600, 900],
  ['glacier', 'Blue ice cave inside a glacier', 800, 800],
  ['bloom', 'Close-up of a dahlia after rain', 600, 750],
  ['skate', 'Skater mid-air above an empty pool', 900, 600],
  ['library', 'Spiral staircase in an old library', 600, 900],
  ['koi', 'Koi circling in a dark pond', 800, 800],
  ['neon', 'Neon sign reflected in a puddle', 600, 800],
  ['ridge', 'Hikers on a ridge above the clouds', 800, 500],
]

const AUTHORS = ['Mira Okafor', 'Tomas Lindqvist', 'Ana Ruiz', 'Kenji Mori', 'Priya Nair']

function makeItems(offset = 0): MediaGridItem[] {
  return SHAPES.map(([seed, alt, width, height], index) => ({
    id: `${seed}-${offset}`,
    src: `https://picsum.photos/seed/${seed}${offset || ''}/${width}/${height}`,
    alt,
    width,
    height,
    author: { name: AUTHORS[(index + offset) % AUTHORS.length] },
    likes: 120 + index * 317,
    liked: index === 2,
  }))
}

const meta = {
  title: 'Blocks / Media Grid',
  component: MediaGrid,
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    label: 'Community creations',
    items: makeItems(),
    hasMore: true,
    onLoadMore: fn(),
    onOpen: fn(),
    onLike: fn(),
    onRecreate: fn(),
  },
} satisfies Meta<typeof MediaGrid>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = {
  args: { items: [], loading: true, hasMore: false },
}

export const LoadingMore: Story = {
  args: { loadingMore: true },
}

export const EndOfList: Story = {
  args: { hasMore: false },
}

export const Empty: Story = {
  args: { items: [], hasMore: false },
}

export const HoverRevealsAuthor: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const open = canvas.getByRole('button', { name: 'Open Blue ice cave inside a glacier, by Kenji Mori' })
    await userEvent.hover(open)
    const like = canvas.getByRole('button', { name: /Like Blue ice cave inside a glacier/ })
    await expect(like).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(like)
    await expect(args.onLike).toHaveBeenCalledWith(expect.objectContaining({ id: 'glacier-0' }))
  },
}

function PagedGrid() {
  const [pages, setPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const items = Array.from({ length: pages }, (_, page) => makeItems(page)).flat()
  return (
    <MediaGrid
      label="Community creations"
      items={items}
      hasMore={pages < 2}
      loadingMore={loadingMore}
      onLoadMore={() => {
        setLoadingMore(true)
        setTimeout(() => {
          setPages((count) => count + 1)
          setLoadingMore(false)
        }, 300)
      }}
      onOpen={() => {}}
    />
  )
}

export const LoadMore: Story = {
  render: () => <PagedGrid />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('listitem')).toHaveLength(10)
    await userEvent.click(canvas.getByRole('button', { name: 'Load more' }))
    await waitFor(() => expect(canvas.getAllByRole('listitem')).toHaveLength(20))
    await expect(canvas.getByText('You have reached the end.')).toBeVisible()
  },
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="keep-natural-shapes"
        doExample={<MediaGrid label="Natural shapes" items={makeItems().slice(0, 6)} className="[&_ul]:columns-3!" />}
        dontExample={
          <ul className="grid grid-cols-3 gap-1">
            {makeItems().slice(0, 6).map((item) => (
              <li key={item.id}>
                <img src={item.src} alt={item.alt} className="aspect-square w-full object-cover" />
              </li>
            ))}
          </ul>
        }
      />
      <DoDontPair
        usage={usage}
        id="reveal-on-hover"
        doExample={<MediaGrid label="Hover to reveal" items={makeItems().slice(0, 3)} className="[&_ul]:columns-3!" onLike={() => {}} />}
        dontExample={
          <ul className="grid grid-cols-3 gap-1">
            {makeItems().slice(0, 3).map((item) => (
              <li key={item.id} className="flex flex-col gap-1">
                <img src={item.src} alt={item.alt} className="aspect-square w-full object-cover" />
                <p className="text-xs">{item.author.name}</p>
                <p className="text-xs text-muted-foreground">{item.likes} likes</p>
              </li>
            ))}
          </ul>
        }
      />
    </div>
  ),
}
