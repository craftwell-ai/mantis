export const usage = {
  name: 'account-menu',
  kind: 'block',
  summary: 'The menu that opens from the avatar: who is signed in (name, email, plan), a credit meter showing what is left this month, a couple of ways to get more credits, then settings, help and sign out.',
  useWhen: [
    'A signed-in app needs one place, opened from the avatar in the top navigation, for the person\'s identity, credit balance and account destinations.',
    'People spend credits and should see at a glance how many are left and how to top up.',
  ],
  alternatives: [
    { name: 'dropdown-menu', when: 'the menu only needs a few actions and no identity or credit panel' },
    { name: 'sheet', when: 'account details need room for forms or long lists; open a side panel instead of a menu' },
  ],
  rules: [
    {
      id: 'sign-out-last',
      do: 'Keep Sign out as the last row, under a separator, away from everyday destinations.',
      dont: 'Put Sign out among Settings and Help, or at the top, where a quick click ends the session by accident.',
      visual: true,
    },
    {
      id: 'few-upsells',
      do: 'Offer at most two upsell rows inside the credit panel, each tied to running out of credits or speed. The first row\'s pill is the menu\'s one lime action; any second pill is glass.',
      dont: 'Fill the menu with promotions, or make every upsell pill lime so none of them leads.',
      visual: true,
    },
    {
      id: 'meter-shows-what-is-left',
      do: 'Pass real `used` and `total` numbers so the lime dots show what is left and the caption states both figures.',
      dont: 'Show a meter with no numbers, or a percentage without the credit count people actually spend.',
      visual: false,
    },
  ],
  a11y: [
    'The trigger is the avatar button, named "Account menu for <name>"; arrow keys move through the rows once it is open.',
    'Every row, including the identity row and the credit panel, is a single menu item, so nothing inside the menu is a nested button.',
    'The dotted meter is hidden from screen readers; the row reads "Credits, 1,240 left, 1,760 of 3,000 used this month".',
    'Escape closes the menu and returns focus to the avatar.',
  ],
  tokens: ['--popover', '--popover-foreground', '--glass', '--brand', '--muted-foreground', '--accent', '--divider', '--badge-neutral', '--badge-new'],
}
