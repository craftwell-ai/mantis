import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Icon } from '@/components/ui/icon'
import { SAMPLE_IMAGE_COMPOSER, SAMPLE_PROJECTS, sampleNavigation } from '@/registry/sample-content'
import { StudioHomePage } from '@/registry/studio-home-page'
import { usage } from '../usage/studio-home-page.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Templates / Studio Home Page',
  component: StudioHomePage,
  // The global preview wrapper pads every story by 24px; full-page stories cancel it to show edge to edge.
  decorators: [(Story, context) => (context.parameters.layout === 'fullscreen' ? <div className="-m-6"><Story /></div> : <Story />)],
  parameters: { layout: 'fullscreen', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    navigation: sampleNavigation('/projects'),
    composer: { ...SAMPLE_IMAGE_COMPOSER, onGenerate: fn() },
    projects: SAMPLE_PROJECTS,
    onNewProject: fn(),
    allProjectsHref: '#all-projects',
  },
} satisfies Meta<typeof StudioHomePage>

export default meta
type Story = StoryObj<typeof meta>

export const WithProjects: Story = { name: 'With projects' }

// Bare, like a component dropped in from a library: every prop falls back to the sample content.
export const NoProps: Story = {
  name: 'No props',
  render: () => <StudioHomePage />,
}

export const Empty: Story = {
  name: 'No projects yet',
  args: { projects: [] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'New project' }))
    await expect(args.onNewProject).toHaveBeenCalledTimes(1)
  },
}

export const Loading: Story = {
  args: { projects: [], loading: true },
}

function ButtonsSketch({ filled }: { filled: 'one' | 'two' }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center justify-end rounded-lg bg-card p-2">
        <span className="inline-flex h-8 items-center gap-1 rounded-md bg-brand px-3 text-sm font-medium text-brand-foreground">Generate</span>
      </div>
      <span
        className={
          filled === 'one'
            ? 'inline-flex h-8 items-center gap-1 rounded-md bg-glass px-3 text-sm font-medium text-foreground'
            : 'inline-flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground'
        }
      >
        <Icon name="add" />
        New project
      </span>
    </div>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair usage={usage} id="generate-is-the-only-fill" doExample={<ButtonsSketch filled="one" />} dontExample={<ButtonsSketch filled="two" />} />
    </div>
  ),
}
