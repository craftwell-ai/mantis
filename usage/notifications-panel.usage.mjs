export const usage = {
  name: 'notifications-panel',
  kind: 'block',
  summary: 'The bell menu in the top bar: tabs for All, Requests and Unread, rows with an avatar or icon, the message, a time and an unread dot, Accept and Decline right in request rows, Mark all as read, and an empty state for each tab.',
  useWhen: [
    'People need to see what happened while they were away, such as comments, likes, finished renders and invites, without leaving the page they are on.',
    'Some notifications ask for a decision, such as an invite to a project, and people should answer in place.',
  ],
  alternatives: [
    { name: 'sonner', when: 'the message is about something the person just did and needs no record afterwards' },
    { name: 'sheet', when: 'the activity history is long and people read it at length; render the panel with mode="inline" inside a sheet' },
  ],
  rules: [
    {
      id: 'answer-requests-in-place',
      do: 'Put Accept and Decline in the request row itself, with Accept as a secondary button and Decline as ghost.',
      dont: 'Make people open a request on another page to answer it, or show two loud white buttons in every row.',
      visual: true,
    },
    {
      id: 'actor-first',
      do: 'Start each message with who did it, then what and to which item: "Mara Quinn commented on Desert Bloom".',
      dont: 'Write passive messages such as "A comment was added", which hide who to reply to.',
      visual: false,
    },
    {
      id: 'unread-is-not-color-only',
      do: 'Mark unread rows with the dot, a tinted row and the spoken word "Unread".',
      dont: 'Rely on a color change alone to show what is new.',
      visual: false,
    },
    {
      id: 'empty-tabs-explain',
      do: 'Give each tab its own empty message that says what would appear there.',
      dont: 'Show a blank panel, or the same "Nothing here" on every tab.',
      visual: false,
    },
  ],
  a11y: [
    'The bell button names the unread count ("Notifications, 3 unread"); the visual count badge is hidden from screen readers so it is not read twice.',
    'The panel is a section named by its "Notifications" heading; tabs follow the WAI-ARIA tabs pattern with arrow-key movement.',
    'Rows that open something are buttons; request rows keep Accept and Decline as separate buttons, and the answer is announced through a status message.',
  ],
  tokens: ['--background', '--glass', '--glass-hover', '--glass-border', '--secondary', '--primary', '--primary-foreground', '--muted-foreground', '--separator', '--ring'],
}
