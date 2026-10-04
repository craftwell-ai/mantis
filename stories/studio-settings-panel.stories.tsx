import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StudioSettingsPanel, type StudioModel, type StudioReference } from '@/registry/studio-settings-panel'
import { usage } from '../usage/studio-settings-panel.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

// Invented models for the stories only; a product passes its own list.
const MODELS: StudioModel[] = [
  { value: 'lumen-3', label: 'Lumen 3', description: 'Smooth camera moves and lifelike light, up to 10 seconds', icon: 'movie', featured: true, badge: 'new', creditsPerSecond: 3 },
  { value: 'ember-fast', label: 'Ember Fast', description: 'Quick drafts in seconds, for testing an idea', icon: 'bolt', featured: true, creditsPerSecond: 1 },
  { value: 'loop-studio', label: 'Loop Studio', description: 'Seamless short loops for backgrounds and social posts', icon: 'animation', creditsPerSecond: 2 },
]

const PRESET = {
  title: 'Slow dolly in',
  description: 'The camera glides toward the subject',
  image: 'https://picsum.photos/seed/preset/704/256',
  imageAlt: 'Placeholder frame for the selected preset',
}

const REFERENCES: StudioReference[] = [
  { id: 'ref-1', src: 'https://picsum.photos/seed/reference-face/160/160', alt: 'Reference image 1, a face' },
  { id: 'ref-2', src: 'https://picsum.photos/seed/reference-product/160/160', alt: 'Reference image 2, a product' },
]

const meta = {
  title: 'Blocks / Studio Settings Panel',
  component: StudioSettingsPanel,
  args: { models: MODELS, preset: PRESET, onChangePreset: fn(), onAddReference: fn(), onGenerate: fn() },
  decorators: [(Story) => <div className="flex min-h-200 w-88"><Story /></div>],
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof StudioSettingsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // No prompt and no reference yet, so the lime button waits.
    await expect(canvas.getByRole('button', { name: /Generate/ })).toBeDisabled()
    await expect(canvas.getByText('0/4')).toBeInTheDocument()
  },
}

// Wires references the way a studio does: Add opens a picker (here it adds a
// sample), remove drops one, and the add tile disappears when the rail is full.
function WithReferenceState(props: Partial<React.ComponentProps<typeof StudioSettingsPanel>>) {
  const [references, setReferences] = useState<StudioReference[]>(REFERENCES)
  return (
    <StudioSettingsPanel
      models={MODELS}
      preset={PRESET}
      {...props}
      references={references}
      onAddReference={() =>
        setReferences((current) => [
          ...current,
          {
            id: `ref-${current.length + 1}`,
            src: `https://picsum.photos/seed/reference-${current.length + 1}/160/160`,
            alt: `Reference image ${current.length + 1}`,
          },
        ])
      }
      onRemoveReference={(id) => setReferences((current) => current.filter((reference) => reference.id !== id))}
    />
  )
}

export const Filled: Story = {
  render: (args) => (
    <WithReferenceState
      {...args}
      defaultPrompt="She turns toward the window as the curtains lift in the breeze, warm late-afternoon light"
      defaultModel="lumen-3"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Lumen 3 at 3 credits a second, 5 seconds at 720p.
    await expect(canvas.getByRole('button', { name: 'Generate 15 credits' })).toBeEnabled()
    await userEvent.click(canvas.getByRole('button', { name: 'Add reference image' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Add reference image' }))
    // Four of four: the add tile is gone.
    await expect(canvas.getByText('4/4')).toBeInTheDocument()
    await expect(canvas.queryByRole('button', { name: 'Add reference image' })).toBeNull()
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Reference image 4' }))
    await expect(canvas.getByRole('button', { name: 'Add reference image' })).toBeInTheDocument()
  },
}

export const CostFollowsSettings: Story = {
  name: 'Cost follows the settings',
  args: { defaultPrompt: 'Waves rolling onto black sand at dusk, slow and heavy', defaultModel: 'lumen-3' },
  decorators: [(Story) => <div className="pb-48"><Story /></div>],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('combobox', { name: 'Duration' }))
    await userEvent.click(await page.findByRole('option', { name: '10s' }))
    await waitFor(() => expect(page.queryByRole('listbox')).toBeNull())
    await userEvent.click(canvas.getByRole('combobox', { name: 'Quality' }))
    await userEvent.click(await page.findByRole('option', { name: /1080p/ }))
    await waitFor(() => expect(page.queryByRole('listbox')).toBeNull())
    // 3 credits a second, 10 seconds, twice the cost at 1080p.
    const generate = canvas.getByRole('button', { name: 'Generate 60 credits' })
    await userEvent.click(generate)
    await expect(args.onGenerate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'lumen-3', duration: '10', quality: 'high', credits: 60, aspectRatio: '16:9' }),
    )
  },
}

export const Generating: Story = {
  args: { defaultPrompt: 'Lanterns drifting up over a dark lake', generating: true },
}

export const NotEnoughCredits: Story = {
  name: 'Not enough credits',
  args: { defaultPrompt: 'A train crossing a snowy viaduct, aerial', defaultModel: 'lumen-3', defaultDuration: '10', creditBalance: 12 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const generate = canvas.getByRole('button', { name: 'Generate 30 credits' })
    await expect(generate).toBeDisabled()
    await expect(generate).toHaveAccessibleDescription(/you have 12/)
  },
}

export const NoPreset: Story = {
  name: 'No preset',
  args: { preset: undefined, defaultPrompt: 'A hummingbird hovering at a red flower, macro, slow motion' },
}

function CostChip({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 tabular-nums">
      <Icon name="star_shine-fill" className="size-3.5" />
      {value}
      <span className="sr-only">credits</span>
    </span>
  )
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <Select items={[{ value, label: value }]} defaultValue={value}>
      <SelectTrigger size="sm" aria-label={label} className="w-full">
        <SelectValue />
      </SelectTrigger>
    </Select>
  )
}

// A cut-down rail for the Do/Don't pairs, so each side shows only the difference.
function Rail({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 rounded-2xl bg-card p-3">{children}</div>
}

export const DoDont: Story = {
  decorators: [(Story) => <Story />],
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="generate-at-the-bottom"
        doExample={
          <Rail>
            <div className="grid grid-cols-2 gap-2">
              <Chip label="Duration" value="5s" />
              <Chip label="Quality" value="720p" />
            </div>
            <Button variant="brand" depth="glossy" size="xl" className="w-full">
              Generate <CostChip value={15} />
            </Button>
          </Rail>
        }
        dontExample={
          <Rail>
            <Button variant="brand" depth="glossy" size="xl" className="w-full">
              Generate <CostChip value={15} />
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Chip label="Duration" value="5s" />
              <Chip label="Quality" value="720p" />
            </div>
          </Rail>
        }
      />
      <DoDontPair
        usage={usage}
        id="chips-stay-neutral"
        doExample={
          <Rail>
            <div className="grid grid-cols-2 gap-2">
              <Chip label="Duration" value="10s" />
              <Chip label="Quality" value="1080p" />
            </div>
          </Rail>
        }
        dontExample={
          <Rail>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="brand" size="sm">10s</Button>
              <Chip label="Quality" value="1080p" />
            </div>
          </Rail>
        }
      />
    </div>
  ),
}
