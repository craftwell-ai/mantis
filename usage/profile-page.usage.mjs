export const usage = {
  name: 'profile-page',
  kind: 'block',
  summary: 'A person\'s page in a signed-in creative app: a sidebar card with avatar, name, handle, bio, location, stats and Follow (or Edit profile on your own page), beside tabs for their generations, the work they liked and their posts. Each tab has its own empty state, worded for the owner with a way to start, or for a visitor with no action. Pictures open in the lightbox inspector.',
  useWhen: [
    'You are building a creator\'s public profile or the viewer\'s own profile page.',
    'One person\'s work, likes and posts need to be browsed in separate tabs with honest empty states.',
  ],
  alternatives: [
    { name: 'explore-page', when: 'the work comes from everyone and is browsed by category' },
    { name: 'settings-nav', when: 'the page edits account details rather than showing the person\'s work' },
  ],
  rules: [
    {
      id: 'one-filled-action',
      do: 'Show Follow on someone else\'s profile and Edit profile on your own; never both, and keep Share as a glass icon button.',
      dont: 'Put Follow, Message and Edit side by side as filled buttons.',
      visual: false,
    },
    {
      id: 'empty-states-per-tab',
      do: 'Write each tab\'s empty state for who is looking: the owner gets a way to start, a visitor gets a plain sentence.',
      dont: 'Show "You have no generations" with a Create button to a visitor.',
      visual: false,
    },
    {
      id: 'stats-are-counts',
      do: 'Keep stats to two to four short counts, already formatted ("12.4K").',
      dont: 'Turn the stats row into badges or a chart.',
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
    'The person\'s name is the page h1 and labels the sidebar; each tab panel starts with a visually hidden h2.',
    'Follow is a toggle button (`aria-pressed`) whose label changes between Follow and Following.',
    'The icon-only Share button is named "Share <first name>\'s profile".',
    'Stats are a description list, read as label then value even though the number shows first.',
  ],
  tokens: ['--background', '--card', '--foreground', '--muted-foreground', '--separator', '--primary', '--secondary', '--glass', '--glass-border'],
}
