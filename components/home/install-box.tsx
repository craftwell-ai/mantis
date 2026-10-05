"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

/** The install command with a Copy button that confirms for a moment after copying. */
function InstallBox({ command, id }: { command: string; id?: string }) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(command)
    } catch {
      // Clipboard access can be refused; the command is still selectable on screen.
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div
      id={id}
      className="flex max-w-full scroll-mt-24 items-center gap-3 rounded-xl border border-border bg-card/85 py-1.5 pr-1.5 pl-4"
    >
      <span aria-hidden="true" className="font-mono text-sm text-muted-foreground">
        $
      </span>
      <code className="overflow-x-auto font-mono text-sm whitespace-nowrap text-foreground">{command}</code>
      <Button variant="secondary" size="sm" onClick={copy}>
        <Icon name={copied ? "check" : "content_copy"} />
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </Button>
    </div>
  )
}

export { InstallBox }
