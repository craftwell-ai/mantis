"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Kbd } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner"
import { Toggle } from "@/components/ui/toggle"

export type AgentApprovalStep = {
  id: string
  /** What the agent will do, in full: the prompt it will send, or the change it will make. */
  description: string
  /** Optional preview of the input or result, such as a reference image. */
  thumbnail?: { src: string; alt: string }
  /** Short facts shown as chips: the model, the aspect ratio, the folder it touches. */
  details?: string[]
  /** Credits this step costs, when it spends any. */
  credits?: number
}

export type AgentApprovalStatus = "pending" | "approving" | "approved" | "stopped"

export type AgentApprovalCardProps = Omit<React.ComponentProps<"section">, "children"> & {
  /** One line naming the request, such as "Generate 3 product shots". */
  title: string
  steps: AgentApprovalStep[]
  /**
   * `spend`: the steps use credits, so Approve is the lime generate button with the total cost.
   * `change`: the steps edit or delete data without spending, so Approve is the plain white button.
   */
  kind?: "spend" | "change"
  /** The person's remaining credits. When the total is higher, Approve is disabled and says why. */
  creditBalance?: number
  /** Controlled status. Leave unset and the card tracks it itself. */
  status?: AgentApprovalStatus
  /** Called with whether "Always allow" was on. Return a promise to show the approving state until it settles. */
  onApprove?: (options: { alwaysAllow: boolean }) => void | Promise<void>
  onStop?: () => void
  /** Lets people answer with an instruction instead of approving. Omit to hide the reply field. */
  onReply?: (message: string) => void
}

// Human in the loop: before an AI agent spends credits or changes data it shows
// exactly what it will do and what it costs, then waits for Approve, Stop, or
// Approve with "Always allow". Modeled on the reference's agent approval tray.
export function AgentApprovalCard({
  title,
  steps,
  kind = "spend",
  creditBalance,
  status: statusProp,
  onApprove,
  onStop,
  onReply,
  className,
  ...props
}: AgentApprovalCardProps) {
  const [statusState, setStatusState] = React.useState<AgentApprovalStatus>("pending")
  const status = statusProp ?? statusState
  const [alwaysAllow, setAlwaysAllow] = React.useState(false)
  const [reply, setReply] = React.useState("")
  const headingId = React.useId()
  const noticeId = React.useId()
  const listRef = React.useRef<HTMLOListElement>(null)
  const [scrollable, setScrollable] = React.useState(false)

  // A list that scrolls must be reachable from the keyboard, so it joins the
  // Tab order only while its steps overflow.
  React.useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => setScrollable(list.scrollHeight > list.clientHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [steps, status])

  const totalCredits = steps.reduce((sum, step) => sum + (step.credits ?? 0), 0)
  const notEnoughCredits = kind === "spend" && creditBalance !== undefined && totalCredits > creditBalance
  const setStatus = (next: AgentApprovalStatus) => statusProp === undefined && setStatusState(next)

  const approve = async () => {
    if (status !== "pending" || notEnoughCredits) return
    setStatus("approving")
    try {
      await onApprove?.({ alwaysAllow })
      setStatus("approved")
    } catch {
      setStatus("pending")
    }
  }

  const stop = () => {
    if (status !== "pending") return
    setStatus("stopped")
    onStop?.()
  }

  if (status === "approved" || status === "stopped") {
    const approved = status === "approved"
    return (
      <section
        data-slot="agent-approval-card"
        aria-labelledby={headingId}
        className={cn("flex items-center gap-2 rounded-2xl border border-separator bg-card px-4 py-3 text-sm", className)}
        {...props}
      >
        <Icon name={approved ? "check_circle" : "dangerous"} className="size-4 text-muted-foreground" />
        <h3 id={headingId} className="font-medium">
          {approved ? "Approved" : "Stopped"}
        </h3>
        <p role="status" className="text-muted-foreground">
          {approved
            ? `${title}${alwaysAllow ? ". The agent will not ask again for this kind of step" : ""}.`
            : kind === "spend"
              ? "Nothing ran and no credits were spent."
              : "Nothing was changed."}
        </p>
      </section>
    )
  }

  const busy = status === "approving"

  return (
    <section
      data-slot="agent-approval-card"
      aria-labelledby={headingId}
      onKeyDown={(event) => {
        // Esc stops, as the Stop button's hint promises, unless a menu inside handled it first.
        if (event.key === "Escape" && !event.defaultPrevented) stop()
      }}
      className={cn(
        "flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-brand/30 bg-card text-sm text-card-foreground",
        className
      )}
      {...props}
    >
      <header className="flex items-center gap-2 px-4 pt-3.5 pb-2">
        <Icon name="smart_toy" className="size-4 text-muted-foreground" />
        <h3 id={headingId} className="font-medium">
          {title}
        </h3>
        <span className="ml-auto text-xs text-brand-text">Waiting for your approval</span>
      </header>

      <ol
        aria-label="Steps the agent will run"
        ref={listRef}
        tabIndex={scrollable ? 0 : undefined}
        className="flex max-h-80 flex-col gap-4 overflow-y-auto px-4 py-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {steps.map((step, index) => (
          <li key={step.id} className="flex gap-3">
            <span className="w-4 shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums">{index + 1}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {step.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={step.thumbnail.src} alt={step.thumbnail.alt} className="size-14 rounded-lg object-cover" />
              ) : null}
              <p className="text-muted-foreground">{step.description}</p>
              {step.details?.length || step.credits ? (
                <ul className="flex flex-wrap gap-1.5" aria-label="Details">
                  {step.details?.map((detail) => (
                    <li
                      key={detail}
                      className="inline-flex h-7 items-center rounded-lg border border-chip-border bg-chip px-2.5 text-xs font-medium text-chip-foreground"
                    >
                      {detail}
                    </li>
                  ))}
                  {step.credits ? (
                    <li className="inline-flex h-7 items-center gap-1 rounded-lg border border-chip-border bg-chip px-2.5 text-xs font-medium text-chip-foreground tabular-nums">
                      <Icon name="star_shine-fill" className="size-3" />
                      {step.credits} {step.credits === 1 ? "credit" : "credits"}
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      {notEnoughCredits ? (
        <p id={noticeId} className="px-4 pb-1 text-xs text-muted-foreground">
          This needs {totalCredits} credits and you have {creditBalance}. Top up, or ask the agent for fewer steps.
        </p>
      ) : null}

      <footer className="flex flex-wrap items-center gap-2 border-t border-separator px-3 py-2.5">
        {onReply ? (
          <form
            className="min-w-40 flex-1"
            onSubmit={(event) => {
              event.preventDefault()
              if (!reply.trim()) return
              onReply(reply.trim())
              setReply("")
            }}
          >
            <input
              aria-label="Reply to the agent instead"
              placeholder="Ask for something different…"
              value={reply}
              disabled={busy}
              onChange={(event) => setReply(event.target.value)}
              className="h-9 w-full rounded-control bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </form>
        ) : (
          <span className="flex-1" />
        )}
        <Toggle variant="ghost" pressed={alwaysAllow} onPressedChange={setAlwaysAllow} disabled={busy} className="text-sm font-medium">
          <Icon name={alwaysAllow ? "check_circle" : "check"} />
          Always allow
        </Toggle>
        <Button variant="ghost" size="sm" onClick={stop} disabled={busy}>
          Stop
          <Kbd>Esc</Kbd>
        </Button>
        <Button
          variant={kind === "spend" ? "brand" : "default"}
          depth={kind === "spend" ? "glossy" : "flat"}
          size="sm"
          onClick={approve}
          disabled={busy || notEnoughCredits}
          focusableWhenDisabled
          aria-describedby={notEnoughCredits ? noticeId : undefined}
          className="min-w-24"
        >
          {busy ? <Spinner label="Starting" /> : null}
          {busy ? "Starting" : "Approve"}
          {!busy && kind === "spend" ? (
            <span className="inline-flex items-center gap-0.5 tabular-nums">
              {totalCredits > 0 ? (
                <>
                  <Icon name="star_shine-fill" className="size-3.5" />
                  {totalCredits}
                  <span className="sr-only">{totalCredits === 1 ? "credit" : "credits"}</span>
                </>
              ) : (
                <span>· free</span>
              )}
            </span>
          ) : null}
        </Button>
      </footer>
    </section>
  )
}
