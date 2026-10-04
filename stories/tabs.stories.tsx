import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usage } from '../usage/tabs.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

function ProjectTabs() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="rounded-lg border p-4 text-sm">
        18 generations across 3 presets, 4 still in the render queue. Publishing is planned for Friday.
      </TabsContent>
      <TabsContent value="activity" className="rounded-lg border p-4 text-sm">
        Priya added two character references an hour ago. Leo upscaled the opening shot yesterday.
      </TabsContent>
      <TabsContent value="settings" className="rounded-lg border p-4 text-sm">
        Only project owners can change the default model or delete this project.
      </TabsContent>
    </Tabs>
  )
}

const meta = {
  title: 'Components / Tabs',
  component: Tabs,
  render: () => <ProjectTabs />,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Tabs>

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
        id="tabs-are-peers"
        doExample={<ProjectTabs />}
        dontExample={
          <Tabs defaultValue="prompt" className="w-full">
            <TabsList>
              <TabsTrigger value="prompt">1. Prompt</TabsTrigger>
              <TabsTrigger value="model">2. Model</TabsTrigger>
              <TabsTrigger value="review">3. Review</TabsTrigger>
            </TabsList>
            <TabsContent value="prompt" className="rounded-lg border p-4 text-sm">
              Step 1 of 3: describe the shot you want to make.
            </TabsContent>
            <TabsContent value="model" className="rounded-lg border p-4 text-sm">
              Step 2 of 3: pick a model and an aspect ratio.
            </TabsContent>
            <TabsContent value="review" className="rounded-lg border p-4 text-sm">
              Step 3 of 3: check the credit cost, then generate.
            </TabsContent>
          </Tabs>
        }
      />
    </div>
  ),
}

// The three measured looks.
function VariantTabs({ variant, labels }: { variant: 'default' | 'line' | 'pill'; labels: string[] }) {
  return (
    <Tabs defaultValue={labels[0]}>
      <TabsList variant={variant}>
        {labels.map((label) => <TabsTrigger key={label} value={label}>{label}</TabsTrigger>)}
      </TabsList>
    </Tabs>
  )
}

export const GlassBar: StoryObj = { name: 'Glass bar (default)', render: () => <VariantTabs variant="default" labels={['History', 'How it works', 'Community']} /> }

export const Underline: StoryObj = { render: () => <VariantTabs variant="line" labels={['Create video', 'Edit video', 'Motion control']} /> }

export const Pill: StoryObj = { render: () => <VariantTabs variant="pill" labels={['Individuals', 'Teams']} /> }
