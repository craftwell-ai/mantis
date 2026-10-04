# site-footer (block)

The footer of a marketing site: an empty logo slot and an uppercase statement, columns of links, then a bottom row with the copyright line, legal links and social buttons. Lime for marketing pages, or a quiet dark tone for in-app pages.

### When to use
- A landing, pricing or tool page needs a closing footer that links to the rest of the site, the legal pages and the product's social accounts.
- An in-app page such as a gallery or help center needs a small legal footer; use `tone="plain"` and fewer columns.

### Reach for instead
- **top-navigation** — when the links are the ones people need on every screen while they work; those belong in the top bar, not the footer

### Rules
- **Do:** Use the lime tone once, as the last thing on a marketing page. **Don't:** Put the lime footer on app pages next to a lime Generate button, where two lime areas compete; use the plain tone there.
- **Do:** Group links into three or four titled columns of about six short links each. **Don't:** Dump every page of the site into one long column, or leave columns untitled.
- **Do:** Give every social button the network's name as its label, such as "Instagram". **Don't:** Ship icon-only social links without a name; a screen reader would say only "link".

### Accessibility
- Each column is a `nav` named after its visible title, so screen-reader users can jump between groups of links.
- Social buttons are links whose accessible name is the network; the Material Symbols icon is decorative.
- On lime, the system's lime focus ring is replaced by a dark one so focus stays visible.
- Text on lime is the dark brand label color, and on the plain tone links are grey (4.5:1) and turn off-white on hover.

### Design tokens
`--brand` · `--brand-foreground` · `--background` · `--foreground` · `--muted-foreground` · `--glass` · `--separator`

