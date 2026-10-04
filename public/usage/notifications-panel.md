# notifications-panel (block)

The bell menu in the top bar: tabs for All, Requests and Unread, rows with an avatar or icon, the message, a time and an unread dot, Accept and Decline right in request rows, Mark all as read, and an empty state for each tab.

### When to use
- People need to see what happened while they were away, such as comments, likes, finished renders and invites, without leaving the page they are on.
- Some notifications ask for a decision, such as an invite to a project, and people should answer in place.

### Reach for instead
- **sonner** — when the message is about something the person just did and needs no record afterwards
- **sheet** — when the activity history is long and people read it at length; render the panel with mode="inline" inside a sheet

### Rules
- **Do:** Put Accept and Decline in the request row itself, with Accept as a secondary button and Decline as ghost. **Don't:** Make people open a request on another page to answer it, or show two loud white buttons in every row.
- **Do:** Start each message with who did it, then what and to which item: "Mara Quinn commented on Desert Bloom". **Don't:** Write passive messages such as "A comment was added", which hide who to reply to.
- **Do:** Mark unread rows with the dot, a tinted row and the spoken word "Unread". **Don't:** Rely on a color change alone to show what is new.
- **Do:** Give each tab its own empty message that says what would appear there. **Don't:** Show a blank panel, or the same "Nothing here" on every tab.

### Accessibility
- The bell button names the unread count ("Notifications, 3 unread"); the visual count badge is hidden from screen readers so it is not read twice.
- The panel is a section named by its "Notifications" heading; tabs follow the WAI-ARIA tabs pattern with arrow-key movement.
- Rows that open something are buttons; request rows keep Accept and Decline as separate buttons, and the answer is announced through a status message.

### Design tokens
`--background` · `--glass` · `--glass-hover` · `--glass-border` · `--secondary` · `--primary` · `--primary-foreground` · `--muted-foreground` · `--separator` · `--ring`

