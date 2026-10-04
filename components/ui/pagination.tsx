"use client"

import * as React from "react"
import { cn } from "@/lib/mantis-cn"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type PaginationProps = Omit<React.ComponentProps<"nav">, "onChange"> & {
  /** The page on screen, counting from 1. */
  page: number
  /** How many pages there are; at least 1. */
  pageCount: number
  onPageChange: (page: number) => void
  /** Rows per page. The Rows picker shows when this and `onPageSizeChange` are set. */
  pageSize?: number
  /** The choices in the Rows picker. */
  pageSizes?: number[]
  /** Usually also sends the reader back to page 1, since the old page may no longer exist. */
  onPageSizeChange?: (size: number) => void
}

// The compact pager under the reference's tables: a small Rows picker on the
// left, "Page X of Y" in the middle, and ghost previous and next buttons on
// the right. The page line is a polite live region, so a screen reader hears
// where it landed after each step.
function Pagination({
  page,
  pageCount,
  onPageChange,
  pageSize,
  pageSizes = [10, 25, 50],
  onPageSizeChange,
  className,
  "aria-label": ariaLabel = "Pages",
  ...props
}: PaginationProps) {
  const rowsId = React.useId()
  const total = Math.max(1, pageCount)
  const current = Math.min(Math.max(1, page), total)
  const sizeItems = pageSizes.map((size) => ({ value: String(size), label: String(size) }))

  return (
    <nav
      data-slot="pagination"
      aria-label={ariaLabel}
      className={cn("flex items-center justify-between gap-3", className)}
      {...props}
    >
      {pageSize !== undefined && onPageSizeChange ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span id={rowsId}>Rows</span>
          <Select
            items={sizeItems}
            value={String(pageSize)}
            onValueChange={(next) => {
              if (next) onPageSizeChange(Number(next))
            }}
          >
            <SelectTrigger size="sm" aria-labelledby={rowsId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sizeItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
        Page {current} of {total}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Previous page"
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
        >
          <Icon name="chevron_left" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Next page"
          disabled={current >= total}
          onClick={() => onPageChange(current + 1)}
        >
          <Icon name="chevron_right" />
        </Button>
      </div>
    </nav>
  )
}

export { Pagination, type PaginationProps }
