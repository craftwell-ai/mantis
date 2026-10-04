# top-navigation (block)

The app's top bar: an empty logo slot, section links with the current one in lime and an optional New badge, a search pill with a ⌘K hint, a pricing link carrying a sale tag, an Assets button, the credit balance and the account control. When the bar is narrower than 1024px the links, pricing and assets fold into a menu sheet (it measures its own width, not the window).

### When to use
- Every page of a signed-in creative app needs the same bar for moving between sections, searching, buying and reaching the account.
- A marketing or pricing page for the same product needs the bar people see once they sign in, with the sale tag on pricing during a promotion and a lime Sign up in place of the avatar.

### Reach for instead
- **tabs** — when you are switching views of one subject inside a page, not moving between sections of the app
- **sheet** — when the app has a sidebar for navigation; use a sheet for that sidebar on small screens instead of a top bar

### Rules
- **Do:** Mark only the current section in lime, and leave every other link grey. **Don't:** Color a promoted link lime to draw attention; people read lime text in the bar as "you are here".
- **Do:** When signed out, pass one lime `brand` Sign up (or Sign in) link as `account`: the bar's one call to action. **Don't:** Pass a glass or white sign-in link, or add a second lime button such as a lime Pricing link beside it.
- **Do:** Badge one or two links that are genuinely new, and remove the badge after a few weeks. **Don't:** Badge most of the links; the bar becomes noise and the badge stops meaning anything.
- **Do:** Put the product's own mark in the logo slot, or leave the labelled placeholder. **Don't:** Draw a stand-in logo from icons or letters that could be mistaken for a real brand.

### Accessibility
- The bar is a `header` holding a `nav` named "Main"; the current link has `aria-current="page"`, so the lime is not the only signal.
- The search pill is a real button named "Search" and ⌘K (Ctrl+K on Windows) opens the same search from anywhere on the page.
- The credit balance reads as "1,240 credits left"; the coin icon is decorative.
- On small screens the menu button is named "Open menu" and opens a sheet with the same links, which traps focus until it closes.

### Design tokens
`--background` · `--foreground` · `--muted-foreground` · `--brand-text` · `--glass` · `--kbd` · `--kbd-foreground` · `--sale` · `--sale-foreground` · `--badge-new` · `--brand` · `--brand-foreground` · `--divider`

