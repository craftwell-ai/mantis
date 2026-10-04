# feed-post (block)

One post in a community feed: the author with avatar, time and a Follow button, an optional title and text, up to four pictures with a small tool label, and a footer of like, dislike and comment counts that double as actions, plus share, views and a more menu.

### When to use
- A community page lists what people have shared, newest or most popular first.
- Someone's profile shows their posts with the same reactions as the main feed.

### Reach for instead
- **media-grid** — when the feed is about the pictures alone, with no text or discussion
- **card** — when the content is not a person's post, such as an announcement

### Rules
- **Do:** Show reactions and comments as small icon-and-number toggles in one quiet row. **Don't:** Add big labelled Like, Comment and Share buttons under every post.
- **Do:** Keep Follow a small glass button in the author row. **Don't:** Make Follow a white or lime filled button that competes with the media.
- **Do:** Pass counts that already include the viewer's reaction, with `defaultReaction` set to match. **Don't:** Pass counts without the viewer's reaction, so the number jumps by one on load.

### Accessibility
- The post is an `article` named "Post by &lt;author>"; an optional title is an `h3`.
- Like and Dislike are toggle buttons with names such as "Like, 88" and announce their pressed state; the pressed like is lime as well, so color is not the only signal.
- Follow names the author for screen readers ("Follow Mira Okafor") and changes its label to Following.
- The more menu trigger is labelled "More actions for the post by &lt;author>".

### Design tokens
`--card` · `--glass` · `--glass-panel` · `--field` · `--secondary` · `--brand-text` · `--muted-foreground` · `--foreground` · `--popover` · `--ring`

