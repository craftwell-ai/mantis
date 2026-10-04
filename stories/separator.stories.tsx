import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Separator } from '@/components/ui/separator'
import { usage } from '../usage/separator.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Separator',
  component: Separator,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

const rows = ['Profile', 'Credits', 'Language']

export const InCard: Story = {
  name: 'In a card',
  render: () => (
    <div className="flex w-56 flex-col gap-1 rounded-xl bg-card p-2 text-sm">
      {rows.map((r) => <span key={r} className="px-2 py-1.5">{r}</span>)}
      <Separator className="my-1" />
      <span className="px-2 py-1.5">Sign out</span>
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="space-before-lines"
        doExample={<div className="flex w-48 flex-col gap-1 text-sm">{rows.map((r) => <span key={r} className="py-1">{r}</span>)}<Separator className="my-1" /><span className="py-1">Sign out</span></div>}
        dontExample={<div className="flex w-48 flex-col text-sm">{[...rows, 'Sign out'].map((r) => <div key={r}><span className="block py-1">{r}</span><Separator /></div>)}</div>}
      />
    </div>
  ),
}
