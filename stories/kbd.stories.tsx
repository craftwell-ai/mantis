import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Icon } from '@/components/ui/icon'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { usage } from '../usage/kbd.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Kbd',
  component: Kbd,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

function SearchPill() {
  return (
    <button type="button" className="flex h-9 w-48 items-center gap-2 rounded-control bg-glass px-3 text-sm text-muted-foreground">
      <Icon name="search" />
      Search
      <KbdGroup className="ml-auto"><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>
    </button>
  )
}

export const InSearchPill: Story = { name: 'In the search pill', render: () => <SearchPill /> }

export const Single: Story = { render: () => <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">Press <Kbd>Esc</Kbd> to close</span> }

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair usage={usage} id="one-key-per-kbd" doExample={<KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>} dontExample={<Kbd>Press command and K to search</Kbd>} />
    </div>
  ),
}
