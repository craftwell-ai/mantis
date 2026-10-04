# explore-page (block)

A full community page: the app top bar, an uppercase headline with one lime word, a row of category pills, and the masonry media grid of everyone's work. Clicking a picture opens the lightbox inspector on it, and its arrows step through the selected category. Likes update in place.

### When to use
- You need the whole explore or community gallery page of a signed-in creative app, not just the grid.
- People browse other people's work by category and open one piece to read its prompt and recreate it.

### Reach for instead
- **media-grid** — when the page already has its own shell and you only need the gallery
- **profile-page** — when the work belongs to one person and their identity leads the page
- **generation-feed** — when the work is the viewer's own history rather than the community's

### Rules
- **Do:** Keep the pills to one row of short category names; the first is All and shows everything. **Don't:** Mix sort orders, tools and categories in the same pill row.
- **Do:** Let the lightbox arrows move through the category on screen, so Next shows the picture beside it in the grid. **Don't:** Open a viewer that steps through every item when the grid is filtered.
- **Do:** Pass `onRecreate` and `recreateCost`, so Recreate, with its cost, is the one lime button on the page. **Don't:** Add other lime buttons to the page header or pills.
- **Do:** Pass your own data for every prop before shipping. Left out, a prop falls back to the invented sample product, Lumen, from sample-content, which is only there so the template previews with nothing filled in. **Don't:** Ship the sample product, people and numbers to real users, such as Maya Okafor's account menu or a credit balance nobody has.

### Accessibility
- The headline is the page's only h1; the category pills are a tab list named "Categories" and each panel holds the grid for its category.
- Pictures open through buttons named "Open &lt;alt>, by &lt;author>"; the lightbox traps focus and the arrow keys move between pictures.
- An empty category shows an empty state with an h2 that says which category is empty.
- The pill row scrolls sideways on phones instead of wrapping.

### Design tokens
`--background` · `--foreground` · `--muted-foreground` · `--brand-text` · `--separator` · `--glass` · `--field` · `--ring`

