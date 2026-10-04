import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Stepper } from '@/components/ui/stepper'
import { Textarea } from '@/components/ui/textarea'
import { PromptComposer, type PromptComposerModel } from '@/registry/prompt-composer'
import { usage } from '../usage/prompt-composer.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

// Example models for the stories only; a product passes its own list.
const MODELS: PromptComposerModel[] = [
  { value: 'draft', label: 'Draft', creditsPerImage: 1 },
  { value: 'standard', label: 'Standard', creditsPerImage: 2 },
  { value: 'detail', label: 'Detail', creditsPerImage: 4 },
]

const meta = {
  title: 'Blocks / Prompt Composer',
  component: PromptComposer,
  args: { models: MODELS, defaultModel: 'standard', onGenerate: fn() },
  decorators: [(Story) => <div className="w-full max-w-180"><Story /></div>],
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof PromptComposer>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Nothing to generate yet, so the lime button waits for a prompt.
    await expect(canvas.getByRole('button', { name: /Generate/ })).toBeDisabled()
  },
}

export const Filled: Story = {
  args: {
    defaultPrompt: 'A lighthouse keeper\'s kitchen at dawn, copper pots, fog pressing on the window, soft film grain',
    defaultAspectRatio: '3:2',
    defaultCount: 2,
  },
}

export const CostFollowsSettings: Story = {
  name: 'Cost follows the settings',
  args: { defaultPrompt: 'A paper boat on a rain-filled gutter, low angle, neon reflections' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    // Standard is 2 credits per image; one image to start.
    await expect(canvas.getByRole('button', { name: 'Generate 2 credits' })).toBeEnabled()
    await userEvent.click(canvas.getByRole('button', { name: 'Increase number of images' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Increase number of images' }))
    await expect(canvas.getByRole('button', { name: 'Generate 6 credits' })).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('combobox', { name: 'Model' }))
    await userEvent.click(await page.findByRole('option', { name: /Detail/ }))
    await waitFor(() => expect(canvas.getByRole('combobox', { name: 'Model' })).toHaveTextContent('Detail'))
    // axe runs as soon as play ends; let the menu finish closing so it checks the settled page.
    await waitFor(() => expect(page.queryByRole('listbox')).toBeNull())
    const generate = canvas.getByRole('button', { name: 'Generate 12 credits' })
    await userEvent.click(generate)
    await expect(args.onGenerate).toHaveBeenCalledWith({
      prompt: 'A paper boat on a rain-filled gutter, low angle, neon reflections',
      model: 'detail',
      aspectRatio: '1:1',
      count: 3,
      credits: 12,
    })
  },
}

export const ModelMenuOpen: Story = {
  name: 'Model menu open',
  decorators: [(Story) => <div className="pb-48"><Story /></div>],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('combobox', { name: 'Model' }))
    const list = await page.findByRole('listbox')
    // axe runs as soon as play ends; wait for the fade so it measures real colors.
    await waitFor(() => expect(getComputedStyle(list.closest('[data-slot="select-content"]') ?? list).opacity).toBe('1'))
    await expect(page.getByRole('option', { name: /Draft/ })).toBeVisible()
  },
}

export const Generating: Story = {
  args: { defaultPrompt: 'Macro shot of frost forming on a maple leaf, blue hour', generating: true },
}

export const NotEnoughCredits: Story = {
  name: 'Not enough credits',
  args: {
    defaultPrompt: 'An overgrown greenhouse on a rooftop, late golden light, wide shot',
    defaultModel: 'detail',
    defaultCount: 4,
    creditBalance: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const generate = canvas.getByRole('button', { name: 'Generate 16 credits' })
    await expect(generate).toBeDisabled()
    await expect(generate).toHaveAccessibleDescription(/you have 10/)
  },
}

export const LongPrompt: Story = {
  name: 'Long prompt',
  args: {
    defaultPrompt:
      'A crowded night ferry crossing a wide river, lanterns strung along the railings, passengers in wool coats leaning over the side, the city skyline blurred behind a light drizzle, reflections stretching across the black water, shot on a 35mm lens with shallow depth of field, warm tungsten against cool blue shadows, the deck wet and glossy, a child pointing at a passing barge loaded with crates of oranges.',
  },
}

function CostChip({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 font-medium tabular-nums">
      <Icon name="star_shine-fill" className="size-3.5" />
      {value}
      <span className="sr-only">credits</span>
    </span>
  )
}

// A cut-down composer frame for the Do/Don't pairs, so each side shows only the difference.
function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-separator bg-card p-4">
      <Textarea variant="prompt" aria-label="Prompt" defaultValue="A quiet harbor at first light" />
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="cost-on-generate"
        doExample={
          <Frame>
            <Stepper label="number of images" defaultValue={2} />
            <Button variant="brand" depth="glossy" size="lg" className="ml-auto">
              Generate <CostChip value={4} />
            </Button>
          </Frame>
        }
        dontExample={
          <Frame>
            <Stepper label="number of images" defaultValue={2} />
            <Button variant="brand" depth="glossy" size="lg" className="ml-auto">
              Generate
            </Button>
          </Frame>
        }
      />
      <DoDontPair
        usage={usage}
        id="only-generate-is-lime"
        doExample={
          <Frame>
            <Stepper label="number of images" defaultValue={1} />
            <Button variant="brand" depth="glossy" size="lg" className="ml-auto">
              Generate <CostChip value={2} />
            </Button>
          </Frame>
        }
        dontExample={
          <Frame>
            <Button variant="brand" size="lg">
              <Icon name="image" /> 1:1
            </Button>
            <Button variant="brand" depth="glossy" size="lg" className="ml-auto">
              Generate <CostChip value={2} />
            </Button>
          </Frame>
        }
      />
    </div>
  ),
}
