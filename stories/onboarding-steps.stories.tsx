import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupCard } from '@/components/ui/radio-group'
import { OnboardingSteps, type OnboardingStep } from '@/registry/onboarding-steps'
import { usage } from '../usage/onboarding-steps.usage.mjs'
import { renderUsageDocs } from '../usage/render.mjs'
import { DoDontPair } from './DoDont'

const steps: OnboardingStep[] = [
  {
    id: 'mode',
    title: 'Who will be creating?',
    description: 'We set up your space differently for a solo creator and for a team.',
    kind: 'single',
    options: [
      { value: 'solo', label: 'Just me', description: 'A personal library and your own credit balance.', icon: 'person' },
      { value: 'team', label: 'My team', description: 'Shared projects, brand kits and one pooled balance.', icon: 'groups' },
    ],
  },
  {
    id: 'interests',
    title: 'What do you want to make first?',
    description: 'Pick as many as you like. We will put these tools on your home screen.',
    kind: 'multi',
    options: [
      { value: 'portraits', label: 'Portraits and characters', icon: 'person' },
      { value: 'product', label: 'Product shots', icon: 'storefront' },
      { value: 'ads', label: 'Short video ads', icon: 'campaign' },
      { value: 'music', label: 'Music visuals', icon: 'music_note' },
      { value: 'film', label: 'Film storyboards', icon: 'movie' },
      { value: 'illustration', label: 'Illustration', icon: 'brush' },
      { value: 'photo', label: 'Photo restyling', icon: 'photo_camera' },
      { value: 'lessons', label: 'Teaching material', icon: 'school' },
    ],
  },
  {
    id: 'experience',
    title: 'How familiar are you with AI tools?',
    kind: 'single',
    options: [
      { value: 'new', label: 'New to this', description: 'Show me tips as I go.', icon: 'school' },
      { value: 'regular', label: 'I use them often', description: 'Skip the tips and keep it fast.', icon: 'bolt' },
    ],
  },
]

const meta = {
  title: 'Blocks / Onboarding Steps',
  component: OnboardingSteps,
  parameters: { layout: 'padded', docs: { description: { component: renderUsageDocs(usage) } } },
  args: { steps, onComplete: fn() },
} satisfies Meta<typeof OnboardingSteps>

export default meta
type Story = StoryObj<typeof meta>

export const ChoiceCards: Story = {
  name: 'Step 1: choice cards',
  args: { defaultAnswers: { mode: 'solo' } },
}

export const MultiSelectGrid: Story = {
  name: 'Step 2: multi-select grid',
  args: { defaultAnswers: { mode: 'solo', interests: ['ads', 'product'] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
    await expect(canvas.getByRole('heading', { name: 'What do you want to make first?' })).toHaveFocus()
  },
}

export const Walkthrough: Story = {
  name: 'Full walkthrough',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Continue' })).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(canvas.getByRole('radio', { name: /My team/ }))
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Short video ads' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
    await userEvent.click(canvas.getByRole('radio', { name: /I use them often/ }))
    await userEvent.click(canvas.getByRole('button', { name: 'Finish setup' }))
    await expect(args.onComplete).toHaveBeenCalledWith({ mode: 'team', interests: ['ads'], experience: 'regular' })
  },
}

export const DoDont: Story = {
  render: () => (
    <div className="flex max-w-5xl flex-col gap-8">
      <DoDontPair
        usage={usage}
        id="cards-for-one-grid-for-many"
        doExample={
          <RadioGroup aria-label="Who will be creating" defaultValue="solo" className="grid-cols-2 gap-3">
            <RadioGroupCard value="solo" className="min-h-24 items-center justify-center">Just me</RadioGroupCard>
            <RadioGroupCard value="team" className="min-h-24 items-center justify-center">My team</RadioGroupCard>
          </RadioGroup>
        }
        dontExample={
          <div className="grid grid-cols-2 gap-2">
            {['Just me', 'My team'].map((label) => (
              <label key={label} className="flex h-12 items-center gap-3 rounded-xl bg-background px-4 text-sm">
                <span className="flex-1">{label}</span>
                <Checkbox size="sm" />
              </label>
            ))}
          </div>
        }
      />
      <DoDontPair
        usage={usage}
        id="continue-is-white"
        doExample={<Button size="lg" className="w-full">Continue</Button>}
        dontExample={<Button variant="brand" size="lg" className="w-full">Continue</Button>}
      />
    </div>
  ),
}
