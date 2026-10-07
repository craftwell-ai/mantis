"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { cn } from "@/lib/mantis-cn"

/** One line, bar segment or area in the chart, such as a tool or a plan. */
export type UsageChartSeries = {
  /** Matches a key in each point's `values`. */
  key: string
  label: string
}

/** One step along the bottom axis, such as a day. */
export type UsageChartPoint = {
  /** The axis label, such as "Mon" or "Oct 6". */
  label: string
  /** The number for each series at this step, by series key. */
  values: Record<string, number>
}

export interface UsageChartProps extends Omit<React.ComponentProps<"figure">, "children" | "title"> {
  /** What the chart shows, such as "Credits spent this week". It is the chart's heading and accessible name. */
  title: string
  /** One line under the title, such as the period or the total. */
  description?: string
  /** Up to five series; each takes the next chart color in order. */
  series: UsageChartSeries[]
  data: UsageChartPoint[]
  /** `bar` stacks the series to compare totals, `line` compares trends, `area` shows how a total is made up over time. */
  type?: "bar" | "line" | "area"
  /** What the numbers count, written after each value, such as "credits". */
  unit?: string
}

// The five chart tokens, in the order series take them. They are named here so every chart in an app
// gives the first series the same color.
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]
const SWATCHES = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

const format = (value: number) => value.toLocaleString("en-US")

type HoverProps = {
  active?: boolean
  label?: string | number
  payload?: ReadonlyArray<{ dataKey?: string | number; value?: number | string }>
  series: UsageChartSeries[]
  unit?: string
}

// The card that follows the pointer: the step's label, each series' value and the total.
function Hover({ active, label, payload, series, unit }: HoverProps) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum, entry) => sum + Number(entry.value ?? 0), 0)
  return (
    <div className="flex min-w-36 flex-col gap-1.5 rounded-lg border border-tooltip-border bg-tooltip px-3 py-2 text-xs text-tooltip-foreground shadow-popover">
      <p className="font-medium">{label}</p>
      <ul className="flex flex-col gap-1">
        {series.map((entry, index) => {
          const value = payload.find((candidate) => candidate.dataKey === entry.key)?.value
          return value === undefined ? null : (
            <li key={entry.key} className="flex items-center gap-2">
              <span aria-hidden="true" className={cn("size-2 rounded-full", SWATCHES[index])} />
              <span className="flex-1">{entry.label}</span>
              <span className="tabular-nums">{format(Number(value))}</span>
            </li>
          )
        })}
      </ul>
      {series.length > 1 ? (
        <p className="flex justify-between gap-4 border-t border-tooltip-border pt-1.5 font-medium">
          <span>Total</span>
          <span className="tabular-nums">
            {format(total)}
            {unit ? ` ${unit}` : ""}
          </span>
        </p>
      ) : null}
    </div>
  )
}

// A chart of numbers over time for up to five series, as stacked bars, lines or stacked areas, with a
// legend, hover details and a table of the same numbers for screen readers. The drawing is Recharts;
// the colors are the chart tokens.
function UsageChart({ title, description, series, data, type = "bar", unit, className, ...props }: UsageChartProps) {
  const titleId = React.useId()
  const shown = series.slice(0, COLORS.length)
  const rows = data.map((point) => ({ label: point.label, ...point.values }))

  const frame = (
    <>
      <CartesianGrid vertical={false} stroke="var(--divider)" />
      <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
      <YAxis width={44} tickLine={false} axisLine={false} tickFormatter={format} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
      <Tooltip cursor={{ fill: "var(--glass)", stroke: "var(--divider)" }} content={<Hover series={shown} unit={unit} />} />
    </>
  )
  // Recharts would redraw the chart in an animation on every change; the chart appears as it is.
  const still = { isAnimationActive: false }

  return (
    <figure data-slot="usage-chart" aria-labelledby={titleId} className={cn("flex flex-col gap-4 rounded-2xl bg-card p-4", className)} {...props}>
      <figcaption className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex flex-col gap-0.5">
          <h3 id={titleId} className="text-base font-medium">
            {title}
          </h3>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <ul aria-label="Series" className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {shown.map((entry, index) => (
            <li key={entry.key} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={cn("size-2 rounded-full", SWATCHES[index])} />
              {entry.label}
            </li>
          ))}
        </ul>
      </figcaption>

      {/* The chart can be focused and stepped through with the arrow keys, which shows each step's
          details. The same numbers follow as a table for screen readers. */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} accessibilityLayer aria-label={`${title}. Use the arrow keys to step through it.`}>
              {frame}
              {shown.map((entry, index) => (
                <Line key={entry.key} dataKey={entry.key} name={entry.label} type="monotone" stroke={COLORS[index]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} {...still} />
              ))}
            </LineChart>
          ) : type === "area" ? (
            <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} accessibilityLayer aria-label={`${title}. Use the arrow keys to step through it.`}>
              {frame}
              {shown.map((entry, index) => (
                <Area key={entry.key} dataKey={entry.key} name={entry.label} type="monotone" stackId="total" stroke={COLORS[index]} strokeWidth={2} fill={COLORS[index]} fillOpacity={0.25} {...still} />
              ))}
            </AreaChart>
          ) : (
            <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} accessibilityLayer aria-label={`${title}. Use the arrow keys to step through it.`}>
              {frame}
              {shown.map((entry, index) => (
                <Bar key={entry.key} dataKey={entry.key} name={entry.label} stackId="total" fill={COLORS[index]} radius={index === shown.length - 1 ? [4, 4, 0, 0] : 0} maxBarSize={40} {...still} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>
          {title}
          {unit ? `, in ${unit}` : ""}
        </caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            {shown.map((entry) => (
              <th key={entry.key} scope="col">
                {entry.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.label}>
              <th scope="row">{point.label}</th>
              {shown.map((entry) => (
                <td key={entry.key}>{format(point.values[entry.key] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

export { UsageChart }
