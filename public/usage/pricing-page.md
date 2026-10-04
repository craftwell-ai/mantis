# pricing-page (block)

A complete plans page: a lime announcement bar with a live countdown for a time-limited offer, the app top bar, an uppercase headline, the plan matrix (one billing switch, plan cards and the comparison table), a frequently-asked-questions accordion and the lime site footer.

### When to use
- You need the whole pricing page, from the offer bar to the footer, for a subscription product.
- A real, dated offer is running and the page should say when it ends.

### Reach for instead
- **plan-matrix** — when the plans sit inside a page that already has its own header and footer
- **promo-modal** — when the offer should interrupt once at a natural pause instead of leading a page
- **pricing-card** — when only one plan is on offer, such as an upgrade panel

### Rules
- **Do:** Pass `offer.endsAt` only for a real end date, and `offer={null}` when nothing is on sale. **Don't:** Reset the timer on every visit to create urgency that is not real.
- **Do:** Answer the questions people have right before paying: what a credit buys, rollover, switching plans, commercial use, cancelling. **Don't:** Fill the FAQ with marketing claims.
- **Do:** Highlight at most one plan, the one most people should pick. **Don't:** Highlight every paid plan.
- **Do:** Pass your own data for every prop before shipping. Left out, a prop falls back to the invented sample product, Lumen, from sample-content, which is only there so the template previews with nothing filled in. **Don't:** Ship the sample product, people and numbers to real users, such as Maya Okafor's account menu or a credit balance nobody has.

### Accessibility
- The headline is the page h1; a visually hidden "Plans" h2 keeps the plan cards' h3s in order, and the FAQ has its own h2.
- The countdown is a `timer` with a spoken summary, and announces once when the offer ends.
- FAQ questions are accordion buttons that report expanded or collapsed.
- The announcement bar is a labelled region with a dismiss button.

### Design tokens
`--background` · `--brand` · `--brand-foreground` · `--card` · `--foreground` · `--muted-foreground` · `--divider` · `--commerce-pink` · `--sale`

