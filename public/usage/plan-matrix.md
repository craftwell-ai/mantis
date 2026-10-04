# plan-matrix (block)

The body of a pricing page: one monthly/yearly switch that sets the price on a row of plan cards, one plan framed as most popular, and a comparison table that lists every feature by section with a check, a dash or a limit per plan.

### When to use
- A pricing page shows two to four subscription plans side by side and people need to compare them before choosing.
- Plans differ on many features, so a short list on each card is not enough and a full comparison table follows the cards.
- Yearly billing is discounted and one switch should change every price on the page at once.

### Reach for instead
- **pricing-card** — when only one plan is on offer, such as an upgrade panel inside the app
- **table** — when there are no prices to choose between, only a list of what an account includes

### Rules
- **Do:** Use the one billing switch above the cards; every card follows it. **Don't:** Leave a billing switch on each card as well. Two switches that can disagree make people unsure which price applies.
- **Do:** Frame exactly one plan with the pink "Most popular" label, the one most people should pick. **Don't:** Frame two plans, or frame one in lime. Lime is each card's buy button, so a lime frame competes with it, and two highlights cancel each other out.
- **Do:** Mark every cell: a check when included, a dash when not, or a short limit such as "4K" or "3 seats". **Don't:** Leave cells empty. A blank reads as "not loaded yet" as often as "not included".
- **Do:** Group the table into three to five named sections, such as Generation, Exports and Teamwork, so people can scan to what they care about. **Don't:** List twenty features in one undivided run.

### Accessibility
- The billing switch is a toggle group labelled "Billing period"; each card announces its new price through a polite live region.
- The comparison is a real table named by its heading. Plan names are column headers, section titles are column-group headers and feature names are row headers.
- Check and dash icons are decorative; each carries the hidden words "Included" or "Not included". The highlighted plan's label is repeated in its column header for screen readers.
- White on the commerce pink frame label and the dark label on each lime buy button meet WCAG 2.1 AA (4.5:1).

### Design tokens
`--card` · `--muted-foreground` · `--commerce-pink` · `--commerce-pink-foreground` · `--brand` · `--brand-foreground` · `--soft` · `--sale` · `--divider`

