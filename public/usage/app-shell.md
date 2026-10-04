# app-shell (block)

The signed-in page frame: the top navigation bar across the top with the account menu wired into it, and one content area under it that scrolls on its own so the bar never moves. It fills the viewport, has a skip link to the content, and takes the page as `children`.

### When to use
- A signed-in page needs the app's usual top bar and one column of content, such as a library, a gallery or a studio home.
- You are starting any new app screen and want the same frame, search shortcut and account menu as every other page.

### Reach for instead
- **app-shell-sidebar** — when the section has many destinations (projects, tools, history) that need a left sidebar as well as the top bar
- **canvas-shell** — when the page is a full-bleed board where the work fills the screen and the chrome floats over it
- **top-navigation** — when you need only the bar, inside a layout you already have

### Rules
- **Do:** Let the content area be the one thing that scrolls, with the bar fixed above it. **Don't:** Nest another full-height scrolling panel inside the content; people lose track of which part moves.
- **Do:** Pass the person through `account` so the shell builds the account menu in the bar. **Don't:** Place a second avatar or account button inside the page content.
- **Do:** Pass your own data for every prop before shipping. Left out, a prop falls back to the invented sample product, Lumen, from sample-content, which is only there so the template previews with nothing filled in. **Don't:** Ship the sample product, people and numbers to real users, such as Maya Okafor's account menu or a credit balance nobody has.

### Accessibility
- A "Skip to content" link is the first tab stop and moves focus straight to the page, past the bar.
- The page sits in the only `main` landmark; the bar is a `header` with a `nav` named "Main".
- The content area is focusable, so keyboard users can scroll it with the arrow keys even when the page holds no links or buttons.
- Give each page one `h1`; the shell adds no heading of its own.

### Design tokens
`--background` · `--foreground` · `--primary` · `--primary-foreground` · `--ring`

