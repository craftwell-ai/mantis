import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Heading, HeadingAccent } from '@/components/ui/heading'
import { usage } from '../usage/heading.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Heading',
  component: Heading,
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Heading>

export default meta
type Story = StoryObj<typeof meta>

export const Hero: Story = {
  render: () => (
    <Heading level="hero">
      Shoot the scene <HeadingAccent>you imagine</HeadingAccent>
    </Heading>
  ),
}

export const Levels: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Heading level="section">Studio presets</Heading>
      <Heading level="sub">Camera moves</Heading>
      <Heading level="label">Trending this week</Heading>
      <Heading level="title">Rename project</Heading>
      <Heading level="title-sm">Clip settings</Heading>
    </div>
  ),
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="one-lime-word"
        doExample={<Heading level="sub" render={<p />}>Make it <HeadingAccent>move</HeadingAccent></Heading>}
        dontExample={<Heading level="sub" render={<p />}><HeadingAccent>Make</HeadingAccent> it <HeadingAccent>move</HeadingAccent> today</Heading>}
      />
      <DoDontPair
        usage={usage}
        id="display-for-pages-titles-for-panels"
        doExample={<div className="w-72 rounded-2xl border border-separator bg-dialog p-6"><Heading level="title-sm" render={<p />}>Delete this generation?</Heading></div>}
        dontExample={<div className="w-72 rounded-2xl border border-separator bg-dialog p-6"><Heading level="section" render={<p />}>Delete this generation?</Heading></div>}
      />
    </div>
  ),
}
