import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Icon } from '@/components/ui/icon'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { usage } from '../usage/input-group.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Input Group',
  component: InputGroup,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

function ShareLink({ extra }: { extra?: boolean }) {
  return (
    <InputGroup className="w-80">
      <InputGroupInput readOnly defaultValue="https://example.com/p/night-market" aria-label="Project link" />
      <InputGroupAddon align="inline-end">
        {extra ? <InputGroupButton aria-label="Open link"><Icon name="arrow_forward" /></InputGroupButton> : null}
        {extra ? <InputGroupButton aria-label="Remove link"><Icon name="close" /></InputGroupButton> : null}
        <InputGroupButton variant="brand" size="xs">Copy link</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export const Search: Story = {
  render: () => (
    <InputGroup className="w-72">
      <InputGroupAddon><Icon name="search" /></InputGroupAddon>
      <InputGroupInput placeholder="Search generations" aria-label="Search generations" />
    </InputGroup>
  ),
}

export const WithAction: Story = { name: 'With an action', render: () => <ShareLink /> }

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair usage={usage} id="one-inline-action" doExample={<ShareLink />} dontExample={<ShareLink extra />} />
    </div>
  ),
}
