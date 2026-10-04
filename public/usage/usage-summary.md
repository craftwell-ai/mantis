# usage-summary (block)

Where credits went: a period picker, total tiles, a stacked bar of credits by tool with a legend, and a usage history table with tool and action filters and pagination.

### When to use
- An account or billing page shows how many credits someone spent in a period and on which tools.
- People need to find one charge or refund in a long history by filtering by tool or by spent versus refunded.

### Reach for instead
- **progress** — when only the balance matters, such as credits left this month in the account menu
- **table** — when the history has no categories to chart, such as a list of invoices

### Rules
- **Do:** Keep the legend under the bar with each tool's name and percentage, so the colors are never the only key. **Don't:** Show the colored bar alone and rely on hover or color to say which tool is which.
- **Do:** Write spent credits with a minus and refunds with a plus, and name the action in words in its own column. **Don't:** Color refunds green as the only sign that money came back.
- **Do:** When filters hide every row, say so and say how to see more. **Don't:** Show an empty table, which reads as "you have no history".

### Accessibility
- The section is named by its "Credit usage" heading; the history table is named by its "Usage history" heading.
- The stacked bar is hidden from screen readers because the legend list states every tool's share in words and credits.
- Filters sit in the column headers as labelled selects ("Filter by tool", "Filter by action"); the page counter is a polite live region.
- Credit amounts are right-aligned with tabular figures so they compare down the column.

### Design tokens
`--card` · `--glass` · `--muted-foreground` · `--chip` · `--chip-border` · `--divider` · `--chart-1` · `--chart-2` · `--chart-3` · `--chart-4` · `--chart-5` · `--skeleton`

