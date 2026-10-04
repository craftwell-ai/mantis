export const usage = {
  name: 'canvas-shell',
  kind: 'block',
  summary: 'The chrome of a board page, with no canvas engine: a full-bleed dotted (or blank) board, a minimal floating top bar with the logo slot, board name, undo, redo and Share, a floating tool bar at the bottom (select, hand, text, shapes, an Add menu, and zoom out, zoom percent and zoom in), and a Layers and Properties panel on the right that becomes a sheet when the shell is narrower than 1024px (it measures its own width, not the window). Board content goes in as children and scales with the zoom.',
  useWhen: [
    'You are building a free-form board where people arrange generations, notes and shapes, and need the surrounding chrome.',
    'You need a prototype or loading state of a board page before the real canvas engine is wired in.',
  ],
  alternatives: [
    { name: 'app-shell', when: 'the page is a normal scrolling document, not a board' },
    { name: 'studio-settings-panel', when: 'the page generates media from a settings column beside a preview, rather than arranging it freely' },
  ],
  rules: [
    {
      id: 'chrome-floats',
      do: 'Float the bars and panel over the board so the work runs to every edge.',
      dont: 'Box the board in with solid bars that take space away from it.',
      visual: true,
    },
    {
      id: 'tools-are-few',
      do: 'Keep the tool bar to the handful of tools people switch between constantly, each with a one-key shortcut.',
      dont: 'Move every action into the tool bar; occasional actions belong in the Add menu or the panel.',
      visual: false,
    },
    {
      id: 'share-is-the-one-fill',
      do: 'Let Share be the only filled button; the tools stay ghost and the chosen tool turns white.',
      dont: 'Color the active tool lime; lime marks the screen\'s one main action, and a lime tool competes with it.',
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
    'The board name is the page `h1`, and the board itself is the `main` landmark named after it.',
    'Every icon-only control has a name and a tooltip; tool tooltips show their shortcut key (V, H, T, R), which is ignored while typing in a field.',
    'The tool picker is a toggle group named "Tool", so the chosen tool is announced as pressed, not shown by color alone.',
    'The zoom percent is a button that resets to 100% and says the current zoom in its name.',
  ],
  tokens: ['--background', '--foreground', '--muted-foreground', '--glass', '--glass-panel', '--glass-border', '--primary', '--primary-foreground', '--tooltip', '--ring'],
}
