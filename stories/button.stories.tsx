import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { usage } from '../usage/button.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Button',
  component: Button,
  args: { children: 'Save changes' },
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Outline: Story = { args: { variant: 'outline', children: 'Cancel' } }

export const Secondary: Story = { args: { variant: 'secondary', children: 'Save as draft' } }

export const Ghost: Story = { args: { variant: 'ghost', children: 'Skip for now' } }

export const Destructive: Story = { args: { variant: 'destructive', children: 'Delete generation' } }

export const Link: Story = { args: { variant: 'link', children: 'View credit history' } }

// The generate action: lime, with the credit cost beside the label.
function CreditCost({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 font-medium">
      <Icon name="star_shine-fill" className="size-3.5" />
      {value}
    </span>
  )
}

export const Brand: Story = {
  render: (args) => (
    <Button {...args} variant="brand">
      Generate
      <CreditCost value={32} />
    </Button>
  ),
}

export const BrandGlossy: Story = {
  name: 'Brand · glossy (generate)',
  render: (args) => (
    <Button {...args} variant="brand" depth="glossy" size="xl" className="min-w-40">
      Generate
      <CreditCost value={18} />
    </Button>
  ),
}

export const BrandTint: Story = { args: { variant: 'brand-tint', children: 'Try the new studio' } }

export const Glass: Story = { args: { variant: 'glass', children: 'Assets' } }

export const Soft: Story = { args: { variant: 'soft', children: 'All presets' } }

export const CommerceBlue: Story = {
  args: { variant: 'commerce-blue', depth: 'raised', size: 'cta', children: 'Explore team plans', className: 'w-64' },
}

export const RaisedCallsToAction: Story = {
  name: 'Raised calls to action',
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      <Button depth="raised" size="cta">Save and continue</Button>
      <Button variant="brand" depth="raised" size="cta">Choose this plan</Button>
      <Button variant="commerce-pink" depth="raised" size="cta">See the sale</Button>
      <Button variant="commerce-blue" depth="raised" size="cta">Explore team plans</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="2xs" variant="glass">Edit</Button>
      <Button size="xs" variant="brand">Upgrade</Button>
      <Button size="sm" variant="soft">All presets</Button>
      <Button size="default" variant="glass">Assets</Button>
      <Button size="lg" variant="secondary">Save settings</Button>
      <Button size="xl">Continue</Button>
      <Button size="cta" depth="raised">Save and continue</Button>
      <Button size="2xl" variant="brand">Start creating</Button>
      <Button size="3xl" variant="brand" depth="glossy">Generate</Button>
      <Button size="icon-xs" variant="glass" aria-label="Close banner"><Icon name="close" /></Button>
      <Button size="icon-sm" variant="glass" aria-label="Add media"><Icon name="add" /></Button>
      <Button size="icon" variant="glass" aria-label="Search"><Icon name="search" /></Button>
      <Button size="icon-lg" variant="secondary" aria-label="More actions"><Icon name="more_vert" /></Button>
    </div>
  ),
}

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <Icon name="add" />
      New project
    </Button>
  ),
}

export const IconOnly: Story = {
  render: (args) => (
    <Button {...args} variant="outline" size="icon" aria-label="Close preview">
      <Icon name="close" />
    </Button>
  ),
}

export const Dark: Story = {
  globals: { theme: 'dark' },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} />
      <Button variant="brand">Generate</Button>
      <Button variant="brand-tint">Try the new studio</Button>
      <Button variant="glass">Assets</Button>
      <Button variant="soft">All presets</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="secondary">Save as draft</Button>
      <Button variant="ghost">Skip for now</Button>
      <Button variant="destructive">Delete generation</Button>
      <Button variant="link">View credit history</Button>
    </div>
  ),
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="lime-marks-the-main-action"
        doExample={
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="glass">Save preset</Button>
              <Button variant="brand">
                Generate
                <CreditCost value={12} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost">Compare plans</Button>
              <Button variant="brand" depth="raised">Get Creator</Button>
            </div>
          </div>
        }
        dontExample={
          <div className="flex flex-wrap gap-2">
            <Button variant="brand">Save preset</Button>
            <Button variant="brand">Continue</Button>
          </div>
        }
      />
      <DoDontPair
        usage={usage}
        id="one-primary-action"
        doExample={
          <div className="flex flex-wrap gap-2">
            <Button>Save preset</Button>
            <Button variant="outline">Duplicate</Button>
            <Button variant="ghost">Discard changes</Button>
          </div>
        }
        dontExample={
          <div className="flex flex-wrap gap-2">
            <Button>Save preset</Button>
            <Button>Duplicate</Button>
            <Button variant="brand">Upload media</Button>
            <Button variant="brand">Get Creator</Button>
          </div>
        }
      />
      <DoDontPair
        usage={usage}
        id="label-with-a-verb"
        doExample={
          <div className="flex flex-col gap-3">
            <p className="text-sm">Publish Night Market Teaser to the community feed?</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">Keep editing</Button>
              <Button>Publish to community</Button>
            </div>
          </div>
        }
        dontExample={
          <div className="flex flex-col gap-3">
            <p className="text-sm">Publish Night Market Teaser to the community feed?</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">No</Button>
              <Button>OK</Button>
            </div>
          </div>
        }
      />
    </div>
  ),
}
