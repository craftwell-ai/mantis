import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { usage } from '../usage/alert-dialog.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Alert Dialog',
  component: AlertDialog,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof AlertDialog>

export default meta
type Story = StoryObj<typeof meta>

function DeleteGeneration({ open }: { open?: boolean }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger render={<Button variant="destructive" />}>Delete generation</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Glass Harbor?</AlertDialogTitle>
          <AlertDialogDescription>The clip and its 12 variations are removed from your library. This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="glass">Keep it</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete generation</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const Open: Story = { render: () => <DeleteGeneration open /> }

export const Closed: Story = { render: () => <DeleteGeneration /> }

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="name-the-consequence"
        doExample={
          <div className="flex w-80 flex-col gap-2 rounded-2xl border border-separator bg-dialog p-6">
            <p className="text-title-sm">Delete Glass Harbor?</p>
            <p className="text-base text-muted-foreground">The clip and its 12 variations are removed.</p>
          </div>
        }
        dontExample={
          <div className="flex w-80 flex-col gap-2 rounded-2xl border border-separator bg-dialog p-6">
            <p className="text-title-sm">Are you sure?</p>
            <p className="text-base text-muted-foreground">Please confirm.</p>
          </div>
        }
      />
    </div>
  ),
}
