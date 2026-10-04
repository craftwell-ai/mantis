export const usage = {
  name: 'share-dialog',
  kind: 'block',
  summary: 'A dialog for sharing a project: type emails that turn into chips, pick a role for each invitee, choose who can open it (private, anyone with the link, public) as radio cards, copy the link, then Share.',
  useWhen: [
    'Someone wants to invite collaborators to a project, board or canvas and decide what each can do.',
    'People need to change who can open something, from invited people only to public, and copy its link.',
  ],
  alternatives: [
    { name: 'popover', when: 'the only thing to do is copy a link; a small popover with an input group is enough' },
    { name: 'dialog', when: 'sharing has a single fixed audience, such as publishing to the community, and needs no invite list' },
  ],
  rules: [
    {
      id: 'visibility-as-cards',
      do: 'Show visibility as three radio cards, each with an icon, a short name and a line on who can open it.',
      dont: 'Hide visibility in a select or a bare switch, where people cannot compare what each choice exposes.',
      visual: true,
    },
    {
      id: 'role-per-invitee',
      do: 'Give each pending invitee their own role select, starting at the least access (Can view).',
      dont: 'Apply one role to everyone in the field, or default new people to editing rights.',
      visual: false,
    },
    {
      id: 'say-what-the-link-does',
      do: 'Say under the link who it opens for under the chosen visibility.',
      dont: 'Show a link with no hint that, while the project is private, it only works for invited people.',
      visual: false,
    },
    {
      id: 'one-white-button',
      do: 'Keep Share as the only filled white button; Copy link is secondary and Cancel is ghost.',
      dont: 'Add a second white Invite button inside the field next to Share.',
      visual: false,
    },
  ],
  a11y: [
    'The invite field has a visible label; Enter, comma or space turns the typed address into a chip, Backspace on an empty field removes the last chip, and each chip has a labelled remove button.',
    'An address that is not an email is kept in the field and explained in an alert under it.',
    'Each role select is named for its invitee ("Role for leo@studio.com"); the visibility cards are a radio group named by its legend.',
    'Copying the link is announced through a status message.',
  ],
  tokens: ['--dialog', '--field', '--secondary', '--glass', '--brand', '--input', '--chip', '--chip-border', '--muted-foreground', '--primary', '--destructive', '--ring'],
}
