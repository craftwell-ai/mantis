# landing-page (block)

A public marketing page for a product or tool: the signed-out top bar, the marketing hero, a feature grid, a three-step how-it-works, one closing call-to-action band and the lime site footer. Every section takes the props of the block it wraps, so the page is filled by content alone.

### When to use
- You are building a home page or a landing page for one tool, for visitors who are not signed in.
- The page should walk a visitor from a promise, to what the product does, to how it works, to signing up.

### Reach for instead
- **marketing-hero** — when only the opening section is needed inside an existing page
- **pricing-page** — when the visitor is comparing plans rather than learning what the product does

### Rules
- **Do:** Make the closing call to action the same sign-up as the hero's primary button, so the page ends where it began. **Don't:** End on a different, smaller ask such as a newsletter.
- **Do:** Make the sign-up the lime call to action: in the top bar, as the hero's primary button and in the closing band. Each section has one lime button; the hero's second action is glass. **Don't:** Add a second lime button to a section, or make a lime area other than the footer.
- **Do:** Separate sections with space on the page ground. **Don't:** Box each section in its own bordered card or add divider lines between them.
- **Do:** Pass your own data for every prop before shipping. Left out, a prop falls back to the invented sample product, Lumen, from sample-content, which is only there so the template previews with nothing filled in. **Don't:** Ship the sample product, people and numbers to real users, such as Maya Okafor's account menu or a credit balance nobody has.

### Accessibility
- The hero headline is the only h1; the feature grid, how-it-works and call-to-action band each start with an h2.
- Call-to-action buttons are real links styled as buttons, so they announce as links.
- Every picture has alt text describing what it stands in for.

### Design tokens
`--background` · `--card` · `--foreground` · `--muted-foreground` · `--primary` · `--primary-foreground` · `--brand-text` · `--brand` · `--brand-foreground`

