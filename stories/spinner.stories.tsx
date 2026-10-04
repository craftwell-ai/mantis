import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { usage } from '../usage/spinner.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Spinner',
  component: Spinner,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const InButton: Story = {
  name: 'In a busy button',
  render: () => (
    <Button variant="brand" depth="glossy" size="xl" disabled className="min-w-40">
      <Spinner label="Upscaling" />
      Upscaling
    </Button>
  ),
}

export const Queued: Story = {
  render: () => (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner label="In queue" />
      In queue
    </span>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="spinner-with-words"
        doExample={<span className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Spinner label="Rendering" />Rendering · about 40s</span>}
        dontExample={<Spinner />}
      />
    </div>
  ),
}
