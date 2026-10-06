import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { EventMap, type MapEvent, type MapEventCategory } from '@/registry/event-map'
import { usage } from '../usage/event-map.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'

// Invented event types and events for the stories only; a product passes its own.
const CATEGORIES: MapEventCategory[] = [
  { value: 'incident', label: 'Incident', icon: 'warning', color: 'orange' },
  { value: 'checkpoint', label: 'Checkpoint', icon: 'location_on', color: 'blue' },
  { value: 'gathering', label: 'Gathering', icon: 'groups', color: 'purple' },
]

// A circle outline around a point, so the sample events have real shapes to draw.
const ring = ([lng, lat]: [number, number], radiusMeters: number): [number, number][] =>
  Array.from({ length: 33 }, (_, step) => {
    const angle = (step / 32) * Math.PI * 2
    return [lng + (radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180))) * Math.cos(angle), lat + (radiusMeters / 110540) * Math.sin(angle)]
  })

const LISBON: [number, number] = [-9.1393, 38.7223]

const EVENTS: MapEvent[] = [
  { id: 'event-1', title: 'Tram line 28 suspended', category: 'incident', notes: 'Track works until Friday. Buses replace the tram between Graça and Estrela.', location: { kind: 'pin', center: [-9.1334, 38.7139] } },
  { id: 'event-2', title: 'Street market', category: 'gathering', location: { kind: 'circle', center: [-9.1456, 38.7262], radiusMeters: 320, outline: ring([-9.1456, 38.7262], 320) } },
  {
    id: 'event-3',
    title: 'Riverside checkpoint',
    category: 'checkpoint',
    location: { kind: 'area', center: [-9.1378, 38.7075], outline: [[-9.1432, 38.7092], [-9.1325, 38.7092], [-9.1325, 38.7058], [-9.1432, 38.7058], [-9.1432, 38.7092]] },
  },
]

const meta = {
  title: 'Blocks / Event Map',
  component: EventMap,
  args: { categories: CATEGORIES, defaultEvents: EVENTS, center: LISBON, zoom: 13, onEventsChange: fn(), onCreate: fn() },
  decorators: [(Story) => <div className="h-160 w-full"><Story /></div>],
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof EventMap>

export default meta
type Story = StoryObj<typeof meta>

// The live street map. It needs the network, so this story only checks what does not depend on it.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { name: /Events/ })).toBeVisible()
    await expect(canvas.getByRole('button', { name: /Tram line 28 suspended/ })).toBeVisible()
  },
}

// The stories below use the blank map so they run the same with or without a connection.
export const Empty: Story = {
  args: { mapStyle: 'blank', defaultEvents: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/No events yet/)).toBeVisible()
  },
}

export const ChoosingATool: Story = {
  name: 'Choosing a tool',
  args: { mapStyle: 'blank' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const circle = canvas.getByRole('button', { name: 'Circle' })
    await waitFor(() => expect(circle).toBeEnabled())
    await userEvent.click(circle)
    await expect(await canvas.findByRole('status')).toHaveTextContent('Click the centre, then click again to set the size. Esc cancels.')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument())
  },
}

// A location handed in from elsewhere opens the form; saving adds the event and reports it.
export const SavingAnEvent: Story = {
  name: 'Saving an event',
  args: { mapStyle: 'blank', defaultLocation: { kind: 'circle', center: [-9.15, 38.73], radiusMeters: 450, outline: ring([-9.15, 38.73], 450) } },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/Circle · 450 m radius/)).toBeVisible()
    const save = canvas.getByRole('button', { name: 'Save event' })
    await expect(save).toBeDisabled()
    await userEvent.type(canvas.getByLabelText('Title'), 'Water point open')
    await userEvent.type(canvas.getByLabelText('Notes'), 'Open 8 to 18 until the supply is restored.')
    await userEvent.click(save)
    await expect(args.onCreate).toHaveBeenCalledTimes(1)
    const [created] = (args.onCreate as ReturnType<typeof fn>).mock.calls[0]
    await expect(created.title).toBe('Water point open')
    await expect(created.location.kind).toBe('circle')
    // The new event opens in the panel.
    await expect(await canvas.findByRole('heading', { name: 'Water point open' })).toBeVisible()
  },
}

export const OpeningAndRemoving: Story = {
  name: 'Opening and removing an event',
  args: { mapStyle: 'blank' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /Street market/ }))
    await expect(await canvas.findByText('Circle · 320 m radius', { exact: false })).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Remove' }))
    await expect(canvas.queryByRole('button', { name: /Street market/ })).not.toBeInTheDocument()
    await expect(args.onEventsChange).toHaveBeenCalled()
  },
}
