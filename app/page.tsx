import { HelloCard } from "@/registry/hello-card"

// The registry's own landing page: what `npm run dev` serves next to /r/*.json.
const installSteps = [
  { label: "Theme and core components", command: "npx shadcn@latest add @mantis/base" },
  { label: "Smoke-test block", command: "npx shadcn@latest add @mantis/hello-card" },
]

export default function Home() {
  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight uppercase">Mantis</h1>
        <p className="text-muted-foreground">
          A dark, cinematic design system for AI-native creative tools, packaged as a shadcn
          registry that people and coding agents install from.
        </p>
      </header>
      <main className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm text-muted-foreground">Install</h2>
          <ul className="flex flex-col gap-2">
            {installSteps.map((step) => (
              <li key={step.command} className="flex flex-col gap-1 rounded-lg border bg-card p-4">
                <span className="text-sm text-muted-foreground">{step.label}</span>
                <code className="font-mono text-sm">{step.command}</code>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="text-sm text-muted-foreground">Preview</h2>
          <HelloCard />
        </section>
        <p className="text-sm text-muted-foreground">
          Browse every component in <a className="underline" href="/storybook/">Storybook</a>, or
          point an agent at <a className="underline" href="/llms.txt">llms.txt</a>.
        </p>
      </main>
    </div>
  )
}
