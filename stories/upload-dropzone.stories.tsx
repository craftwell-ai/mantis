import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { UploadDropzone, type UploadDropzoneProps } from '@/registry/upload-dropzone'
import { usage } from '../usage/upload-dropzone.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'

const MB = 1024 * 1024

// Stand-in files for the stories. The picture is drawn on the spot in one of the chart colors, so the
// row has a real thumbnail without shipping an image file; the padding makes the size read believably.
function samplePicture(name: string, token: string, megabytes: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 80
  canvas.height = 80
  const context = canvas.getContext('2d')
  if (context) {
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(token)
    context.fillRect(0, 0, 80, 80)
  }
  const bytes = Uint8Array.from(atob(canvas.toDataURL('image/png').split(',')[1]), (character) => character.charCodeAt(0))
  return new File([bytes, new Uint8Array(megabytes * MB)], name, { type: 'image/png', lastModified: 0 })
}

const sampleClip = (name: string, megabytes: number) => new File([new Uint8Array(megabytes * MB)], name, { type: 'video/mp4', lastModified: 0 })

// The sample files need the browser, so they are made when the story first renders, not at import.
function WithSamples({ make, ...props }: UploadDropzoneProps & { make: () => File[] }) {
  const [files] = React.useState(make)
  return <UploadDropzone {...props} defaultFiles={files} />
}

const meta = {
  title: 'Blocks / Upload Dropzone',
  component: UploadDropzone,
  args: {
    title: 'Drop reference images here',
    hint: 'PNG, JPG or WebP, up to 20 MB each',
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] },
    maxSize: 20 * MB,
    label: 'Upload reference images',
  },
  decorators: [(Story) => <div className="w-full max-w-120"><Story /></div>],
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof UploadDropzone>

export default meta
type Story = StoryObj<typeof meta>

// Adding a file lists it; its Remove button takes it out again.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Browse files' })).toBeVisible()
    await userEvent.upload(canvas.getByLabelText('Upload reference images'), new File(['pixels'], 'greenhouse-sketch.png', { type: 'image/png' }))
    const list = await canvas.findByRole('list', { name: 'Added files' })
    await expect(within(list).getByText('greenhouse-sketch.png')).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Remove greenhouse-sketch.png' }))
    await expect(canvas.queryByRole('list', { name: 'Added files' })).not.toBeInTheDocument()
  },
}

export const Uploading: Story = {
  name: 'While uploading',
  render: (args) => (
    <WithSamples
      {...args}
      make={() => [samplePicture('greenhouse-dusk.png', '--chart-1', 3), samplePicture('fog-reference.png', '--chart-2', 8), samplePicture('glass-detail.png', '--chart-3', 12)]}
      progress={{ 'greenhouse-dusk.png': 100, 'fog-reference.png': 64 }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole('progressbar', { name: 'Uploading fog-reference.png' })).toBeInTheDocument()
    await expect(canvas.getByText(/Uploaded/)).toBeVisible()
  },
}

// A file over the limit is left out and named, with both sizes, so people know what to change.
export const TurnedAway: Story = {
  name: 'A file turned away',
  args: { maxSize: 1024, hint: 'PNG, JPG or WebP, up to 1 KB each' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.upload(canvas.getByLabelText('Upload reference images'), [
      new File([new Uint8Array(300)], 'thumbnail.png', { type: 'image/png' }),
      new File([new Uint8Array(4096)], 'full-resolution.png', { type: 'image/png' }),
    ])
    await expect(await canvas.findByRole('alert')).toHaveTextContent('“full-resolution.png” is 4 KB. The limit is 1 KB.')
    await expect(canvas.getByText('thumbnail.png')).toBeVisible()
  },
}

export const Full: Story = {
  name: 'At the limit',
  args: { maxFiles: 2, hint: 'Up to 2 images, 20 MB each' },
  render: (args) => <WithSamples {...args} make={() => [samplePicture('greenhouse-dusk.png', '--chart-1', 3), samplePicture('fog-reference.png', '--chart-2', 8)]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('All 2 files added')).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Browse files' })).not.toBeInTheDocument()
  },
}

export const OneFile: Story = {
  name: 'One file, any type',
  args: { multiple: false, accept: undefined, maxSize: 500 * MB, title: 'Drop your source clip here', hint: 'One video, up to 500 MB', label: 'Upload a source clip' },
  render: (args) => <WithSamples {...args} make={() => [sampleClip('walkthrough-take-3.mp4', 86)]} />,
}
