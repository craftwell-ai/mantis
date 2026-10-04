import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { FeedPost } from '@/registry/feed-post'
import { usage } from '../usage/feed-post.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Blocks / Feed Post',
  component: FeedPost,
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    className: 'max-w-xl',
    author: { name: 'Mira Okafor', avatarSrc: 'https://picsum.photos/seed/mira/96/96' },
    postedAt: '2d ago',
    postedAtDateTime: '2026-09-30T18:20:00Z',
    title: 'Night market, three ways',
    text: 'Same prompt, three seeds. The second one finally got the lantern glow right.',
    media: [{ src: 'https://picsum.photos/seed/lantern/1280/720', alt: 'Paper lanterns glowing over a crowded night market' }],
    mediaLabel: 'Drift Video 1.5',
    likes: 88,
    dislikes: 2,
    comments: 39,
    views: 33000,
    defaultFollowing: false,
    onReactionChange: fn(),
    onFollowChange: fn(),
    onComment: fn(),
    onShare: fn(),
    onCopyLink: fn(),
    onReport: fn(),
  },
} satisfies Meta<typeof FeedPost>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TextOnly: Story = {
  args: { title: undefined, text: 'Anyone else using the new depth control for product shots? It saves me a whole retouching pass.', media: undefined, mediaLabel: undefined, defaultFollowing: true },
}

export const TwoImages: Story = {
  args: {
    title: 'Spice jar series',
    text: 'Studio light versus market light.',
    media: [
      { src: 'https://picsum.photos/seed/jar/800/800', alt: 'A jar of chili flakes on a dark slate' },
      { src: 'https://picsum.photos/seed/market/800/800', alt: 'The same jar on a sunny market stall' },
    ],
    mediaLabel: undefined,
  },
}

export const OwnPost: Story = {
  args: { defaultFollowing: undefined, author: { name: 'You' }, postedAt: 'just now' },
}

export const Reactions: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const like = canvas.getByRole('button', { name: 'Like, 88' })
    await userEvent.click(like)
    await expect(canvas.getByRole('button', { name: 'Like, 89' })).toHaveAttribute('aria-pressed', 'true')
    await expect(args.onReactionChange).toHaveBeenLastCalledWith('like')

    // Disliking replaces the like.
    await userEvent.click(canvas.getByRole('button', { name: 'Dislike, 2' }))
    await expect(canvas.getByRole('button', { name: 'Like, 88' })).toHaveAttribute('aria-pressed', 'false')
    await expect(args.onReactionChange).toHaveBeenLastCalledWith('dislike')

    await userEvent.click(canvas.getByRole('button', { name: 'Follow Mira Okafor' }))
    await expect(canvas.getByRole('button', { name: 'Following Mira Okafor' })).toBeVisible()
  },
}

export const MoreMenu: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'More actions for the post by Mira Okafor' }))
    const menu = await page.findByRole('menu')
    await waitFor(() => expect(getComputedStyle(menu).opacity).toBe('1'))
    await expect(page.getByRole('menuitem', { name: 'Report post' })).toBeVisible()
  },
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="counts-are-actions"
        doExample={<FeedPost author={{ name: 'Ana Ruiz' }} postedAt="1h ago" text="First try with the orbit move." likes={12} comments={3} onComment={() => {}} onShare={() => {}} />}
        dontExample={
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-4">
            <p className="text-sm">First try with the orbit move.</p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary"><Icon name="thumb_up" />Like</Button>
              <Button variant="secondary"><Icon name="chat_bubble" />Comment</Button>
              <Button variant="secondary"><Icon name="share" />Share</Button>
            </div>
          </div>
        }
      />
      <DoDontPair
        usage={usage}
        id="follow-is-quiet"
        doExample={<FeedPost author={{ name: 'Kenji Mori' }} postedAt="3h ago" text="Ice cave test." likes={40} comments={6} defaultFollowing={false} />}
        dontExample={
          <div className="flex items-center gap-2.5 rounded-2xl bg-card p-4">
            <span className="flex-1 text-sm font-medium">Kenji Mori</span>
            <Button variant="brand">Follow</Button>
          </div>
        }
      />
    </div>
  ),
}
