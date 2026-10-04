import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Heading, HeadingAccent } from '@/components/ui/heading'
import type { GenerationFeedItem } from '@/registry/generation-feed'
import { ImageStudioPage } from '@/registry/image-studio-page'
import type { PromptComposerRequest } from '@/registry/prompt-composer'
import { SAMPLE_ACCOUNT, SAMPLE_GENERATIONS, SAMPLE_IMAGE_COMPOSER, picsum, sampleNavigation } from '@/registry/sample-content'
import { usage } from '../usage/image-studio-page.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Templates / Image Studio Page',
  component: ImageStudioPage,
  // The global preview wrapper pads every story by 24px; full-page stories cancel it to show edge to edge.
  decorators: [(Story, context) => (context.parameters.layout === 'fullscreen' ? <div className="-m-6"><Story /></div> : <Story />)],
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    navigation: sampleNavigation('/image'),
    composer: { ...SAMPLE_IMAGE_COMPOSER, onGenerate: fn() },
    items: SAMPLE_GENERATIONS,
    owner: { name: SAMPLE_ACCOUNT.user.name, avatarSrc: SAMPLE_ACCOUNT.user.avatarSrc },
    recreateCost: 4,
    onDownload: fn(),
    onReuse: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof ImageStudioPage>

export default meta
type Story = StoryObj<typeof meta>

export const WithResults: Story = { name: 'With results' }

// Bare, like a component dropped in from a library: every prop falls back to the sample content.
export const NoProps: Story = {
  name: 'No props',
  render: () => <ImageStudioPage />,
}

export const FirstVisit: Story = {
  name: 'First visit (hero)',
  args: { items: [] },
}

export const Loading: Story = {
  args: { items: [], loading: true },
}

export const Generating: Story = {
  args: {
    composer: { ...SAMPLE_IMAGE_COMPOSER, generating: true, defaultPrompt: 'A lighthouse keeper’s kitchen at dawn' },
    items: [
      { id: 'pending-1', alt: 'A lighthouse keeper’s kitchen at dawn', prompt: 'A lighthouse keeper’s kitchen at dawn', model: 'Standard', createdAt: 'now', status: 'generating' },
      { id: 'pending-2', alt: 'A lighthouse keeper’s kitchen at dawn, second take', prompt: 'A lighthouse keeper’s kitchen at dawn', model: 'Standard', createdAt: 'now', status: 'generating' },
      ...SAMPLE_GENERATIONS,
    ],
  },
}

// The hero gives way to the feed once the first result arrives.
function FirstGenerationDemo(args: React.ComponentProps<typeof ImageStudioPage>) {
  const [items, setItems] = useState<GenerationFeedItem[]>([])
  const onGenerate = (request: PromptComposerRequest) => {
    setItems(
      Array.from({ length: request.count }, (_, index) => ({
        id: `result-${index}`,
        src: picsum(`result-${index}`, 800, 800),
        alt: `Result ${index + 1} for your prompt`,
        prompt: request.prompt,
        model: 'Standard',
        settings: [request.aspectRatio],
        createdAt: 'just now',
      }))
    )
  }
  return <ImageStudioPage {...args} items={items} composer={{ ...SAMPLE_IMAGE_COMPOSER, ...args.composer, onGenerate }} />
}

export const FirstGeneration: Story = {
  name: 'Hero gives way to the feed',
  args: { items: [] },
  render: (args) => <FirstGenerationDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { level: 1, name: /Sketch it in words/i })).toBeVisible()
    await userEvent.type(canvas.getByRole('textbox', { name: 'Prompt' }), 'A greenhouse full of orchids in fog')
    await userEvent.click(canvas.getByRole('button', { name: /Generate/ }))
    await waitFor(() => expect(canvas.getByRole('list', { name: 'Generations' })).toBeInTheDocument())
    await expect(canvas.queryByText(/Sketch it in/i)).not.toBeInTheDocument()
  },
}

// Opening a tile shows it in the lightbox inspector.
export const OpenInLightbox: Story = {
  name: 'Opening a result',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /Open: Fishing boats/ }))
    const page = within(canvasElement.ownerDocument.body)
    const dialog = await page.findByRole('dialog')
    await waitFor(() => expect(getComputedStyle(dialog).opacity).toBe('1'))
    await expect(within(dialog).getByRole('img', { name: /Fishing boats/ })).toBeInTheDocument()
  },
}

function HeroSketch({ lime }: { lime: 'one' | 'all' }) {
  return (
    <Heading level="sub" render={<p />} className="text-center">
      {lime === 'one' ? (
        <>
          Sketch it in <HeadingAccent>words</HeadingAccent>
        </>
      ) : (
        <HeadingAccent>Sketch it in words</HeadingAccent>
      )}
    </Heading>
  )
}

function DockSketch({ docked }: { docked: boolean }) {
  return (
    <div className="flex h-40 flex-col gap-1 overflow-hidden rounded-lg bg-background p-1">
      {!docked ? <div className="h-8 rounded-md border border-separator bg-card" /> : null}
      <div className="grid flex-1 grid-cols-4 gap-0.5">
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((seed) => (
          <img key={seed} src={picsum(`dock-${seed}`, 120, 120)} alt="" className="size-full object-cover" />
        ))}
      </div>
      {docked ? <div className="mx-auto h-8 w-3/4 rounded-md border border-separator bg-card" /> : null}
    </div>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair usage={usage} id="one-lime-word" doExample={<HeroSketch lime="one" />} dontExample={<HeroSketch lime="all" />} />
      <DoDontPair usage={usage} id="composer-stays-docked" doExample={<DockSketch docked />} dontExample={<DockSketch docked={false} />} />
    </div>
  ),
}
