import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, screen, userEvent, within } from 'storybook/test'

import { CanvasShell } from '@/registry/canvas-shell'
import { SAMPLE_BRAND_NAME, SAMPLE_CANVAS_LAYERS, SAMPLE_CANVAS_PROJECT_NAME, SampleCanvasBoard } from '@/registry/sample-content'
import { usage } from '../usage/canvas-shell.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Templates / Canvas Shell',
  component: CanvasShell,
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  decorators: [(Story, { parameters }) => (parameters.layout === 'fullscreen' ? <div className="-m-6">{Story()}</div> : Story())],
  args: {
    brandName: SAMPLE_BRAND_NAME,
    projectName: SAMPLE_CANVAS_PROJECT_NAME,
    layers: SAMPLE_CANVAS_LAYERS,
    selectedLayerId: undefined,
    onAdd: fn(),
    onUndo: fn(),
    onRedo: fn(),
    onShare: fn(),
    onToolChange: fn(),
    children: <SampleCanvasBoard />,
  },
} satisfies Meta<typeof CanvasShell>

export default meta
type Story = StoryObj<typeof meta>

const wide = (Story: () => React.ReactNode) => <div className="w-320">{Story()}</div>

export const Default: Story = { decorators: [wide] }

// Bare, like a component dropped in from a library: every prop falls back to the sample content.
export const NoProps: Story = {
  name: 'No props',
  render: () => <CanvasShell />,
}

export const BlankBoard: Story = {
  name: 'Blank board, panel closed',
  decorators: [wide],
  args: { board: 'blank', defaultPanelOpen: false, children: null, layers: [] },
}

export const Phone: Story = {
  name: 'Small screen (390px)',
  decorators: [(Story) => <div className="w-97.5">{Story()}</div>],
}

// Proves the tool shortcuts and the zoom controls.
export const ToolsAndZoom: Story = {
  name: 'Tools and zoom',
  decorators: [wide],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.keyboard('h')
    await expect(canvas.getByRole('button', { name: 'Hand' })).toHaveAttribute('aria-pressed', 'true')
    await expect(args.onToolChange).toHaveBeenCalledWith('pan')
    await userEvent.click(canvas.getByRole('button', { name: 'Zoom in' }))
    await expect(canvas.getByRole('button', { name: /125%/ })).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('button', { name: /reset zoom/ }))
    await expect(canvas.getByRole('button', { name: /^100%/ })).toBeInTheDocument()
  },
}

// Proves a layer can be selected and hidden from the panel.
export const Layers: Story = {
  decorators: [wide],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const panel = canvas.getByRole('complementary', { name: 'Layers and properties' })
    await userEvent.click(within(panel).getByRole('button', { name: 'Teaser clip' }))
    await expect(within(panel).getByRole('button', { name: 'Teaser clip' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(within(panel).getByRole('button', { name: 'Hide Teaser clip' }))
    await expect(within(panel).getByRole('button', { name: 'Show Teaser clip' })).toBeInTheDocument()
    await userEvent.click(within(panel).getByRole('tab', { name: 'Properties' }))
    await expect(within(panel).getByLabelText('Width')).toHaveValue(280)
  },
}

// Below 1024px the panel opens as a sheet.
export const PanelSheet: Story = {
  name: 'Panel sheet (small screen)',
  decorators: [(Story) => <div className="w-97.5">{Story()}</div>],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Layers and properties' }))
    const dialog = await screen.findByRole('dialog')
    await expect(within(dialog).getByRole('button', { name: 'Hero frame' })).toBeInTheDocument()
  },
}

function BoardSketch({ boxed }: { boxed?: boolean }) {
  return (
    <div className="relative flex h-44 flex-col overflow-hidden rounded-xl bg-background">
      {boxed ? <div className="h-7 shrink-0 border-b border-divider bg-card" /> : null}
      <div className="relative flex min-h-0 flex-1">
        <div className="relative flex-1">
          <div className="absolute top-1/2 left-1/2 h-16 w-24 -translate-1/2 rounded-lg bg-muted" />
          {boxed ? null : (
            <>
              <div className="absolute top-2 left-2 h-6 w-20 rounded-lg border border-glass-border bg-glass-panel" />
              <div className="absolute bottom-2 left-1/2 h-7 w-28 -translate-x-1/2 rounded-xl border border-glass-border bg-glass-panel" />
              <div className="absolute top-10 right-2 bottom-2 w-14 rounded-lg border border-glass-border bg-glass-panel" />
            </>
          )}
        </div>
        {boxed ? <div className="w-16 shrink-0 border-l border-divider bg-card" /> : null}
      </div>
      {boxed ? <div className="h-8 shrink-0 border-t border-divider bg-card" /> : null}
    </div>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair usage={usage} id="chrome-floats" doExample={<BoardSketch />} dontExample={<BoardSketch boxed />} />
    </div>
  ),
}
