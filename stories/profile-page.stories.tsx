import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { ProfilePage } from '@/registry/profile-page'
import { usage } from '../usage/profile-page.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'

const meta = {
  title: 'Templates / Profile Page',
  component: ProfilePage,
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    onFollowChange: fn(),
    onEditProfile: fn(),
    onShareProfile: fn(),
    onNewPost: fn(),
    onRecreate: fn(),
    recreateCost: 4,
  },
} satisfies Meta<typeof ProfilePage>

export default meta
type Story = StoryObj<typeof meta>

export const Visitor: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { level: 1, name: 'Mira Okafor' })).toBeVisible()
    const follow = canvas.getByRole('button', { name: 'Follow' })
    await userEvent.click(follow)
    await expect(canvas.getByRole('button', { name: 'Following' })).toHaveAttribute('aria-pressed', 'true')
    await expect(args.onFollowChange).toHaveBeenCalledWith(true)
  },
}

export const OwnProfile: Story = {
  name: 'Own profile',
  args: { isOwnProfile: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Edit profile' })).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument()
  },
}

export const PostsTab: Story = {
  name: 'Posts tab',
  args: { defaultTab: 'posts' },
}

// A new account: every tab is empty and invites the owner to start.
export const OwnProfileEmpty: Story = {
  name: 'Own profile, empty',
  args: {
    isOwnProfile: true,
    generations: [],
    liked: [],
    posts: [],
    profile: {
      name: 'Sam Rivera',
      handle: 'samrivera',
      stats: [
        { label: 'Generations', value: '0' },
        { label: 'Followers', value: '0' },
        { label: 'Following', value: '12' },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { name: 'You have not shared anything yet' })).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Start creating' })).toBeVisible()
    await userEvent.click(canvas.getByRole('tab', { name: /Liked/ }))
    await expect(canvas.getByRole('link', { name: 'Browse Explore' })).toBeVisible()
    await userEvent.click(canvas.getByRole('tab', { name: /Posts/ }))
    await expect(canvas.getByRole('button', { name: 'New post' })).toBeVisible()
  },
}

// A visitor sees the same empty tabs as plain sentences, with nothing to press.
export const VisitorEmpty: Story = {
  name: 'Visitor, empty',
  args: { generations: [], liked: [], posts: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { name: 'Mira has not shared anything yet' })).toBeVisible()
    await expect(canvas.queryByRole('link', { name: 'Start creating' })).not.toBeInTheDocument()
  },
}

// Bare, like a component dropped in from a library: every prop falls back to the sample content.
export const NoProps: Story = {
  name: 'No props',
  render: () => <ProfilePage />,
}
