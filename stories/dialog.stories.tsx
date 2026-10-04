import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useId, type ReactNode } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usage } from '../usage/dialog.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

function RenameProjectDialog() {
  const nameId = useId()
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Rename project</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
          <DialogDescription>The new name shows in your asset library, on share links and on anything you publish to the community.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor={nameId}>Project name</Label>
          <Input id={nameId} defaultValue="Night Market Teaser" />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <DialogClose render={<Button />}>Save name</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const meta = {
  title: 'Components / Dialog',
  component: Dialog,
  render: () => <RenameProjectDialog />,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {}

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The dialog is portaled to <body>, outside the story's canvas.
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Rename project' }))
    const dialog = await page.findByRole('dialog', { name: 'Rename project' })
    // The panel fades in and axe runs as soon as play ends; wait for full
    // opacity so it measures the real colors, not a half-faded frame.
    await waitFor(() => expect(getComputedStyle(dialog).opacity).toBe('1'))
    await expect(dialog).toBeVisible()
    await expect(page.getByLabelText('Project name')).toHaveValue('Night Market Teaser')
  },
}

export const Dark: Story = {
  globals: { theme: 'dark' },
  play: Open.play,
}

// Drawn in place rather than portaled, so two panels can sit side by side for
// comparison. The classes match DialogContent's own.
function DialogPanel({ title, description, children, footer }: { title: string; description: string; children?: ReactNode; footer: ReactNode }) {
  return (
    <div className="grid gap-4 rounded-lg border bg-background p-6 shadow-lg">
      <div className="flex flex-col gap-2">
        <p className="text-lg leading-none font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
      <div className="flex flex-wrap justify-end gap-2">{footer}</div>
    </div>
  )
}

function DialogDoDont() {
  const nameId = useId()
  const ownerId = useId()
  return (
    <div className="max-w-3xl">
      <DoDontPair
        usage={usage}
        id="one-decision-per-dialog"
        doExample={
          <DialogPanel
            title="Delete this generation?"
            description="Glass Harbor and its two upscaled versions leave the asset library for everyone on the project. Credits spent on it are not returned."
            footer={
              <>
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive">Delete generation</Button>
              </>
            }
          />
        }
        dontExample={
          <DialogPanel
            title="Generation options"
            description="Choose what to do with this generation."
            footer={
              <>
                <Button variant="outline">Duplicate</Button>
                <Button variant="outline">Upscale</Button>
                <Button>Save</Button>
                <Button variant="destructive">Delete</Button>
              </>
            }
          >
            <div className="grid gap-2">
              <Label htmlFor={nameId}>Title</Label>
              <Input id={nameId} defaultValue="Glass Harbor" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={ownerId}>Share with</Label>
              <Input id={ownerId} type="email" defaultValue="priya@lanternworks.example" />
            </div>
          </DialogPanel>
        }
      />
    </div>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => <DialogDoDont />,
}
