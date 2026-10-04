import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { usage } from '../usage/avatar.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Avatar',
  component: Avatar,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {(['xs', 'sm', 'default', 'lg'] as const).map((size) => (
        <Avatar key={size} size={size}><AvatarFallback>PS</AvatarFallback></Avatar>
      ))}
    </div>
  ),
}

export const WithPhoto: Story = {
  render: () => (
    <span className="flex items-center gap-2 text-sm">
      <Avatar><AvatarImage src="https://picsum.photos/seed/avatar/64/64" alt="" /><AvatarFallback>PS</AvatarFallback></Avatar>
      Priya Sen
    </span>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="always-a-fallback"
        doExample={<Avatar><AvatarFallback>PS</AvatarFallback></Avatar>}
        dontExample={<span className="block size-8 rounded-full bg-secondary" aria-label="Priya Sen" role="img" />}
      />
    </div>
  ),
}
