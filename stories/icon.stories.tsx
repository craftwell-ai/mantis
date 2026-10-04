import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { icons } from '@/components/ui/icons.generated'
import { usage } from '../usage/icon.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'
import { IconGallery } from './IconGallery'

const ICON_COUNT = Object.keys(icons).length
// Derived, so adding an icon such as play_arrow does not break the search check.
const ARROW_COUNT = Object.keys(icons).filter((name) => name.includes('arrow')).length

const meta = {
  title: 'Components / Icon',
  component: Icon,
  args: { name: 'check_circle' },
  argTypes: { name: { control: 'select', options: Object.keys(icons) } },
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

export const Gallery: Story = {
  parameters: { layout: 'padded' },
  render: () => <IconGallery />,
  // Searches, clears, then selects, so the story ends showing every icon with
  // one selected and its code on screen.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const search = canvas.getByLabelText('Search icons')
    await userEvent.type(search, 'arrow')
    await expect(canvas.getAllByRole('button')).toHaveLength(ARROW_COUNT)
    await userEvent.clear(search)
    await expect(canvas.getAllByRole('button')).toHaveLength(ICON_COUNT)
    await userEvent.click(canvas.getByRole('button', { name: 'check_circle' }))
    await expect(canvas.getByText('<Icon name="check_circle" />')).toBeVisible()
  },
}

export const InButton: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <Icon name="add" />
        New project
      </Button>
      <Button variant="outline">
        Continue
        <Icon name="arrow_forward" />
      </Button>
    </div>
  ),
}

export const Standalone: Story = {
  args: { name: 'check_circle', label: 'Render complete', className: 'size-8' },
}

export const Dark: Story = {
  globals: { theme: 'dark' },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <Icon name="add" />
        New project
      </Button>
      <Button variant="outline" size="icon" aria-label="Search the asset library">
        <Icon name="search" />
      </Button>
      <Icon name="check_circle" label="Render complete" className="size-8" />
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="max-w-3xl">
      <DoDontPair
        usage={usage}
        id="inherit-size-and-color"
        doExample={
          <div className="flex flex-col items-start gap-3">
            <Button variant="outline">
              <Icon name="add" />
              Add to project
            </Button>
            <p className="flex items-center gap-1.5 text-sm">
              <Icon name="info" />
              Upscaling costs 2 credits per image.
            </p>
          </div>
        }
        dontExample={
          <div className="flex flex-col items-start gap-3">
            <Button variant="outline">
              <Icon name="add" className="size-7 text-destructive" />
              Add to project
            </Button>
            <p className="flex items-center gap-1.5 text-sm">
              <Icon name="info" className="size-8 text-primary" />
              Upscaling costs 2 credits per image.
            </p>
          </div>
        }
      />
    </div>
  ),
}
