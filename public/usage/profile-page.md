# profile-page (block)

A person's page in a signed-in creative app: a sidebar card with avatar, name, handle, bio, location, stats and Follow (or Edit profile on your own page), beside tabs for their generations, the work they liked and their posts. Each tab has its own empty state, worded for the owner with a way to start, or for a visitor with no action. Pictures open in the lightbox inspector.

### When to use
- You are building a creator's public profile or the viewer's own profile page.
- One person's work, likes and posts need to be browsed in separate tabs with honest empty states.

### Reach for instead
- **explore-page** — when the work comes from everyone and is browsed by category
- **settings-nav** — when the page edits account details rather than showing the person's work

### Rules
- **Do:** Show Follow on someone else's profile and Edit profile on your own; never both, and keep Share as a glass icon button. **Don't:** Put Follow, Message and Edit side by side as filled buttons.
- **Do:** Write each tab's empty state for who is looking: the owner gets a way to start, a visitor gets a plain sentence. **Don't:** Show "You have no generations" with a Create button to a visitor.
- **Do:** Keep stats to two to four short counts, already formatted ("12.4K"). **Don't:** Turn the stats row into badges or a chart.
- **Do:** Pass your own data for every prop before shipping. Left out, a prop falls back to the invented sample product, Lumen, from sample-content, which is only there so the template previews with nothing filled in. **Don't:** Ship the sample product, people and numbers to real users, such as Maya Okafor's account menu or a credit balance nobody has.

### Accessibility
- The person's name is the page h1 and labels the sidebar; each tab panel starts with a visually hidden h2.
- Follow is a toggle button (`aria-pressed`) whose label changes between Follow and Following.
- The icon-only Share button is named "Share &lt;first name>'s profile".
- Stats are a description list, read as label then value even though the number shows first.

### Design tokens
`--background` · `--card` · `--foreground` · `--muted-foreground` · `--separator` · `--primary` · `--secondary` · `--glass` · `--glass-border`

