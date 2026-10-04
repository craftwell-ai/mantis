import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { usage } from '../usage/accordion.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Accordion',
  component: Accordion,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

const sections = [
  { value: 'look', title: 'Look', body: 'Face shape, skin tone and hair, picked from presets or described in words.' },
  { value: 'wardrobe', title: 'Wardrobe', body: 'Outfit, accessories and colors, kept the same across every scene.' },
  { value: 'lighting', title: 'Lighting', body: 'Soft studio light, golden hour or neon night.' },
]

function Builder({ titles = sections }: { titles?: typeof sections }) {
  return (
    <Accordion defaultValue={['look']} className="w-80">
      {titles.map((s) => (
        <AccordionItem key={s.value} value={s.value}>
          <AccordionTrigger>{s.title}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{s.body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export const Default: Story = { render: () => <Builder /> }

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="scannable-triggers"
        doExample={<Builder />}
        dontExample={<Builder titles={sections.map((s, i) => ({ ...s, title: `Section ${i + 1}: more options for your character` }))} />}
      />
    </div>
  ),
}
