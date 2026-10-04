# image-studio-page (block)

A full image-studio page template: the top navigation, a centered uppercase hero with one lime word that gives way to the generation feed once there are results, and the prompt composer docked to the bottom of the window. Results open in the lightbox inspector. Composes top-navigation, prompt-composer, generation-feed and lightbox-inspector.

### When to use
- You are building the page where people write a prompt and get images back, and want the whole screen wired up rather than placing each block yourself.
- A first-time visitor should see one inviting headline, and a returning one should see their history with the composer still in reach.

### Reach for instead
- **video-studio-page** — when the output is video and needs a settings rail with duration, quality and references
- **studio-home-page** — when the page is the app's home and should lead to projects as well as a quick prompt
- **prompt-composer** — when you only need the composer inside a page you are laying out yourself

### Rules
- **Do:** Set one word of the hero headline in lime with `HeadingAccent`, so it echoes the lime Generate button. **Don't:** Turn the whole headline lime; it competes with Generate, the page's one lime action.
- **Do:** Keep the composer docked to the bottom of the window so it stays in reach however far the feed scrolls. **Don't:** Put the composer above the feed, so people scroll back to the top every time they want another take.
- **Do:** Pass the real history in `items`; the hero shows only while it is empty and the feed takes over with the first result. **Don't:** Keep the hero above a full feed, pushing the newest results below the fold.
- **Do:** Pass `loading` until the history request finishes, so returning people see skeleton tiles rather than a flash of the hero. **Don't:** Render with an empty `items` array while the history is still loading.
- **Do:** Pass your own data for every prop before shipping. Left out, a prop falls back to the invented sample product, Lumen, from sample-content, which is only there so the template previews with nothing filled in. **Don't:** Ship the sample product, people and numbers to real users, such as Maya Okafor's account menu or a credit balance nobody has.

### Accessibility
- The page has one h1: the hero headline on a first visit, and a visually hidden "Image studio" (`pageTitle`) once the feed shows.
- The top bar is the banner landmark and everything else sits in `main`; the composer is a form labelled "Image prompt".
- The docked composer stays in the tab order after the feed, so keyboard users reach it without scrolling back up.
- Tiles open the lightbox inspector, which traps focus, starts on Close and returns focus to the tile when it closes.

### Design tokens
`--background` · `--foreground` · `--muted-foreground` · `--brand-text` · `--card` · `--shadow-popover`

