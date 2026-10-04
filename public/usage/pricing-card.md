# pricing-card (block)

One subscription plan on a card: its name, a monthly/yearly billing switch, the price for the chosen period, what the plan includes, and a button to subscribe.

### When to use
- A pricing page or upgrade panel presents a paid plan, such as Creator, and people need to see its price and contents before subscribing.
- A plan can be billed monthly or yearly and the yearly price is a discount people should be able to compare.
- Several plans sit side by side in a row, one card per plan, with one of them marked as the best value.

### Reach for instead
- **table** — when people need to compare many plans feature by feature; a plan matrix reads better than repeated lists
- **card** — when the panel shows a balance or usage rather than something to buy, such as credits left this month

### Rules
- **Do:** Give the "Best value" badge to one plan in a row, the one you most want people to pick. **Don't:** Badge every plan, or add a second badge such as "Hot" next to it. When everything is highlighted, nothing is.
- **Do:** Buy the plan with the lime `brand` button, the card's one lime action, and keep the blue value badge for the offer tag. **Don't:** Use the commerce-blue or commerce-pink button to buy, or add a second filled button to the card. Pink and blue mark offers; buying a plan is the main call to action, so it is lime.
- **Do:** List three to six concrete things the plan includes, each one short line, such as "4K upscaling on every export". **Don't:** Paste a full feature matrix into the card, or write vague lines like "Everything you need".
- **Do:** Pass the real monthly and yearly prices so the card can state the yearly total and the saving. **Don't:** Show only the discounted monthly figure for yearly billing; people should see what they will actually be charged.

### Accessibility
- The plan name is an `h3` and labels the card, so screen-reader users can jump between plans by heading.
- The billing switch is a toggle group labelled "Billing period"; arrow keys move between Monthly and Yearly.
- The price sits in a polite live region, so the new price is announced after the billing period changes.
- Check marks beside features are decorative and hidden from screen readers; the list itself is labelled with the plan name.
- The dark label on the lime button and white on the value badge meet WCAG 2.1 AA (4.5:1).

### Design tokens
`--card` · `--card-foreground` · `--muted-foreground` · `--soft` · `--primary` · `--primary-foreground` · `--brand` · `--brand-foreground` · `--badge-value` · `--sale-foreground`

