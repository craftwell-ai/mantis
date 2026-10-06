import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { WorkflowCanvas, type WorkflowConnection, type WorkflowStep, type WorkflowStepType } from '@/registry/workflow-canvas'
import { usage } from '../usage/workflow-canvas.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'

// Invented step types for the stories only; a product passes its own list.
const STEP_TYPES: WorkflowStepType[] = [
  { type: 'prompt', label: 'Prompt', icon: 'text_fields', color: 'blue', description: 'Describe what to make', acceptsInput: false },
  { type: 'reference', label: 'Reference', icon: 'image', color: 'pink', description: 'An image to stay close to', acceptsInput: false },
  { type: 'model', label: 'Model', icon: 'movie', color: 'purple', description: 'Turns the inputs into a clip', credits: 8 },
  { type: 'upscale', label: 'Upscale', icon: 'hd', color: 'mint', description: 'Sharpens the result to 4K', credits: 4 },
]

const STEPS: WorkflowStep[] = [
  { id: 'prompt-1', type: 'prompt', detail: 'Glass greenhouse at dusk, fog rolling in', position: { x: 0, y: 0 } },
  { id: 'reference-1', type: 'reference', detail: 'greenhouse-mood.jpg', position: { x: 0, y: 170 } },
  { id: 'model-1', type: 'model', chips: ['Lumen 3', '16:9', '5s'], position: { x: 320, y: 70 } },
  { id: 'upscale-1', type: 'upscale', chips: ['×4', '4K'], position: { x: 640, y: 80 } },
]

const CONNECTIONS: WorkflowConnection[] = [
  { id: 'prompt-1>model-1', from: 'prompt-1', to: 'model-1' },
  { id: 'reference-1>model-1', from: 'reference-1', to: 'model-1' },
  { id: 'model-1>upscale-1', from: 'model-1', to: 'upscale-1' },
]

const meta = {
  title: 'Blocks / Workflow Canvas',
  component: WorkflowCanvas,
  args: { stepTypes: STEP_TYPES, defaultSteps: STEPS, defaultConnections: CONNECTIONS, onChange: fn(), onRun: fn() },
  decorators: [(Story) => <div className="h-140 w-full"><Story /></div>],
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
} satisfies Meta<typeof WorkflowCanvas>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Model (8) plus Upscale (4): the one lime button carries the total.
    await expect(await canvas.findByRole('button', { name: 'Run 12 credits' })).toBeEnabled()
    // React Flow draws the cards after it has measured the board, so wait for them.
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-slot="workflow-step"]')).toHaveLength(4))
    await waitFor(() => expect(canvasElement.querySelectorAll('.react-flow__edge')).toHaveLength(3))
  },
}

export const Empty: Story = {
  args: { defaultSteps: [], defaultConnections: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('No steps yet')).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Run' })).toBeDisabled()
  },
}

// Adding a step puts a new card on the board, updates the cost and reports the change.
export const AddAStep: Story = {
  name: 'Adding a step',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const page = within(canvasElement.ownerDocument.body)
    await userEvent.click(await canvas.findByRole('button', { name: 'Add step' }))
    await userEvent.click(await page.findByRole('menuitem', { name: /Upscale/ }))
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-slot="workflow-step"]')).toHaveLength(5))
    // Let the menu finish closing before the accessibility check runs on the settled page.
    await waitFor(() => expect(page.queryByRole('menu')).not.toBeInTheDocument())
    await expect(canvas.getByRole('button', { name: 'Run 16 credits' })).toBeInTheDocument()
    await waitFor(() => expect(args.onChange).toHaveBeenCalled())
  },
}

// Selecting a step turns its wires lime; Remove takes the step and its wires off the board.
export const RemoveAStep: Story = {
  name: 'Removing a step',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const remove = await canvas.findByRole('button', { name: 'Remove the selected steps and wires' })
    await expect(remove).toBeDisabled()
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-slot="workflow-step"]')).toHaveLength(4))
    const upscale = [...canvasElement.querySelectorAll<HTMLElement>('[data-slot="workflow-step"]')].find((card) => card.textContent?.includes('Upscale'))
    await userEvent.click(upscale!)
    await waitFor(() => expect(remove).toBeEnabled())
    await userEvent.click(remove)
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-slot="workflow-step"]')).toHaveLength(3))
    await waitFor(() => expect(canvasElement.querySelectorAll('.react-flow__edge')).toHaveLength(2))
    await expect(canvas.getByRole('button', { name: 'Run 8 credits' })).toBeInTheDocument()
  },
}

// Steps dropped in a pile: Tidy up lays them out left to right in the order they feed each other.
const SCATTERED: WorkflowStep[] = [
  { ...STEPS[0], position: { x: 420, y: 260 } },
  { ...STEPS[1], position: { x: 380, y: 20 } },
  { ...STEPS[2], position: { x: 60, y: 200 } },
  { ...STEPS[3], position: { x: 120, y: 40 } },
]

export const TidyUp: Story = {
  name: 'Tidying up',
  args: { defaultSteps: SCATTERED },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-slot="workflow-step"]')).toHaveLength(4))
    await userEvent.click(canvas.getByRole('button', { name: 'Tidy up' }))
    await waitFor(() => expect(args.onChange).toHaveBeenCalled())
    const calls = (args.onChange as ReturnType<typeof fn>).mock.calls
    const steps: WorkflowStep[] = calls[calls.length - 1][0].steps
    const x = (id: string) => steps.find((step) => step.id === id)!.position.x
    // Inputs on the left, then the model, then the upscale.
    await expect(x('prompt-1')).toBe(x('reference-1'))
    await expect(x('model-1')).toBeGreaterThan(x('prompt-1'))
    await expect(x('upscale-1')).toBeGreaterThan(x('model-1'))
  },
}

export const Running: Story = { args: { running: true } }

export const NotEnoughCredits: Story = {
  name: 'Not enough credits',
  args: { creditBalance: 6 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole('button', { name: 'Run 12 credits' })).toBeDisabled()
    await expect(canvas.getByRole('status')).toHaveTextContent('This run needs 12 credits and you have 6.')
  },
}

export const RunsTheWorkflow: Story = {
  name: 'Run reports the workflow',
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Run 12 credits' }))
    const [workflow] = (args.onRun as ReturnType<typeof fn>).mock.calls[0]
    await expect(workflow.credits).toBe(12)
    await expect(workflow.steps).toHaveLength(4)
    await expect(workflow.connections).toHaveLength(3)
  },
}
