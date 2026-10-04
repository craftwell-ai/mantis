import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { usage } from '../usage/sheet.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Sheet',
  component: Sheet,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

const details = [
  ['Model', 'Studio v3'],
  ['Aspect ratio', '16:9'],
  ['Duration', '6s'],
  ['Credits', '18'],
]

function Inspector({ open }: { open?: boolean }) {
  return (
    <Sheet open={open}>
      <SheetTrigger render={<Button variant="glass" />}>Details</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Glass Harbor</SheetTitle>
          <SheetDescription>Rendered today at 14:02</SheetDescription>
        </SheetHeader>
        <dl className="flex flex-col gap-3 px-4 text-sm">
          {details.map(([k, v]) => (
            <div key={k} className="flex justify-between"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </SheetContent>
    </Sheet>
  )
}

export const Open: Story = { render: () => <Inspector open /> }

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="title-what-it-shows"
        doExample={<div className="w-64 rounded-2xl border border-separator bg-dialog p-4"><p className="text-title-sm">Glass Harbor</p><p className="text-sm text-muted-foreground">Rendered today at 14:02</p></div>}
        dontExample={<div className="w-64 rounded-2xl border border-separator bg-dialog p-4"><p className="text-sm text-muted-foreground">Model · Studio v3</p><p className="text-sm text-muted-foreground">Duration · 6s</p></div>}
      />
    </div>
  ),
}
