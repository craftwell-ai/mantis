import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Textarea } from '@/components/ui/textarea'
import { usage } from '../usage/textarea.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Textarea',
  component: Textarea,
  args: { 'aria-label': 'Bio', placeholder: 'Tell people what you make' },
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Field: Story = { render: (args) => <div className="w-80"><Textarea {...args} /></div> }

export const Prompt: Story = {
  render: () => (
    <div className="w-140 rounded-2xl border border-separator bg-soft p-4">
      <Textarea variant="prompt" aria-label="Prompt" placeholder="Describe the scene you imagine" />
    </div>
  ),
}

export const PromptLarge: Story = {
  name: 'Prompt (large)',
  render: () => (
    <div className="w-160 rounded-2xl border border-separator bg-soft p-3">
      <Textarea variant="prompt-lg" aria-label="Prompt" defaultValue="A lantern-lit night market in light rain, slow dolly forward, warm reflections on wet stone." />
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="prompt-inside-composer"
        doExample={<div className="w-80 rounded-2xl border border-separator bg-soft p-4"><Textarea variant="prompt" aria-label="Prompt" placeholder="Describe the scene you imagine" /></div>}
        dontExample={<div className="w-80"><Textarea variant="prompt" aria-label="Prompt" placeholder="Describe the scene you imagine" /></div>}
      />
    </div>
  ),
}
