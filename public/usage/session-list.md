# session-list (block)

The devices signed in to an account: one row per session with a device icon, browser and system, location and last activity, a "This device" marker on the current one, a Sign out button on the others and a confirmed "Sign out everywhere else".

### When to use
- A security or account settings page lets people review where they are signed in and end sessions they do not recognise.
- Someone suspects their account is in use elsewhere and needs one action to sign every other device out.

### Reach for instead
- **settings-section** — when the page holds ordinary settings, such as profile or notifications, not a list of sessions
- **table** — when an admin reviews many members' sessions at once and needs sorting and columns

### Rules
- **Do:** List the current session first with a "This device" badge and no Sign out button. **Don't:** Offer Sign out on the current device in this list; it ends the session people are using to secure their account.
- **Do:** Confirm "Sign out everywhere else" in an alert dialog that says how many devices it affects. **Don't:** Sign every device out on one click; a mis-tap logs a whole team's shared screens out.
- **Do:** Give each row a location and a last-active time written for people, such as "Lisbon, Portugal · 2 hours ago". **Don't:** Show raw IP addresses or ISO timestamps that nobody can recognise at a glance.

### Accessibility
- The section is named by its heading. Each Sign out button names the device it ends, such as "Sign out Safari on iOS 18, Lisbon, Portugal".
- Device icons are decorative; the browser and system text says what the device is.
- The result of each sign-out is announced through a status region; buttons show a spinner with a label while it runs.

### Design tokens
`--card` · `--glass` · `--muted-foreground` · `--divider` · `--secondary` · `--destructive` · `--border`

