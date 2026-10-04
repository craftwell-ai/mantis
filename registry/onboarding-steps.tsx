"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Heading } from "@/components/ui/heading"
import { Icon, type IconName } from "@/components/ui/icon"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { RadioGroup, RadioGroupCard } from "@/components/ui/radio-group"

export type OnboardingOption = {
  value: string
  label: string
  /** One line under the label. Single-choice cards show it; grid rows do not. */
  description?: string
  icon?: IconName
}

export type OnboardingStep = {
  id: string
  title: string
  description?: string
  /** `single`: a few large cards, pick one. `multi`: a grid of compact rows, pick any. */
  kind: "single" | "multi"
  options: OnboardingOption[]
  /** Let people continue with nothing picked on a multi step. */
  optional?: boolean
}

export type OnboardingAnswers = Record<string, string | string[]>

export interface OnboardingStepsProps {
  steps: OnboardingStep[]
  defaultAnswers?: OnboardingAnswers
  /** Called with every answer after the last step. */
  onComplete?: (answers: OnboardingAnswers) => void
  /** Label of the last step's button. */
  finishLabel?: string
  className?: string
}

function OnboardingSteps({
  steps,
  defaultAnswers = {},
  onComplete,
  finishLabel = "Finish setup",
  className,
}: OnboardingStepsProps) {
  const [index, setIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState<OnboardingAnswers>(defaultAnswers)
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const firstRender = React.useRef(true)
  const headingId = React.useId()

  const step = steps[index]
  const isLast = index === steps.length - 1
  const answer = answers[step.id]
  const picked = step.kind === "single" ? Boolean(answer) : Array.isArray(answer) && answer.length > 0
  const canContinue = picked || (step.kind === "multi" && step.optional)

  // Move focus to the new question so keyboard and screen-reader users start at the top of it.
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [index])

  function toggle(value: string, checked: boolean) {
    const current = Array.isArray(answer) ? answer : []
    setAnswers({
      ...answers,
      [step.id]: checked ? [...current, value] : current.filter((item) => item !== value),
    })
  }

  function next() {
    if (!canContinue) return
    if (isLast) onComplete?.(answers)
    else setIndex(index + 1)
  }

  return (
    <section data-slot="onboarding-steps" className={cn("flex w-full flex-col gap-10", className)}>
      <div className="flex flex-col gap-3">
        <Progress value={((index + 1) / steps.length) * 100}>
          <ProgressLabel className="sr-only">Setup progress</ProgressLabel>
        </Progress>
        <div className="flex h-8 items-center justify-between">
          {index > 0 ? (
            <Button variant="ghost" size="sm" className="-ml-2" onClick={() => setIndex(index - 1)}>
              <Icon name="chevron_left" />
              Back
            </Button>
          ) : (
            <span />
          )}
          <p className="text-xs text-muted-foreground tabular-nums">
            Step {index + 1} of {steps.length}
          </p>
        </div>
      </div>

      <div className={cn("mx-auto flex w-full flex-col gap-8", step.kind === "single" ? "max-w-2xl items-center text-center" : "max-w-3xl")}>
        <div className="flex flex-col gap-2">
          <Heading ref={headingRef} id={headingId} tabIndex={-1} level="title" className="outline-none">
            {step.title}
          </Heading>
          {step.description ? <p className="text-sm text-muted-foreground">{step.description}</p> : null}
        </div>

        {step.kind === "single" ? (
          <RadioGroup
            key={step.id}
            aria-labelledby={headingId}
            value={typeof answer === "string" ? answer : ""}
            onValueChange={(value) => setAnswers({ ...answers, [step.id]: value as string })}
            className="grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {step.options.map((option) => (
              <RadioGroupCard
                key={option.value}
                value={option.value}
                className="min-h-40 items-center justify-center gap-2 px-6 py-8 text-center"
              >
                {option.icon ? <Icon name={option.icon} className="mb-2 size-7" /> : null}
                <span className="text-base font-medium">{option.label}</span>
                {option.description ? (
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                ) : null}
              </RadioGroupCard>
            ))}
          </RadioGroup>
        ) : (
          <fieldset key={step.id} aria-labelledby={headingId} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {step.options.map((option) => {
              const checked = Array.isArray(answer) && answer.includes(option.value)
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex h-12 cursor-pointer items-center gap-3 rounded-xl border-2 bg-card px-4 text-sm transition-[border-color,filter] duration-(--duration-normal) hover:brightness-110 has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                    checked ? "border-brand" : "border-transparent"
                  )}
                >
                  {option.icon ? <Icon name={option.icon} className="size-4.5 text-muted-foreground" /> : null}
                  <span className="flex-1">{option.label}</span>
                  <Checkbox
                    size="sm"
                    checked={checked}
                    onCheckedChange={(value) => toggle(option.value, value)}
                  />
                </label>
              )
            })}
          </fieldset>
        )}

        <Button size="lg" className={cn("w-full sm:w-60", step.kind === "multi" && "self-end")} disabled={!canContinue} focusableWhenDisabled onClick={next}>
          {isLast ? finishLabel : "Continue"}
          {isLast ? null : <Icon name="arrow_forward" />}
        </Button>
      </div>
    </section>
  )
}

export { OnboardingSteps }
