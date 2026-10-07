import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { VideoPlayer } from '@/registry/video-player'
import { usage } from '../usage/video-player.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'

// A short public-domain (CC0) sample clip of a flower opening; a product passes its own clip.
const CLIP = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

// Sample captions written inline, so the story needs no second file.
const CAPTIONS = `data:text/vtt;charset=utf-8,${encodeURIComponent(
  'WEBVTT\n\n00:00.000 --> 00:02.500\nA flower opens in soft light.\n\n00:02.500 --> 00:05.000\nIts petals turn toward the window.',
)}`

const meta = {
  title: 'Blocks / Video Player',
  component: VideoPlayer,
  args: { src: CLIP, title: 'A flower opening in soft light' },
  decorators: [(Story) => <div className="w-full max-w-180"><Story /></div>],
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof VideoPlayer>

export default meta
type Story = StoryObj<typeof meta>

// The controls are there whether or not the clip has loaded, so these checks do not need the network.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const play = await canvas.findByRole('button', { name: 'play' })
    // The controls fade in once the player has set itself up.
    await waitFor(() => expect(play).toBeVisible())
    await expect(canvas.getByRole('group', { name: 'A flower opening in soft light' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'mute' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: /fullscreen/ })).toBeVisible()
    await expect(canvas.queryByRole('button', { name: /captions/ })).not.toBeInTheDocument()
  },
}

export const WithCaptions: Story = {
  name: 'With captions',
  args: { captionsSrc: CAPTIONS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The button is in the player as soon as a captions file is given; it shows once the file has loaded.
    await expect(await canvas.findByRole('switch', { name: /captions/ })).toBeInTheDocument()
  },
}

export const Looping: Story = {
  name: 'Looping, sound off',
  args: { loop: true, muted: true },
}

export const Portrait: Story = {
  args: { aspect: 'portrait' },
  decorators: [(Story) => <div className="w-72"><Story /></div>],
}
