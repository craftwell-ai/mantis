import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupCard } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShareDialog } from '@/registry/share-dialog'
import { usage } from '../usage/share-dialog.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Blocks / Share Dialog',
  component: ShareDialog,
  args: {
    itemName: 'Desert Bloom',
    shareUrl: 'https://studio.example.com/p/desert-bloom-7f3k',
    members: [
      { id: 'me', name: 'Ava Reyes', email: 'ava@lumenhouse.studio', avatar: 'https://picsum.photos/seed/ava/64/64', role: 'owner' },
      { id: 'leo', name: 'Leo Park', email: 'leo@lumenhouse.studio', role: 'editor' },
    ],
    trigger: (
      <Button variant="glass">
        <Icon name="person_add" />
        Share
      </Button>
    ),
    onShare: fn(),
  },
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof ShareDialog>

export default meta
type Story = StoryObj<typeof meta>

async function openDialog(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const page = within(canvasElement.ownerDocument.body)
  await userEvent.click(canvas.getByRole('button', { name: 'Share' }))
  const dialog = await page.findByRole('dialog', { name: 'Share Desert Bloom' })
  await waitFor(() => expect(getComputedStyle(dialog).opacity).toBe('1'))
  return within(dialog)
}

export const Closed: Story = {}

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement)
    await expect(dialog.getByRole('radio', { name: /Private/ })).toBeChecked()
  },
}

export const WithInvitees: Story = {
  name: 'Inviting people',
  play: async ({ canvasElement, args }) => {
    const dialog = await openDialog(canvasElement)
    const field = dialog.getByLabelText('Invite people')
    await userEvent.type(field, 'mara@northlight.co{Enter}jun@northlight.co,')
    await expect(dialog.getByRole('button', { name: 'Remove mara@northlight.co' })).toBeVisible()
    await expect(dialog.getByRole('combobox', { name: 'Role for jun@northlight.co' })).toBeVisible()
    await userEvent.click(dialog.getByRole('radio', { name: /Anyone with the link/ }))
    await userEvent.click(dialog.getByRole('button', { name: 'Share with 2 people' }))
    await expect(args.onShare).toHaveBeenCalledWith({
      invitees: [
        { email: 'mara@northlight.co', role: 'viewer' },
        { email: 'jun@northlight.co', role: 'viewer' },
      ],
      visibility: 'link',
    })
  },
}

export const InvalidEmail: Story = {
  name: 'Address with a typo',
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement)
    await userEvent.type(dialog.getByLabelText('Invite people'), 'mara@northlight{Enter}')
    await expect(dialog.getByRole('alert')).toHaveTextContent('is not an email address')
  },
}

export const Public: Story = {
  args: { defaultVisibility: 'public' },
  play: async ({ canvasElement }) => {
    const dialog = await openDialog(canvasElement)
    await expect(dialog.getByRole('radio', { name: /Public/ })).toBeChecked()
  },
}

const visibilityOptions = [
  { value: 'private', icon: 'lock', title: 'Private', description: 'Only you and people you invite' },
  { value: 'link', icon: 'link', title: 'Anyone with the link', description: 'Can view without signing in' },
  { value: 'public', icon: 'public', title: 'Public', description: 'Listed on your profile and in Explore' },
] as const

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-4xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="visibility-as-cards"
        doExample={
          <RadioGroup defaultValue="private" aria-label="Who can open it" className="grid-cols-3">
            {visibilityOptions.map((option) => (
              <RadioGroupCard key={option.value} value={option.value} className="p-3 pr-8">
                <Icon name={option.icon} className="mb-2 size-5 text-muted-foreground" />
                <span className="text-sm font-medium">{option.title}</span>
                <span data-contrast-exempt className="text-xs text-muted-foreground">{option.description}</span>
              </RadioGroupCard>
            ))}
          </RadioGroup>
        }
        dontExample={
          <div className="flex items-center justify-between gap-3">
            <Label>Visibility</Label>
            <Select items={visibilityOptions.map((o) => ({ value: o.value, label: o.title }))} defaultValue="private">
              <SelectTrigger size="sm" aria-label="Visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  ),
}
