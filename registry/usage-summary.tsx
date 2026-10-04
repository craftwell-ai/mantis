"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"

import { Badge } from "@/components/ui/badge"
import { Heading } from "@/components/ui/heading"
import { Icon, type IconName } from "@/components/ui/icon"
import { Pagination } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type UsageCategory = {
  id: string
  label: string
  credits: number
}

export type UsageEntry = {
  id: string
  /** Credits moved by this entry, always positive; `action` says which way. */
  credits: number
  /** Matches a `UsageCategory.id`, so the tool filter and the bar agree. */
  categoryId: string
  action: "spent" | "refunded"
  /** Already written for people, such as "Oct 2, 4:18 PM". */
  date: string
  /** The same moment as an ISO string, for `<time dateTime>`. */
  dateTime?: string
}

export type UsageStat = { label: string; value: string; icon: IconName }

export interface UsageSummaryProps {
  categories: UsageCategory[]
  entries: UsageEntry[]
  /** Extra totals shown beside credits spent, such as cost or generations made. */
  stats?: UsageStat[]
  /** Period choices for the header select; the first is selected by default. */
  periods?: { value: string; label: string }[]
  period?: string
  onPeriodChange?: (period: string) => void
  /** Show skeleton rows while the history loads. */
  loading?: boolean
  pageSizes?: number[]
  className?: string
}

// The five chart series colors. Order is stable so a category keeps its color
// as long as its position does; "the rest" is always grey.
const SEGMENT_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]
const OTHER_COLOR = "bg-muted-foreground"

const DEFAULT_PERIODS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "cycle", label: "This billing cycle" },
]

const ALL = "all"

function formatCredits(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)
}

function UsageSummary({
  categories,
  entries,
  stats = [],
  periods = DEFAULT_PERIODS,
  period: periodProp,
  onPeriodChange,
  loading = false,
  pageSizes = [10, 25, 50],
  className,
}: UsageSummaryProps) {
  const headingId = React.useId()
  const historyId = React.useId()
  const [periodState, setPeriodState] = React.useState(periods[0]?.value ?? "")
  const period = periodProp ?? periodState
  const [toolFilter, setToolFilter] = React.useState<string>(ALL)
  const [actionFilter, setActionFilter] = React.useState<string>(ALL)
  const [pageSize, setPageSize] = React.useState(pageSizes[0] ?? 10)
  const [page, setPage] = React.useState(0)

  const totalCredits = categories.reduce((sum, category) => sum + category.credits, 0)
  const usedCategories = categories.filter((category) => category.credits > 0)
  // Past five named categories the colors would repeat, so the tail folds into "Everything else".
  const named = usedCategories.slice(0, SEGMENT_COLORS.length)
  const restCredits = usedCategories.slice(SEGMENT_COLORS.length).reduce((sum, c) => sum + c.credits, 0)
  const segments = [
    ...named.map((category, index) => ({ ...category, color: SEGMENT_COLORS[index] })),
    ...(restCredits > 0 ? [{ id: "other", label: "Everything else", credits: restCredits, color: OTHER_COLOR }] : []),
  ]
  const percent = (credits: number) => (totalCredits > 0 ? Math.round((credits / totalCredits) * 100) : 0)
  const categoryLabel = (id: string) => categories.find((category) => category.id === id)?.label ?? id

  const filtered = entries.filter(
    (entry) =>
      (toolFilter === ALL || entry.categoryId === toolFilter) && (actionFilter === ALL || entry.action === actionFilter)
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount - 1)
  const visible = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  const allStats: UsageStat[] = [
    { label: "Credits spent", value: formatCredits(totalCredits), icon: "data_usage" },
    { label: "Tools used", value: String(usedCategories.length), icon: "layers" },
    ...stats,
  ]

  const toolItems = [{ value: ALL, label: "All tools" }, ...categories.map((c) => ({ value: c.id, label: c.label }))]
  const actionItems = [
    { value: ALL, label: "All actions" },
    { value: "spent", label: "Spent" },
    { value: "refunded", label: "Refunded" },
  ]

  return (
    <section data-slot="usage-summary" aria-labelledby={headingId} className={cn("flex w-full flex-col gap-4", className)}>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Heading id={headingId} level="title">
            Credit usage
          </Heading>
          <p className="text-sm text-muted-foreground">Where your credits went, by tool and by generation.</p>
        </div>
        <Select
          items={periods}
          value={period}
          onValueChange={(next) => {
            if (!next) return
            if (periodProp === undefined) setPeriodState(next)
            onPeriodChange?.(next)
          }}
        >
          <SelectTrigger size="sm" aria-label="Period">
            <Icon name="schedule" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="end">
            {periods.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <div className="flex flex-col gap-4 rounded-2xl bg-card p-4">
        <h3 className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="data_usage" className="size-4" />
          Spend overview
        </h3>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-(--stat-columns)" style={{ "--stat-columns": `repeat(${allStats.length}, minmax(0, 1fr))` } as React.CSSProperties}>
          {allStats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 rounded-xl bg-glass p-3">
              <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-glass text-muted-foreground">
                <Icon name={stat.icon} className="size-4" />
              </span>
              <p className="flex min-w-0 flex-col">
                <span className="text-base font-semibold tabular-nums">{stat.value}</span>
                <span data-contrast-exempt className="truncate text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </p>
            </div>
          ))}
        </div>

        {segments.length > 0 ? (
          <div className="flex flex-col gap-3">
            {/* The legend below states every share in words, so the bar itself is decorative. */}
            <div aria-hidden="true" className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-glass">
              {segments.map((segment) => (
                <span
                  key={segment.id}
                  className={cn("h-full first:rounded-l-full last:rounded-r-full", segment.color)}
                  style={{ width: `${(segment.credits / totalCredits) * 100}%` }}
                />
              ))}
            </div>
            <ul aria-label="Credits by tool" className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
              {segments.map((segment) => (
                <li key={segment.id} className="flex items-center gap-1.5">
                  <span aria-hidden="true" className={cn("size-2 rounded-full", segment.color)} />
                  <span>{segment.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {percent(segment.credits)}%<span className="sr-only">, {formatCredits(segment.credits)} credits</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No credits spent in this period.</p>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-card p-4">
        <h3 id={historyId} className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="receipt_long" className="size-4" />
          Usage history
          <Badge variant="neutral" aria-label={`${filtered.length} entries`}>
            {filtered.length}
          </Badge>
        </h3>

        <Table aria-labelledby={historyId}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col" className="text-right">
                Credits
              </TableHead>
              <TableHead scope="col">
                <Select
                  items={toolItems}
                  value={toolFilter}
                  onValueChange={(next) => {
                    setToolFilter(next ?? ALL)
                    setPage(0)
                  }}
                >
                  <SelectTrigger size="sm" aria-label="Filter by tool" className="-ml-3 h-7 border-transparent bg-transparent text-xs text-muted-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} align="start">
                    {toolItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead scope="col">
                <Select
                  items={actionItems}
                  value={actionFilter}
                  onValueChange={(next) => {
                    setActionFilter(next ?? ALL)
                    setPage(0)
                  }}
                >
                  <SelectTrigger size="sm" aria-label="Filter by action" className="-ml-3 h-7 border-transparent bg-transparent text-xs text-muted-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} align="start">
                    {actionItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead scope="col" className="text-right">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody aria-busy={loading || undefined}>
            {loading
              ? Array.from({ length: 5 }, (_, index) => (
                  <TableRow key={index} className="hover:bg-transparent">
                    <TableCell colSpan={4} className="py-3">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}
            {!loading && visible.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="py-10 text-center text-sm whitespace-normal text-muted-foreground">
                  {entries.length === 0
                    ? "Nothing yet. Credits you spend on generations will be listed here."
                    : "No usage matches these filters. Choose All tools or All actions to see more."}
                </TableCell>
              </TableRow>
            ) : null}
            {!loading
              ? visible.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-right font-medium tabular-nums">
                      {entry.action === "refunded" ? "+" : "−"}
                      {formatCredits(entry.credits)}
                    </TableCell>
                    <TableCell>{categoryLabel(entry.categoryId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.action === "refunded" ? "Refunded" : "Spent"}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      <time dateTime={entry.dateTime}>{entry.date}</time>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>

        <Pagination
          aria-label="Usage history pages"
          className="pt-2"
          page={currentPage + 1}
          pageCount={pageCount}
          onPageChange={(next) => setPage(next - 1)}
          pageSize={pageSize}
          pageSizes={pageSizes}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(0)
          }}
        />
      </div>
    </section>
  )
}

export { UsageSummary }
