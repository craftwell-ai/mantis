import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HelloCard } from '@/registry/hello-card'
import { usage } from '../usage/hello-card.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Blocks / Hello Card',
  component: HelloCard,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof HelloCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Dark: Story = {
  globals: { theme: 'dark' },
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="max-w-3xl">
      <DoDontPair
        usage={usage}
        id="install-check-only"
        doExample={<HelloCard />}
        dontExample={
          <div className="grid gap-3">
            <Card className="gap-2 py-4">
              <CardHeader className="px-4">
                <CardTitle>Credits left</CardTitle>
                <CardDescription>This month, all projects</CardDescription>
              </CardHeader>
              <CardContent className="px-4 text-2xl font-semibold tabular-nums">1,240</CardContent>
            </Card>
            <HelloCard />
          </div>
        }
      />
    </div>
  ),
}
