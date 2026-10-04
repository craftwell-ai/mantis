import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { NotificationSettings } from '@/registry/notification-settings'
import { usage } from '../usage/notification-settings.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Blocks / Notification Settings',
  component: NotificationSettings,
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof NotificationSettings>

export default meta
type Story = StoryObj<typeof meta>

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export const Default: Story = {
  args: { onSave: () => wait(600) },
}

export const AllOff: Story = {
  name: 'Everything off',
  args: {
    defaultValue: { email: {}, digest: 'never' },
    onSave: () => wait(600),
  },
}

export const Saved: Story = {
  args: { onSave: () => wait(50) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Product news' }))
    await userEvent.click(canvas.getByRole('radio', { name: 'Daily' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Save preferences' }))
    await expect(await canvas.findByText('Notification preferences saved.')).toBeInTheDocument()
  },
}

export const SaveFailed: Story = {
  name: 'Save failed',
  args: {
    onSave: async () => {
      await wait(50)
      throw new Error('Network unavailable')
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Save preferences' }))
    await expect(await canvas.findByRole('alert')).toHaveTextContent('We could not save your preferences')
  },
}

export const CustomTopics: Story = {
  name: 'Custom topics',
  args: {
    topics: [
      { id: 'team-invite', label: 'You are invited to a team', description: 'Sent once per invitation, with a link to accept it.' },
      { id: 'credits-low', label: 'Your credits run low', description: 'A heads-up when fewer than 50 credits are left this month.' },
    ],
    defaultValue: { email: { 'team-invite': true, 'credits-low': true }, digest: 'daily' },
    onSave: () => wait(600),
  },
}

function SwitchesWithSave() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {['A generation finishes', 'Someone comments on your work'].map((label, index) => (
          <label key={label} className="flex items-center justify-between gap-3 text-sm">
            {label}
            <Switch defaultChecked={index === 0} />
          </label>
        ))}
      </CardContent>
      <CardFooter className="justify-end">
        <Button>Save preferences</Button>
      </CardFooter>
    </Card>
  )
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-5xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="checkboxes-when-you-save"
        doExample={<NotificationSettings />}
        dontExample={<SwitchesWithSave />}
      />
    </div>
  ),
}
