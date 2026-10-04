import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Icon } from '@/components/ui/icon'
import { SAMPLE_CLIPS, SAMPLE_VIDEO_SETTINGS, picsum, sampleNavigation } from '@/registry/sample-content'
import { VideoStudioPage } from '@/registry/video-studio-page'
import { usage } from '../usage/video-studio-page.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Templates / Video Studio Page',
  component: VideoStudioPage,
  // The global preview wrapper pads every story by 24px; full-page stories cancel it to show edge to edge.
  decorators: [(Story, context) => (context.parameters.layout === 'fullscreen' ? <div className="-m-6"><Story /></div> : <Story />)],
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    navigation: sampleNavigation('/video'),
    settings: { ...SAMPLE_VIDEO_SETTINGS, onChangePreset: fn(), onAddReference: fn(), onGenerate: fn() },
    clips: SAMPLE_CLIPS,
    onDownload: fn(),
    onReuse: fn(),
  },
} satisfies Meta<typeof VideoStudioPage>

export default meta
type Story = StoryObj<typeof meta>

export const WithClips: Story = { name: 'With clips' }

// Bare, like a component dropped in from a library: every prop falls back to the sample content.
export const NoProps: Story = {
  name: 'No props',
  render: () => <VideoStudioPage />,
}

export const Empty: Story = {
  name: 'No clips yet',
  args: { clips: [] },
}

export const Rendering: Story = {
  args: {
    clips: [{ id: 'pending', alt: 'Lighthouse beam sweeping over a stormy sea', prompt: 'The lighthouse beam sweeps across a stormy sea, waves breaking on the rocks below.', model: 'Lumen 3', settings: ['8s', '16:9', '1080p'], createdAt: 'now', status: 'generating' }, ...SAMPLE_CLIPS],
  },
}

// Picking a clip in the strip puts it on the canvas and marks it pressed.
export const PickingAClip: Story = {
  name: 'Picking a recent clip',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const thumb = canvas.getByRole('button', { name: 'Blue glacier ice cracking into the sea' })
    await userEvent.click(thumb)
    await expect(thumb).toHaveAttribute('aria-pressed', 'true')
    const selected = canvas.getByRole('article', { name: 'Selected clip' })
    await expect(within(selected).getByRole('img', { name: 'Blue glacier ice cracking into the sea' })).toBeInTheDocument()
  },
}

function StripSketch({ marks }: { marks: 'lime' | 'many' }) {
  return (
    <div className="flex gap-2">
      {['a', 'b', 'c'].map((seed, index) => (
        <div
          key={seed}
          className={`relative aspect-video w-24 overflow-hidden rounded-lg ${(marks === 'lime' && index === 0) ? 'ring-2 ring-ring ring-inset' : ''}`}
        >
          <img src={picsum(`strip-${seed}`, 192, 108)} alt="" className="size-full object-cover" />
          {marks === 'many' ? (
            <span className="absolute inset-0 flex items-center justify-center bg-overlay text-foreground">
              <Icon name="play_arrow" />
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function RailSketch({ pinned }: { pinned: boolean }) {
  return (
    <div className="flex h-44 w-40 flex-col gap-1.5 overflow-hidden rounded-lg bg-card p-2">
      {[1, 2, 3, 4].map((row) => (
        <div key={row} className="h-5 shrink-0 rounded-sm bg-field" />
      ))}
      {pinned ? <div className="mt-auto h-7 shrink-0 rounded-md bg-brand" /> : <div className="h-5 shrink-0 rounded-sm bg-field" />}
    </div>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair usage={usage} id="canvas-is-the-brightest" doExample={<StripSketch marks="lime" />} dontExample={<StripSketch marks="many" />} />
      <DoDontPair usage={usage} id="generate-pinned-to-the-rail" doExample={<RailSketch pinned />} dontExample={<RailSketch pinned={false} />} />
    </div>
  ),
}
