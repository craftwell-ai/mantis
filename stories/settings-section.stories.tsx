import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { SettingsSection, type SettingsRow } from '@/registry/settings-section'
import { usage } from '../usage/settings-section.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const visibility = [
  { value: 'private', label: 'Only me' },
  { value: 'team', label: 'My team' },
  { value: 'public', label: 'Everyone' },
]

const rows: SettingsRow[] = [
  {
    id: 'auto-publish',
    label: 'Publish new generations',
    description: 'Finished images and clips appear in Explore right away. Turn off to keep them private until you share them.',
    icon: 'public',
    control: ({ labelId, descriptionId }) => <Switch aria-labelledby={labelId} aria-describedby={descriptionId} />,
  },
  {
    id: 'default-visibility',
    label: 'Who sees new projects',
    description: 'Applies to projects you create from now on; existing projects keep their setting.',
    icon: 'lock',
    control: ({ labelId }) => (
      <Select items={visibility} defaultValue="team">
        <SelectTrigger size="sm" aria-labelledby={labelId}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} align="end">
          {visibility.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
  },
  {
    id: 'export-library',
    label: 'Download your library',
    description: 'A zip of every generation and its prompt, emailed to you within the hour.',
    icon: 'upload',
    control: ({ labelId }) => (
      <Button variant="secondary" size="sm" aria-describedby={labelId}>Request export</Button>
    ),
  },
]

const dangerZone = {
  title: 'Delete workspace',
  description: 'Removes the workspace for everyone in it.',
  consequences: ['Every project, generation and upload', 'Shared brand kits and presets', 'Credits left on the workspace balance'],
  actionLabel: 'Delete workspace',
  confirmTitle: 'Delete this workspace?',
  confirmDescription: 'Everything listed is removed for every member, and unused credits are not refunded. This cannot be undone.',
  cancelLabel: 'Keep workspace',
  onConfirm: () => {},
}

const meta = {
  title: 'Blocks / Settings Section',
  component: SettingsSection,
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
  args: { title: 'Privacy and sharing', description: 'Decide who sees what you make.', rows },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
} satisfies Meta<typeof SettingsSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithDangerZone: Story = {
  name: 'With danger zone',
  args: { title: 'Workspace', description: 'Settings that apply to everyone in this workspace.', rows: rows.slice(2), dangerZone },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Delete workspace' }))
    const dialog = await within(document.body).findByRole('alertdialog')
    await expect(dialog).toHaveTextContent('This cannot be undone.')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Keep workspace' }))
  },
}

export const NoIcons: Story = {
  name: 'Rows without icons',
  args: { rows: rows.map((row) => ({ ...row, icon: undefined })) },
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-5xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="one-control-per-row"
        doExample={<SettingsSection title="Exports" rows={rows.slice(2)} />}
        dontExample={
          <div className="flex items-center gap-2 rounded-2xl bg-card p-5 text-sm">
            <span className="flex-1">Library</span>
            <Button variant="secondary" size="sm">Export</Button>
            <Button variant="secondary" size="sm">Archive</Button>
            <Button variant="destructive" size="sm">Clear</Button>
          </div>
        }
      />
      <DoDontPair
        usage={usage}
        id="danger-zone-last"
        doExample={<SettingsSection title="Workspace" rows={rows.slice(2)} dangerZone={dangerZone} />}
        dontExample={
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-5 text-sm">
            <div className="flex items-center gap-2"><span className="flex-1">Download your library</span><Button variant="secondary" size="sm">Request export</Button></div>
            <div className="flex items-center gap-2"><span className="flex-1">Workspace</span><Button variant="destructive" size="sm">Delete</Button></div>
            <div className="flex items-center gap-2"><span className="flex-1">Default visibility</span><Button variant="secondary" size="sm">Change</Button></div>
          </div>
        }
      />
    </div>
  ),
}
