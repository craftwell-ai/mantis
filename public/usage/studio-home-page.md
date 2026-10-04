# studio-home-page (block)

A studio home page template: the top navigation, an uppercase hero with one lime word and a short line, the prompt composer right under it, then "Recent projects" as a grid of project cards that opens with a dashed New project tile, with skeletons while loading and an empty state before there are any projects. Composes top-navigation, prompt-composer, project-card and empty-state.

### When to use
- You are building the first page people land on after signing in, where they can start a generation straight away or go back to a project.
- The product groups work into projects and the home page should show the most recent ones.

### Reach for instead
- **image-studio-page** — when the page is the studio itself and should fill with results as they arrive
- **asset-library-page** — when people browse individual files and generations, not projects
- **project-card** — when you only need the cards in a layout of your own

### Rules
- **Do:** Keep the composer's lime Generate as the page's one filled button; New project is a dashed tile, or a glass button in the empty state. **Don't:** Add a white New project button beside the lime Generate, so two filled buttons compete.
- **Do:** Show the most recent projects, about six, and link to the full list with `allProjectsHref`. **Don't:** Pour every project onto the home page and bury the composer above a long scroll.
- **Do:** Pass your own data for every prop before shipping. Left out, a prop falls back to the invented sample product, Lumen, from sample-content, which is only there so the template previews with nothing filled in. **Don't:** Ship the sample product, people and numbers to real users, such as Maya Okafor's account menu or a credit balance nobody has.

### Accessibility
- The hero headline is the page's h1; "Recent projects" is an h2 and the empty state's title an h3, so the outline reads in order.
- Each project card's name is a link that covers the card, and its menu button is named "More actions for &lt;project>".
- The New project tile is a real button with a visible label.
- The projects section sets `aria-busy` while loading.

### Design tokens
`--background` · `--foreground` · `--muted-foreground` · `--brand-text` · `--glass` · `--glass-border` · `--ring` · `--skeleton`

