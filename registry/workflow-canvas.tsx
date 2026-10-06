"use client"

import * as React from "react"
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  BaseEdge,
  getBezierPath,
  Handle,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useViewport,
  type Connection,
  type Edge,
  type EdgeChange,
  type EdgeProps,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react"
// Only the styles React Flow needs to work (positioning, handles, selection); the look is Mantis's.
import "@xyflow/react/dist/base.css"

import { cn } from "@/lib/mantis-cn"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icon, type IconName } from "@/components/ui/icon"
import { IconTile } from "@/components/ui/icon-tile"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"

/** A kind of step people can add, such as Prompt, Model or Upscale. */
export type WorkflowStepType = {
  /** Stable key that steps refer to. */
  type: string
  label: string
  icon: IconName
  color: React.ComponentProps<typeof IconTile>["color"]
  /** One line shown in the Add menu. */
  description?: string
  /** Credits this step costs each run. */
  credits?: number
  /** Whether other steps can feed into it. Turn off for starting points such as a prompt. */
  acceptsInput?: boolean
  /** Whether it can feed other steps. Turn off for end points such as an export. */
  hasOutput?: boolean
}

/** One step on the board. */
export type WorkflowStep = {
  id: string
  /** Matches a `WorkflowStepType.type`. */
  type: string
  /** Replaces the step type's label on the card. */
  title?: string
  /** One line under the title, such as the prompt text. */
  detail?: string
  /** Short settings shown as chips, such as the model and aspect ratio. */
  chips?: string[]
  position: { x: number; y: number }
}

/** A wire from one step's output to another step's input. */
export type WorkflowConnection = { id: string; from: string; to: string }

export type Workflow = { steps: WorkflowStep[]; connections: WorkflowConnection[] }

export interface WorkflowCanvasProps extends Omit<React.ComponentProps<"div">, "children" | "onChange"> {
  /** The kinds of step this workflow offers; they fill the Add step menu. */
  stepTypes: WorkflowStepType[]
  /** The steps on the board when it first renders. */
  defaultSteps?: WorkflowStep[]
  /** The wires between steps when it first renders. */
  defaultConnections?: WorkflowConnection[]
  /** Called whenever a step is added, moved or removed, or a wire is drawn or removed. Save the workflow here. */
  onChange?: (workflow: Workflow) => void
  /** Called with the current workflow and its total credit cost when Run is pressed. */
  onRun?: (workflow: Workflow & { credits: number }) => void
  /** Shows a spinner on Run and locks it while the workflow runs. */
  running?: boolean
  /** The person's remaining credits. When a run costs more, Run is disabled and says why. */
  creditBalance?: number
  /** Accessible name for the board. */
  label?: string
}

type StepData = { step: WorkflowStep; stepType: WorkflowStepType | undefined }
type StepNode = Node<StepData, "step">

const floating = "border border-glass-border bg-glass-panel shadow-popover backdrop-blur-glass"
const handleClass = "size-3! rounded-full! border-2! border-background! bg-muted-foreground!"

// A step card: colored icon tile, title, one line of detail and setting chips, with a connection
// point on the left for what feeds it and on the right for what it feeds.
function StepCard({ data, selected }: NodeProps<StepNode>) {
  const { step, stepType } = data
  return (
    <div
      data-slot="workflow-step"
      className={cn(
        "flex w-56 flex-col gap-2 rounded-xl border bg-card p-3 text-card-foreground shadow-popover transition-colors duration-(--duration-normal)",
        selected ? "border-brand" : "border-divider",
      )}
    >
      {stepType?.acceptsInput === false ? null : <Handle type="target" position={Position.Left} className={handleClass} />}
      <div className="flex items-center gap-2">
        <IconTile name={stepType?.icon ?? "add"} color={stepType?.color ?? "neutral"} size="sm" />
        <span className="truncate text-sm font-semibold">{step.title ?? stepType?.label ?? step.type}</span>
      </div>
      {step.detail ? <p className="line-clamp-2 text-xs text-muted-foreground">{step.detail}</p> : null}
      {step.chips?.length ? (
        <ul className="flex flex-wrap gap-1">
          {step.chips.map((chip) => (
            <li key={chip} className="flex h-6 items-center rounded-lg bg-chip px-2 text-xs font-medium text-chip-foreground">
              {chip}
            </li>
          ))}
        </ul>
      ) : null}
      {stepType?.hasOutput === false ? null : <Handle type="source" position={Position.Right} className={handleClass} />}
    </div>
  )
}

// A wire. It turns lime while it, or a step at either end, is selected, so the path being edited stands out.
function Wire({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, selected, data }: EdgeProps<Edge<{ active?: boolean }>>) {
  const [path] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  const lit = selected || data?.active
  return <BaseEdge path={path} style={{ stroke: lit ? "var(--brand)" : "var(--muted-foreground)", strokeWidth: lit ? 2 : 1.5 }} />
}

const nodeTypes = { step: StepCard }
const edgeTypes = { wire: Wire }

function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const { zoom } = useViewport()
  return (
    <Panel position="bottom-left" className={cn("flex items-center gap-0.5 rounded-xl p-1", floating)}>
      <Button variant="ghost" size="icon-sm" aria-label="Zoom out" onClick={() => zoomOut()}>
        <Icon name="remove" />
      </Button>
      <span aria-live="polite" className="w-11 text-center text-xs font-medium tabular-nums">
        {Math.round(zoom * 100)}%
      </span>
      <Button variant="ghost" size="icon-sm" aria-label="Zoom in" onClick={() => zoomIn()}>
        <Icon name="add" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Fit the workflow to the screen" onClick={() => fitView({ padding: 0.2 })}>
        <Icon name="fit_screen" />
      </Button>
    </Panel>
  )
}

function Board({
  stepTypes,
  defaultSteps = [],
  defaultConnections = [],
  onChange,
  onRun,
  running = false,
  creditBalance,
  label = "Workflow",
  className,
  ...props
}: WorkflowCanvasProps) {
  const typeOf = React.useCallback((type: string) => stepTypes.find((candidate) => candidate.type === type), [stepTypes])
  const [nodes, setNodes] = React.useState<StepNode[]>(() =>
    defaultSteps.map((step) => ({ id: step.id, type: "step", position: step.position, data: { step, stepType: typeOf(step.type) } })),
  )
  const [edges, setEdges] = React.useState<Edge[]>(() =>
    defaultConnections.map((connection) => ({ id: connection.id, source: connection.from, target: connection.to, type: "wire" })),
  )
  const nextId = React.useRef(defaultSteps.length + 1)

  const workflow = React.useMemo<Workflow>(
    () => ({
      steps: nodes.map((node) => ({ ...node.data.step, position: node.position })),
      connections: edges.map((edge) => ({ id: edge.id, from: edge.source, to: edge.target })),
    }),
    [nodes, edges],
  )

  // Report changes after they land, and not for the first render.
  const reported = React.useRef(false)
  React.useEffect(() => {
    if (reported.current) onChange?.(workflow)
    else reported.current = true
    // onChange is the caller's; only a change to the workflow should fire it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow])

  const selectedIds = nodes.filter((node) => node.selected).map((node) => node.id)
  const hasSelection = selectedIds.length > 0 || edges.some((edge) => edge.selected)
  const shownEdges = edges.map((edge) => ({
    ...edge,
    data: { active: selectedIds.includes(edge.source) || selectedIds.includes(edge.target) },
  }))

  const credits = nodes.reduce((total, node) => total + (node.data.stepType?.credits ?? 0), 0)
  const notEnoughCredits = creditBalance !== undefined && credits > creditBalance
  const statusId = React.useId()

  function addStep(stepType: WorkflowStepType) {
    const id = `${stepType.type}-${nextId.current++}`
    setNodes((current) => {
      // New steps land to the right of the last one, so they never cover an existing card.
      const last = current[current.length - 1]
      const position = last ? { x: last.position.x + 280, y: last.position.y } : { x: 0, y: 0 }
      return [
        ...current.map((node) => ({ ...node, selected: false })),
        { id, type: "step" as const, position, selected: true, data: { step: { id, type: stepType.type, position }, stepType } },
      ]
    })
  }

  function removeSelected() {
    setEdges((current) => current.filter((edge) => !edge.selected && !selectedIds.includes(edge.source) && !selectedIds.includes(edge.target)))
    setNodes((current) => current.filter((node) => !node.selected))
  }

  function connect(connection: Connection) {
    setEdges((current) => addEdge({ ...connection, type: "wire" }, current))
  }

  // A step cannot feed itself, and two steps need only one wire between them.
  function isValidConnection(connection: Connection | Edge) {
    if (connection.source === connection.target) return false
    return !edges.some((edge) => edge.source === connection.source && edge.target === connection.target)
  }

  return (
    <div
      data-slot="workflow-canvas"
      className={cn("relative h-full min-h-100 w-full overflow-hidden rounded-2xl border border-border bg-background text-foreground", className)}
      {...props}
    >
      <ReactFlow
        aria-label={label}
        colorMode="dark"
        nodes={nodes}
        edges={shownEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={(changes: NodeChange<StepNode>[]) => setNodes((current) => applyNodeChanges(changes, current))}
        onEdgesChange={(changes: EdgeChange[]) => setEdges((current) => applyEdgeChanges(changes, current))}
        onConnect={connect}
        isValidConnection={isValidConnection}
        defaultEdgeOptions={{ type: "wire" }}
        connectionLineStyle={{ stroke: "var(--brand)", strokeWidth: 2 }}
        minZoom={0.25}
        maxZoom={2}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="var(--divider)" />

        <Panel position="top-center" className={cn("flex items-center gap-1 rounded-2xl p-1.5", floating)}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
              <Icon name="add" />
              Add step
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Steps</DropdownMenuLabel>
                {stepTypes.map((stepType) => (
                  <DropdownMenuItem key={stepType.type} onClick={() => addStep(stepType)}>
                    <IconTile name={stepType.icon} color={stepType.color} size="sm" />
                    <span className="flex min-w-0 flex-col">
                      <span>{stepType.label}</span>
                      {stepType.description ? <span className="truncate text-xs text-muted-foreground">{stepType.description}</span> : null}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon-sm" aria-label="Remove the selected steps and wires" disabled={!hasSelection} onClick={removeSelected}>
            <Icon name="delete" />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <Button
            variant="brand"
            size="sm"
            disabled={running || nodes.length === 0 || notEnoughCredits}
            aria-describedby={notEnoughCredits ? statusId : undefined}
            onClick={() => onRun?.({ ...workflow, credits })}
          >
            {running ? <Spinner label="Running workflow" /> : <Icon name="play_arrow" />}
            Run
            {credits > 0 ? (
              <span className="flex items-center gap-0.5 tabular-nums">
                <Icon name="star_shine-fill" />
                {credits}
                <span className="sr-only"> credits</span>
              </span>
            ) : null}
          </Button>
        </Panel>

        <ZoomControls />
      </ReactFlow>

      {nodes.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
          <p className="text-sm font-medium">No steps yet</p>
          <p className="text-sm text-muted-foreground">Use Add step to place the first one, then drag from its edge to connect the next.</p>
        </div>
      ) : null}

      {notEnoughCredits ? (
        <p id={statusId} role="status" className={cn("absolute top-16 left-1/2 -translate-x-1/2 rounded-lg px-3 py-1.5 text-xs text-destructive", floating)}>
          This run needs {credits} credits and you have {creditBalance}.
        </p>
      ) : null}
    </div>
  )
}

// A node-and-wire editor for chaining generation steps: draggable step cards, wires drawn by dragging
// between connection points, pan and zoom, an Add step menu and one lime Run button with the live cost.
// Dragging, wiring, panning and zooming come from React Flow (@xyflow/react); the look is Mantis's.
function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <Board {...props} />
    </ReactFlowProvider>
  )
}

export { WorkflowCanvas }
