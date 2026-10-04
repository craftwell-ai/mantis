import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState, type ReactElement } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import { usage } from '../usage/dropdown-menu.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

// Every menu here uses Base UI's default modal mode. modal={false} leaves
// Tab-reachable focus guards beside the menu, which axe fails as
// aria-hidden-focus (see the usage guide's a11y notes).
function GenerationActionsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Generation actions
        <Icon name="keyboard_arrow_down" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {/* Base UI requires a label to sit inside the group it names. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Glass Harbor</DropdownMenuLabel>
          <DropdownMenuItem>
            <Icon name="arrow_forward" />
            Open in editor
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon name="add" />
            Remix prompt
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon name="image" />
            Upscale
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Icon name="close" />
          Delete generation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const meta = {
  title: 'Components / Dropdown Menu',
  component: DropdownMenu,
  render: () => <GenerationActionsMenu />,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {}

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The menu is portaled to <body>, outside the story's canvas.
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Generation actions' }))
    const menu = await page.findByRole('menu')
    // The menu fades in and axe runs as soon as play ends; wait for full
    // opacity so it measures the real colors, not a half-faded frame.
    await waitFor(() => expect(getComputedStyle(menu).opacity).toBe('1'))
    await expect(page.getByRole('menuitem', { name: 'Delete generation' })).toBeVisible()
  },
}

const COLUMNS = [
  { key: 'model', label: 'Model' },
  { key: 'aspectRatio', label: 'Aspect ratio' },
  { key: 'credits', label: 'Credits' },
  { key: 'createdOn', label: 'Created' },
] as const

type ColumnKey = (typeof COLUMNS)[number]['key']

function ColumnsMenu() {
  const [visible, setVisible] = useState<Record<ColumnKey, boolean>>({ model: true, aspectRatio: true, credits: true, createdOn: false })
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Columns
        <Icon name="keyboard_arrow_down" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Show columns</DropdownMenuLabel>
          {COLUMNS.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.key}
              checked={visible[column.key]}
              onCheckedChange={(checked) => setVisible((current) => ({ ...current, [column.key]: checked === true }))}
              // Keeps the menu open so several columns can be switched in one visit.
              closeOnClick={false}
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const WithCheckboxItems: Story = {
  render: () => <ColumnsMenu />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Columns' }))
    const menu = await page.findByRole('menu')
    await waitFor(() => expect(getComputedStyle(menu).opacity).toBe('1'))
    const createdOn = page.getByRole('menuitemcheckbox', { name: 'Created' })
    await expect(createdOn).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(createdOn)
    await expect(createdOn).toHaveAttribute('aria-checked', 'true')
  },
}

export const Dark: Story = {
  globals: { theme: 'dark' },
  play: Open.play,
}

function DownloadMenu({ children }: { children: ReactElement }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={children} />
      <DropdownMenuContent align="start">
        <DropdownMenuItem>Download PNG</DropdownMenuItem>
        <DropdownMenuItem>Download full resolution</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="max-w-3xl">
      <DoDontPair
        usage={usage}
        id="trigger-shows-a-menu"
        doExample={
          <div className="flex flex-wrap items-center gap-2">
            <DownloadMenu>
              <Button variant="outline">
                Download
                <Icon name="keyboard_arrow_down" />
              </Button>
            </DownloadMenu>
            <DownloadMenu>
              <Button variant="ghost" size="icon" aria-label="More actions for this generation">
                <Icon name="more_vert" />
              </Button>
            </DownloadMenu>
          </div>
        }
        dontExample={
          <DownloadMenu>
            <Button variant="outline">Download</Button>
          </DownloadMenu>
        }
      />
    </div>
  ),
}
