import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { toast } from 'sonner'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { usage } from '../usage/sonner.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'

// A real app mounts one Toaster, in its root layout. Here every story mounts
// its own, and a Toaster without an id shows every toast sent without one, so
// one story's toast would also appear in the others' (on the docs page, and
// in the test run). Each story's Toaster gets an id and its toast is sent there.
function PublishDemo({ toasterId, message }: { toasterId: string; message: string }) {
  return (
    <>
      <Toaster id={toasterId} />
      <Button onClick={() => toast.success(message, { toasterId })}>Publish to community</Button>
    </>
  )
}

const meta = {
  title: 'Components / Sonner',
  component: Toaster,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

function sendAndExpectToast(message: string): Story['play'] {
  return async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Toasts sit in their own fixed layer; search the whole page for them.
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Publish to community' }))
    const text = await page.findByText(message)
    // The toast slides and fades in and axe runs as soon as play ends; wait
    // for full opacity so it measures the real colors, not a half-faded frame.
    const toastElement = text.closest('[data-sonner-toast]') ?? text
    await waitFor(() => expect(getComputedStyle(toastElement).opacity).toBe('1'))
    await expect(text).toBeVisible()
  }
}

const DEFAULT_MESSAGE = 'Night Market Teaser is live on the community feed'

export const Default: Story = {
  render: () => <PublishDemo toasterId="sonner-default" message={DEFAULT_MESSAGE} />,
  play: sendAndExpectToast(DEFAULT_MESSAGE),
}

const DARK_MESSAGE = 'Glass Harbor is live on the community feed'

export const Dark: Story = {
  globals: { theme: 'dark' },
  render: () => <PublishDemo toasterId="sonner-dark" message={DARK_MESSAGE} />,
  play: sendAndExpectToast(DARK_MESSAGE),
}
