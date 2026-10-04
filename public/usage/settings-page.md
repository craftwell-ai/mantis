# settings-page (block)

The full account settings page: the app shell, the settings nav on the left and, on the right, stacked section cards for the chosen page. It ships four pages, switched by the nav: Profile (photo, name, username, email, sharing), Notifications, Security (sign-in, signed-in devices, delete account) and Usage (credit summary and history). When the page is narrower than 768px (its own width) the nav sits above the cards.

### When to use
- You need a working account settings page and want it built from the system's own settings blocks.
- You are adding a settings page to a new app and want the profile, notifications, security and usage pages people expect.

### Reach for instead
- **settings-section** — when you are adding one settings card to a page you already have
- **app-shell-sidebar** — when the left column is general navigation rather than a list of settings pages
- **sheet** — when the settings belong to one project or generation and should open beside it

### Rules
- **Do:** Give each topic its own card with a title and a one-line description, stacked in one column. **Don't:** Pour every setting into one long card, or lay cards side by side in a grid.
- **Do:** Put a Save button inside each form card that needs one, and let switches take effect at once. **Don't:** Add one page-wide Save button that commits several cards at once.
- **Do:** Keep account deletion at the bottom of Security, in its danger zone with a confirmation. **Don't:** Place a delete button among everyday settings.
- **Do:** Pass your own data for every prop before shipping. Left out, a prop falls back to the invented sample product, Lumen, from sample-content, which is only there so the template previews with nothing filled in. **Don't:** Ship the sample product, people and numbers to real users, such as Maya Okafor's account menu or a credit balance nobody has.

### Accessibility
- The page heading is an `h1` naming the chosen page; picking a page from the nav moves focus to it so screen readers start reading the new content.
- Each card is a `section` named by its own `h2`; every switch is labelled and described by its row.
- Save results are announced through a status message; errors use an alert.

### Design tokens
`--background` · `--card` · `--foreground` · `--muted-foreground` · `--glass` · `--field` · `--divider` · `--primary` · `--destructive` · `--ring`

