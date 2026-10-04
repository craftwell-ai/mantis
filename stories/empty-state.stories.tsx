import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Icon } from '@/components/ui/icon'
import { EmptyState } from '@/registry/empty-state'
import { usage } from '../usage/empty-state.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const meta = {
  title: 'Blocks / Empty State',
  component: EmptyState,
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
  args: {
    icon: 'image',
    title: 'Your asset library is empty',
    description: 'Upload reference images, logos and textures once, then pull them into any project without hunting for the file again.',
    hint: 'PNG, JPG or WebP, up to 20 MB each',
    action: (
      <Button variant="brand" size="lg">
        <Icon name="upload" />
        Upload image
      </Button>
    ),
  },
  decorators: [(Story) => <div className="mx-auto max-w-3xl">{Story()}</div>],
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// How a real asset library wires it: the file input stays hidden and the one
// labelled Button opens it, so keyboard users meet a single named control.
function AssetLibraryPage() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [picked, setPicked] = useState<string[]>([])
  return (
    <div className="flex flex-col gap-6">
      <Heading level="title" render={<h1 />}>
        Asset library
      </Heading>
      <EmptyState
        className="min-h-96"
        title="Your asset library is empty"
        description="Upload reference images, logos and textures once, then pull them into any project without hunting for the file again."
        hint="PNG, JPG or WebP, up to 20 MB each"
        action={
          <>
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              hidden
              onChange={(event) => setPicked(Array.from(event.target.files ?? [], (file) => file.name))}
            />
            <Button variant="brand" size="lg" onClick={() => fileInput.current?.click()}>
              <Icon name="upload" />
              Upload image
            </Button>
          </>
        }
      />
      <p role="status" className="text-sm text-muted-foreground">
        {picked.length ? `Ready to upload: ${picked.join(', ')}` : ''}
      </p>
    </div>
  )
}

export const AssetLibrary: Story = {
  name: 'Asset library page',
  render: () => <AssetLibraryPage />,
}

export const NoSearchResults: Story = {
  name: 'No search results',
  args: {
    icon: 'search',
    title: 'No assets match "sunset"',
    description: 'Check the spelling or clear the search to see everything in your library again.',
    hint: undefined,
    action: <Button variant="outline">Clear search</Button>,
  },
}

export const LongCopy: Story = {
  name: 'Long copy, narrow column',
  decorators: [(Story) => <div className="max-w-xs">{Story()}</div>],
  args: {
    title: 'Nothing in your brand kit folder yet, so new projects start from a blank canvas',
    description: 'Add the logos, product shots and color references your team uses most, and everyone on the workspace can drop them into a project in one click.',
  },
}

export const DoDont: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="say-what-goes-here"
        doExample={
          <EmptyState
            headingTag="h3"
            title="Your asset library is empty"
            description="Upload reference images, logos and textures to reuse them in any project."
            action={<Button variant="brand">Upload image</Button>}
          />
        }
        dontExample={<EmptyState headingTag="h3" title="No items" description="Nothing here." action={<Button variant="brand">Upload</Button>} />}
      />
      <DoDontPair
        usage={usage}
        id="one-way-forward"
        doExample={
          <EmptyState
            headingTag="h3"
            title="Your asset library is empty"
            description="Upload reference images, logos and textures to reuse them in any project."
            action={<Button variant="brand">Upload image</Button>}
          />
        }
        dontExample={
          <EmptyState
            headingTag="h3"
            title="Your asset library is empty"
            description="Upload reference images, logos and textures to reuse them in any project."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="brand">Upload image</Button>
                <Button variant="secondary">Import</Button>
                <Button variant="outline">Browse</Button>
                <Button variant="ghost">Learn more</Button>
              </div>
            }
          />
        }
      />
      <DoDontPair
        usage={usage}
        id="lime-when-it-starts-creating"
        doExample={
          <EmptyState
            headingTag="h3"
            title="Your asset library is empty"
            description="Upload reference images, logos and textures to reuse them in any project."
            action={<Button variant="brand">Upload image</Button>}
          />
        }
        dontExample={
          <EmptyState
            headingTag="h3"
            icon="search"
            title='No assets match "neon"'
            description="Try a shorter word, or clear the search to see the whole library."
            action={<Button variant="brand">Clear search</Button>}
          />
        }
      />
    </div>
  ),
}
