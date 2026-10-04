import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useId } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usage } from '../usage/input.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Input',
  component: Input,
  args: {
    type: 'search',
    placeholder: 'Search by prompt, preset or project',
    'aria-label': 'Search generations',
    className: 'w-72',
  },
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

function EmailField() {
  const id = useId()
  return (
    <div className="grid w-72 gap-2">
      <Label htmlFor={id}>Collaborator email</Label>
      <Input id={id} type="email" autoComplete="email" placeholder="name@studio.com" />
    </div>
  )
}

export const WithLabel: Story = { render: () => <EmailField /> }

function DisabledField() {
  const id = useId()
  const hintId = useId()
  return (
    <div className="grid w-72 gap-2">
      <Label htmlFor={id}>Project share link</Label>
      <Input id={id} disabled defaultValue="lanternworks.example/night-market" aria-describedby={hintId} />
      <p id={hintId} className="text-sm text-muted-foreground">
        Only project owners can change the share link.
      </p>
    </div>
  )
}

export const Disabled: Story = { render: () => <DisabledField /> }

function InvalidField() {
  const id = useId()
  const errorId = useId()
  return (
    <div className="grid w-72 gap-2">
      <Label htmlFor={id}>Collaborator email</Label>
      <Input id={id} type="email" autoComplete="email" defaultValue="maya@lanternworks" aria-invalid aria-describedby={errorId} />
      <p id={errorId} className="text-sm text-destructive">
        Enter a full email address, like name@studio.com.
      </p>
    </div>
  )
}

export const Invalid: Story = { render: () => <InvalidField /> }

export const Dark: Story = {
  globals: { theme: 'dark' },
  render: () => <EmailField />,
}

function InputDoDont() {
  const projectId = useId()
  const titleId = useId()
  const seedId = useId()
  const titleWideId = useId()
  const seedWideId = useId()
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="always-a-visible-label"
        doExample={
          <div className="grid gap-2">
            <Label htmlFor={projectId}>Project name</Label>
            <Input id={projectId} autoComplete="off" placeholder="e.g. Night Market Teaser" />
          </div>
        }
        // aria-label keeps the example itself usable with a screen reader; the
        // problem this pair shows is the one sighted people hit.
        dontExample={<Input aria-label="Project name" autoComplete="off" placeholder="Project name" />}
      />
      <DoDontPair
        usage={usage}
        id="size-to-the-answer"
        doExample={
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={titleId}>Shot title</Label>
              <Input id={titleId} autoComplete="off" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={seedId}>Seed</Label>
              <Input id={seedId} inputMode="numeric" autoComplete="off" className="w-28" />
            </div>
          </div>
        }
        dontExample={
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={titleWideId}>Shot title</Label>
              <Input id={titleWideId} autoComplete="off" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={seedWideId}>Seed</Label>
              <Input id={seedWideId} inputMode="numeric" autoComplete="off" />
            </div>
          </div>
        }
      />
    </div>
  )
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => <InputDoDont />,
}
