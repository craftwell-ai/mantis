import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { usage } from '../usage/field.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Field',
  component: Field,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const ProfileForm: Story = {
  name: 'Profile form',
  render: () => (
    <FieldGroup className="w-80">
      <Field>
        <FieldLabel htmlFor="username">Username</FieldLabel>
        <Input id="username" defaultValue="lanternworks" />
        <FieldDescription>Shown on your public profile and posts.</FieldDescription>
      </Field>
      <Field data-invalid="true">
        <FieldLabel htmlFor="handle">Handle</FieldLabel>
        <Input id="handle" defaultValue="a" aria-invalid="true" />
        <FieldError>Use 3 to 20 letters or numbers.</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="bio">Bio</FieldLabel>
        <Textarea id="bio" placeholder="Tell people about your work" />
      </Field>
    </FieldGroup>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="label-above"
        doExample={<Field className="w-64"><FieldLabel htmlFor="dd-user">Username</FieldLabel><Input id="dd-user" /></Field>}
        dontExample={<div className="w-64"><Input aria-label="Username" placeholder="Username" /></div>}
      />
    </div>
  ),
}
