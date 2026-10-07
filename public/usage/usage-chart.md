# usage-chart (block)

A chart of numbers over time for up to five series, as stacked bars, lines or stacked areas, with a legend, hover details and the same numbers as a table for screen readers.

### When to use
- People need to see how something changed over days or weeks, such as credits spent per tool or generations per day.
- A usage, billing or analytics page needs more than one total: the shape over time matters.

### Reach for instead
- **usage-summary** — when one period's totals and a history table are enough; its single stacked bar says how the total splits
- **progress** — when there is one number against one limit, such as credits left this month
- **table** — when people need the exact figures to compare and sort, not the trend

### Rules
- **Do:** Use bars to compare totals between days, lines to compare trends between series, and areas to show how a total is made up over time. **Don't:** Use lines for stacked totals or areas for unrelated series; the shape then suggests something the numbers do not say.
- **Do:** Show up to five series, the number of chart colors, and fold the rest into "Other". **Don't:** Add a sixth color or reuse one; two series in the same color cannot be told apart.
- **Do:** Keep each series in the same position everywhere in an app, so it always gets the same color. **Don't:** Reorder series between charts; people learn "lime is Image studio" once.
- **Do:** Pass `unit` (credits, generations, minutes) and put the period in the description. **Don't:** Leave bare numbers on the axis with no word for what they count.

### Accessibility
- The chart is a figure named by its title. The same numbers follow as a real table with a caption, column headers and row headers, for screen readers.
- The drawing can be focused with Tab and stepped through with the left and right arrow keys, which shows each step's details the way hovering does.
- The legend is text next to each color, so series are never told apart by color alone.
- Axis labels use the secondary text color, which meets 4.5:1 on the card.
- The chart does not animate when it appears or changes.

### Design tokens
`--chart-1` · `--chart-2` · `--chart-3` · `--chart-4` · `--chart-5` · `--card` · `--divider` · `--muted-foreground` · `--tooltip` · `--tooltip-border` · `--glass`

