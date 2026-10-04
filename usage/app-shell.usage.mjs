export const usage = {
  name: 'app-shell',
  kind: 'block',
  summary: 'The signed-in page frame: the top navigation bar across the top with the account menu wired into it, and one content area under it that scrolls on its own so the bar never moves. It fills the viewport, has a skip link to the content, and takes the page as `children`.',
  useWhen: [
    'A signed-in page needs the app\'s usual top bar and one column of content, such as a library, a gallery or a studio home.',
    'You are starting any new app screen and want the same frame, search shortcut and account menu as every other page.',
  ],
  alternatives: [
    { name: 'app-shell-sidebar', when: 'the section has many destinations (projects, tools, history) that need a left sidebar as well as the top bar' },
    { name: 'canvas-shell', when: 'the page is a full-bleed board where the work fills the screen and the chrome floats over it' },
    { name: 'top-navigation', when: 'you need only the bar, inside a layout you already have' },
  ],
  rules: [
    {
      id: 'one-scroll-area',
      do: 'Let the content area be the one thing that scrolls, with the bar fixed above it.',
      dont: 'Nest another full-height scrolling panel inside the content; people lose track of which part moves.',
      visual: true,
    },
    {
      id: 'account-through-the-shell',
      do: 'Pass the person through `account` so the shell builds the account menu in the bar.',
      dont: 'Place a second avatar or account button inside the page content.',
      visual: false,
    },
    {
      id: 'replace-sample-content',
      do: 'Pass your own data for every prop before shipping. Left out, a prop falls back to the invented sample product, Lumen, from sample-content, which is only there so the template previews with nothing filled in.',
      dont: 'Ship the sample product, people and numbers to real users, such as Maya Okafor\'s account menu or a credit balance nobody has.',
      visual: false,
    },
  ],
  a11y: [
    'A "Skip to content" link is the first tab stop and moves focus straight to the page, past the bar.',
    'The page sits in the only `main` landmark; the bar is a `header` with a `nav` named "Main".',
    'The content area is focusable, so keyboard users can scroll it with the arrow keys even when the page holds no links or buttons.',
    'Give each page one `h1`; the shell adds no heading of its own.',
  ],
  tokens: ['--background', '--foreground', '--primary', '--primary-foreground', '--ring'],
}
