export function HelloCard() {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <h3 className="text-lg font-semibold">Hello from the design system</h3>
      {/* Says only what is true in a CONSUMER, which is where this card is looked at:
          the registry:base theme ships the color variables AND `--radius` (its `lg`
          step, at html:root, which outranks the consumer's own retained `--radius`),
          so `rounded-lg` is the design system's too. `shadow-sm` is Tailwind's default. */}
      <p className="text-sm text-muted-foreground">
        Card fill, border, corner radius and this muted text all come from the design
        system&apos;s tokens. The shadow is the app&apos;s own.
      </p>
    </div>
  )
}
