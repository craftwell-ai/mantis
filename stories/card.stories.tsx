import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { usage } from '../usage/card.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Components / Card',
  component: Card,
  parameters: { docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

function CreditsCard() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Creator plan</CardTitle>
        <CardDescription>1,240 credits left · refills October 1</CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        <p>Enough for roughly 300 images or 25 short clips on your current presets. Unused credits roll over once.</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Top up credits</Button>
      </CardFooter>
    </Card>
  )
}

export const Default: Story = { render: () => <CreditsCard /> }

export const WithImage: Story = {
  render: () => (
    <Card className="w-full max-w-sm overflow-hidden pt-0">
      <img src="https://picsum.photos/seed/night-market-teaser/640/360" alt="Placeholder still standing in for a generated night-market street scene" className="w-full" />
      <CardHeader>
        <CardTitle>Night Market Teaser</CardTitle>
        <CardDescription>Video · 16:9 · generated 12 minutes ago</CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        <p>Eight seconds on the Neon Drift preset, upscaled to 4K and ready to publish.</p>
      </CardContent>
      <CardFooter>
        <a href="#night-market-teaser" className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
          Open in project
        </a>
      </CardFooter>
    </Card>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Paper Lantern Shorts</CardTitle>
        <CardDescription>Updated 2 hours ago by Priya Raman</CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        <p>18 generations, 4 of them still in the render queue.</p>
      </CardContent>
      <CardFooter className="justify-end gap-2 border-t">
        <Button variant="outline">Archive</Button>
        <Button>Open project</Button>
      </CardFooter>
    </Card>
  ),
}

export const Dark: Story = {
  globals: { theme: 'dark' },
  render: () => <CreditsCard />,
}

export const DoDont: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="no-nested-cards"
        doExample={
          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y text-sm">
                <li className="pb-3">Maya published Glass Harbor to the community feed.</li>
                <li className="py-3">Leo upscaled three stills to 4K.</li>
                <li className="pt-3">Priya saved Neon Drift as a team preset.</li>
              </ul>
            </CardContent>
          </Card>
        }
        dontExample={
          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Card className="py-4">
                <CardContent className="px-4 text-sm">Maya published Glass Harbor to the community feed.</CardContent>
              </Card>
              <Card className="py-4">
                <CardContent className="px-4 text-sm">Leo upscaled three stills to 4K.</CardContent>
              </Card>
              <Card className="py-4">
                <CardContent className="px-4 text-sm">Priya saved Neon Drift as a team preset.</CardContent>
              </Card>
            </CardContent>
          </Card>
        }
      />
      <DoDontPair
        usage={usage}
        id="actions-in-footer"
        doExample={
          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Glass Harbor</CardTitle>
              <CardDescription>Image · 3:2 · 4 credits</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">Neon Drift preset, saved to Night Market Teaser</CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline">Download</Button>
              <Button>Publish</Button>
            </CardFooter>
          </Card>
        }
        dontExample={
          <Card className="gap-4">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>Glass Harbor</CardTitle>
                <Button size="sm">Publish</Button>
                <Button size="sm">Download</Button>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </div>
              <CardDescription>Image · 3:2 · 4 credits</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">Neon Drift preset, saved to Night Market Teaser</CardContent>
          </Card>
        }
      />
    </div>
  ),
}

// The measured surfaces, side by side.
export const Variants: StoryObj = {
  render: () => (
    <div className="grid w-160 grid-cols-2 gap-4">
      {(['default', 'glass', 'outlined', 'media'] as const).map((variant) => (
        <Card key={variant} variant={variant}>
          {variant === 'media' ? (
            <img src={`https://picsum.photos/seed/card-${variant}/320/180`} alt="Placeholder still from a generated clip" className="aspect-video w-full object-cover" />
          ) : null}
          <CardHeader>
            <CardTitle className="capitalize">{variant}</CardTitle>
            <CardDescription>Paper Lantern Shorts · 8 clips</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  ),
}
